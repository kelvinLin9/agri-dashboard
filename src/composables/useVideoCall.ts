/**
 * 視訊通話 Composable
 * 處理 WebRTC 視訊通話的完整邏輯
 */
import { ref, computed, onUnmounted, shallowRef } from 'vue'
import { io, Socket } from 'socket.io-client'
import { createLogger } from '@/utils/logger'

const log = createLogger('VideoCall')

/** 通話類型 */
export type CallType = 'video' | 'audio'

/** 通話狀態 */
export type CallState =
  | 'idle'           // 閒置
  | 'calling'        // 撥號中
  | 'incoming'       // 來電
  | 'connecting'     // 連線中
  | 'connected'      // 通話中
  | 'ended'          // 已結束

/** 來電資訊 */
export interface IncomingCall {
  callId: string
  callerId: string
  callerName: string
  type: CallType
}

/** 通話選項 */
export interface CallOptions {
  type?: CallType
  onEnded?: (reason: string) => void
}

/** ICE 伺服器設定 */
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export const useVideoCall = () => {
  // ==================== 狀態 ====================

  /** Socket.IO 連線 */
  const socket = shallowRef<Socket | null>(null)

  /** 是否已連線 */
  const isConnected = ref(false)

  /** 通話狀態 */
  const callState = ref<CallState>('idle')

  /** 目前通話 ID */
  const currentCallId = ref<string | null>(null)

  /** 目標用戶 ID */
  const targetUserId = ref<string | null>(null)

  /** 來電資訊 */
  const incomingCall = ref<IncomingCall | null>(null)

  /** 通話類型 */
  const callType = ref<CallType>('video')

  /** RTCPeerConnection */
  const peerConnection = shallowRef<RTCPeerConnection | null>(null)

  /** 本地媒體串流 */
  const localStream = shallowRef<MediaStream | null>(null)

  /** 遠端媒體串流 */
  const remoteStream = shallowRef<MediaStream | null>(null)

  /** 通話結束回調 */
  let onEndedCallback: ((reason: string) => void) | null = null

  // ==================== 計算屬性 ====================

  const isInCall = computed(() =>
    ['calling', 'incoming', 'connecting', 'connected'].includes(callState.value),
  )

  // ==================== WebSocket 連線 ====================

  /**
   * 連線到視訊通話信令伺服器
   */
  const connect = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      log.warn('No access token, cannot connect')
      return
    }

    // 如果已連線則跳過
    if (socket.value?.connected) {
      log.debug('Already connected')
      return
    }

    // 構建 WebSocket URL
    let wsUrl: string
    if (import.meta.env.VITE_API_URL) {
      const apiUrl = import.meta.env.VITE_API_URL
      wsUrl =
        apiUrl
          .replace('https://', 'wss://')
          .replace('http://', 'ws://')
          .replace('/api', '') + '/video-call'
    } else {
      wsUrl = 'ws://localhost:3000/video-call'
    }

    log.debug('Connecting to video-call server', { wsUrl })

    socket.value = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    // 連線事件
    socket.value.on('connect', () => {
      log.info('Connected to video-call server')
      isConnected.value = true
    })

    socket.value.on('disconnect', (reason) => {
      log.info('Disconnected', { reason })
      isConnected.value = false
    })

    socket.value.on('connect_error', (error) => {
      log.error('Connection error', { message: error.message })
      isConnected.value = false
    })

    // 通話事件
    socket.value.on('call:incoming', handleIncomingCall)
    socket.value.on('call:accepted', handleCallAccepted)
    socket.value.on('call:rejected', handleCallRejected)
    socket.value.on('call:offer', handleOffer)
    socket.value.on('call:answer', handleAnswer)
    socket.value.on('call:ice', handleIceCandidate)
    socket.value.on('call:ended', handleCallEnded)
  }

  /**
   * 斷線連線
   */
  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
      log.info('Disconnected from video-call server')
    }
  }

  // ==================== 通話控制 ====================

  /**
   * 發起通話
   */
  const startCall = async (userId: string, options?: CallOptions) => {
    if (!socket.value?.connected) {
      log.error('Not connected to server')
      return { success: false, error: 'NOT_CONNECTED' }
    }

    if (isInCall.value) {
      log.warn('Already in a call')
      return { success: false, error: 'ALREADY_IN_CALL' }
    }

    try {
      callState.value = 'calling'
      targetUserId.value = userId
      callType.value = options?.type || 'video'
      onEndedCallback = options?.onEnded || null

      // 取得本地媒體
      await getLocalMedia()

      // 發送通話請求
      const response = await emitWithAck('call:initiate', {
        targetUserId: userId,
        type: callType.value,
      })

      if (response.success) {
        currentCallId.value = response.callId
        log.info('Call initiated', { callId: response.callId })
        return { success: true, callId: response.callId }
      } else {
        cleanup()
        return { success: false, error: response.error, message: response.message }
      }
    } catch (error) {
      log.error('Failed to start call', error)
      cleanup()
      return { success: false, error: 'FAILED' }
    }
  }

  /**
   * 接聽來電
   */
  const acceptCall = async () => {
    if (!incomingCall.value) {
      log.warn('No incoming call to accept')
      return
    }

    try {
      callState.value = 'connecting'
      currentCallId.value = incomingCall.value.callId
      targetUserId.value = incomingCall.value.callerId
      callType.value = incomingCall.value.type

      // 取得本地媒體
      await getLocalMedia()

      // 建立 PeerConnection
      await createPeerConnection()

      // 通知對方已接聽
      socket.value?.emit('call:accept', {
        callerId: incomingCall.value.callerId,
        callId: incomingCall.value.callId,
      })

      incomingCall.value = null
      log.info('Call accepted')
    } catch (error) {
      log.error('Failed to accept call', error)
      cleanup()
    }
  }

  /**
   * 拒絕來電
   */
  const rejectCall = () => {
    if (!incomingCall.value) return

    socket.value?.emit('call:reject', {
      callerId: incomingCall.value.callerId,
      callId: incomingCall.value.callId,
    })

    incomingCall.value = null
    log.info('Call rejected')
  }

  /**
   * 結束通話
   */
  const endCall = (reason = '用戶掛斷') => {
    if (!isInCall.value) return

    socket.value?.emit('call:end', {
      targetUserId: targetUserId.value,
      callId: currentCallId.value,
      reason,
    })

    cleanup()
    log.info('Call ended', { reason })
  }

  /**
   * 切換靜音
   */
  const toggleMute = () => {
    if (localStream.value) {
      const audioTrack = localStream.value.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return !audioTrack.enabled // 返回是否靜音
      }
    }
    return false
  }

  /**
   * 切換視訊
   */
  const toggleVideo = () => {
    if (localStream.value) {
      const videoTrack = localStream.value.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return !videoTrack.enabled // 返回是否關閉視訊
      }
    }
    return false
  }

  // ==================== 事件處理 ====================

  /** 處理來電 */
  const handleIncomingCall = (data: IncomingCall) => {
    log.info('Incoming call', data)
    incomingCall.value = data
    callState.value = 'incoming'
  }

  /** 處理對方接聽 */
  const handleCallAccepted = async () => {
    log.info('Call accepted by remote')
    callState.value = 'connecting'

    try {
      // 建立 PeerConnection 並發送 Offer
      await createPeerConnection()

      const offer = await peerConnection.value!.createOffer()
      await peerConnection.value!.setLocalDescription(offer)

      socket.value?.emit('call:offer', {
        targetUserId: targetUserId.value,
        sdp: offer,
      })

      log.debug('Offer sent')
    } catch (error) {
      log.error('Failed to create offer', error)
      endCall('連線失敗')
    }
  }

  /** 處理對方拒絕 */
  const handleCallRejected = (data: { reason: string }) => {
    log.info('Call rejected', data)
    cleanup()
    onEndedCallback?.(data.reason)
  }

  /** 處理收到 Offer */
  const handleOffer = async (data: { senderId: string; sdp: RTCSessionDescriptionInit }) => {
    log.debug('Received offer from', data.senderId)

    try {
      await peerConnection.value!.setRemoteDescription(data.sdp)

      const answer = await peerConnection.value!.createAnswer()
      await peerConnection.value!.setLocalDescription(answer)

      socket.value?.emit('call:answer', {
        targetUserId: data.senderId,
        sdp: answer,
      })

      log.debug('Answer sent')
    } catch (error) {
      log.error('Failed to handle offer', error)
      endCall('連線失敗')
    }
  }

  /** 處理收到 Answer */
  const handleAnswer = async (data: { senderId: string; sdp: RTCSessionDescriptionInit }) => {
    log.debug('Received answer from', data.senderId)

    try {
      await peerConnection.value!.setRemoteDescription(data.sdp)
    } catch (error) {
      log.error('Failed to handle answer', error)
      endCall('連線失敗')
    }
  }

  /** 處理 ICE Candidate */
  const handleIceCandidate = async (data: {
    senderId: string
    candidate: RTCIceCandidateInit
  }) => {
    try {
      if (peerConnection.value && data.candidate) {
        await peerConnection.value.addIceCandidate(data.candidate)
      }
    } catch (error) {
      log.warn('Failed to add ICE candidate', error)
    }
  }

  /** 處理通話結束 */
  const handleCallEnded = (data: { reason: string }) => {
    log.info('Call ended by remote', data)
    cleanup()
    onEndedCallback?.(data.reason)
  }

  // ==================== 工具函式 ====================

  /** 取得本地媒體 */
  const getLocalMedia = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType.value === 'video',
      }

      localStream.value = await navigator.mediaDevices.getUserMedia(constraints)
      log.debug('Got local media', { tracks: localStream.value.getTracks().length })
    } catch (error) {
      log.error('Failed to get local media', error)
      throw error
    }
  }

  /** 建立 RTCPeerConnection */
  const createPeerConnection = async () => {
    peerConnection.value = new RTCPeerConnection(ICE_SERVERS)

    // 加入本地軌道
    localStream.value?.getTracks().forEach((track) => {
      peerConnection.value!.addTrack(track, localStream.value!)
    })

    // 處理遠端軌道
    peerConnection.value.ontrack = (event) => {
      log.debug('Remote track received', { kind: event.track.kind })
      if (!remoteStream.value) {
        remoteStream.value = new MediaStream()
      }
      remoteStream.value.addTrack(event.track)
    }

    // 處理 ICE Candidate
    peerConnection.value.onicecandidate = (event) => {
      if (event.candidate) {
        socket.value?.emit('call:ice', {
          targetUserId: targetUserId.value,
          candidate: event.candidate,
        })
      }
    }

    // 處理連線狀態變化
    peerConnection.value.onconnectionstatechange = () => {
      const state = peerConnection.value?.connectionState
      log.debug('Connection state changed', { state })

      if (state === 'connected') {
        callState.value = 'connected'
      } else if (state === 'failed' || state === 'disconnected') {
        endCall('連線中斷')
      }
    }

    log.debug('PeerConnection created')
  }

  /** 清理資源 */
  const cleanup = () => {
    // 停止本地媒體
    localStream.value?.getTracks().forEach((track) => track.stop())
    localStream.value = null

    // 停止遠端媒體
    remoteStream.value?.getTracks().forEach((track) => track.stop())
    remoteStream.value = null

    // 關閉 PeerConnection
    peerConnection.value?.close()
    peerConnection.value = null

    // 重置狀態
    callState.value = 'ended'
    currentCallId.value = null
    targetUserId.value = null
    incomingCall.value = null

    // 延遲重置為 idle
    setTimeout(() => {
      if (callState.value === 'ended') {
        callState.value = 'idle'
      }
    }, 100)
  }

  /** 發送並等待回應 */
  const emitWithAck = <T>(event: string, data: unknown): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!socket.value) {
        reject(new Error('Not connected'))
        return
      }

      socket.value.emit(event, data, (response: T) => {
        resolve(response)
      })
    })
  }

  // ==================== 生命週期 ====================

  onUnmounted(() => {
    if (isInCall.value) {
      endCall('頁面離開')
    }
    disconnect()
  })

  return {
    // 狀態
    isConnected,
    callState,
    currentCallId,
    incomingCall,
    callType,
    localStream,
    remoteStream,
    isInCall,

    // 連線
    connect,
    disconnect,

    // 通話控制
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  }
}
