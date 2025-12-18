# WebRTC 完整實作教學指南

本文件旨在詳細說明 WebRTC 的核心概念、重要 API 詳細用法，以及在本日沐 (SunBathe) 專案中的實際應用架構。

## 目錄

1.  [WebRTC 核心概念](#1-webrtc-核心概念)
2.  [WebRTC API 詳解](#2-webrtc-api-詳解)
3.  [系統架構設計](#3-系統架構設計)
4.  [前端實作 (Vue 3 + Composable)](#4-前端實作-vue-3--composable)
5.  [後端實作 (NestJS + Socket.IO)](#5-後端實作-nestjs--socketio)
6.  [連線流程詳解](#6-連線流程詳解)
7.  [除錯與常見問題](#7-除錯與常見問題)

---

## 1. WebRTC 核心概念

WebRTC (Web Real-Time Communication) 是一個讓瀏覽器之間可以進行 P2P (Peer-to-Peer) 即時通訊的技術。

### 關鍵術語

| 術語          | 全名                                   | 說明                                                                                                                      |
| :------------ | :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **P2P**       | Peer-to-Peer                           | 點對點連線，數據直接在兩個用戶端之間傳輸，不經過伺服器（除了信令）。                                                      |
| **Signaling** | 信令                                   | WebRTC 本身不處理「如何發現對方」，需要透過一個中間伺服器來交換連線資訊（SDP, ICE Candidates）。我們使用 Socket.IO 實作。 |
| **SDP**       | Session Description Protocol           | 用來描述媒體能力（編碼格式、解析度、加密方式等）的協議。分為 `Offer` (發起方) 與 `Answer` (接收方)。                      |
| **ICE**       | Interactive Connectivity Establishment | 一種框架，用來尋找兩個裝置之間最佳的連線路徑。                                                                            |
| **STUN**      | Session Traversal Utilities for NAT    | 用來告訴裝置「我在公網的 IP 是什麼」。                                                                                    |
| **TURN**      | Traversal Using Relays around NAT      | 如果 P2P 連不上（例如防火牆太嚴格），就透過 TURN Server 當中繼站轉發流量。                                                |

---

## 2. WebRTC API 詳解

本章節深入探討開發 WebRTC 應用時必備的三大 API：`MediaStream`, `RTCPeerConnection`, 與 `RTCSessionDescription`。

### 2.1 MediaStream API (媒體捕捉)

`MediaStream` 介面代表媒體內容的串流，通常來自本機的攝影機或麥克風。

- **`navigator.mediaDevices.getUserMedia(constraints)`**
  - **用途**: 請求使用者授權並開啟鏡頭/麥克風。這是通話的第一步。
  - **參數 (Constraints)**: 用來指定想要的媒體類型與規格。
    ```javascript
    const constraints = {
      audio: true, // 或者物件詳細設定: { echoCancellation: true, noiseSuppression: true }
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user', // "user" (前鏡頭) 或 "environment" (後鏡頭)
      },
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    ```
  - **回傳**: `Promise<MediaStream>`

- **`MediaStream` 物件**
  - **結構**: 一個 Stream 可以包含多個 Track (例如一個視訊軌 + 兩個音訊軌)。
  - **常用方法**:
    - `getTracks()`: 取得所有軌道陣列。
    - `getVideoTracks()` / `getAudioTracks()`: 分別取得視訊或音訊軌道。
    - `addTrack(track)` / `removeTrack(track)`: 動態增減軌道。

- **`MediaStreamTrack` 物件**
  - 代表單一媒體軌道（如：左聲道音訊、視訊畫面）。
  - **`enabled` 屬性**:
    - `true`: 正常傳送。
    - `false`: 靜音 (Audio) 或黑屏 (Video)。**注意：這不會關閉硬體燈號，只是停止傳送資料。類似「軟體靜音」。**
  - **`stop()` 方法**: 完全釋放硬體資源（攝影機燈號熄滅）。一旦呼叫 `stop()`，該軌道就無法再被使用，必須重新呼叫 `getUserMedia`。

### 2.2 RTCPeerConnection API (核心連線)

`RTCPeerConnection` 是 WebRTC 的核心，負責建立 P2P 連線、加密 DTLS 握手、NAT 穿透 (ICE) 以及頻寬管理。

- **建構子 (Constructor)**

  ```javascript
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }, // Google 免費 STUN
    ],
  }
  const pc = new RTCPeerConnection(configuration)
  ```

- **信令交換 (Signaling) 方法**
  - **`createOffer(options)`**: (發起方使用) 產生一個 SDP Offer，包含己方支援的 Codec 與加密資訊。
  - **`createAnswer(options)`**: (接收方使用) 收到 Offer 後，產生對應的 SDP Answer。
  - **`setLocalDescription(sessionDescription)`**: 告訴瀏覽器「我是誰」。將產生的 Offer 或 Answer 設定為本地描述。這會觸發 ICE 候選的收集過程。
  - **`setRemoteDescription(sessionDescription)`**: 告訴瀏覽器「對方是誰」。將收到的 Offer 或 Answer 設定為遠端描述。
  - **`addIceCandidate(candidate)`**: 當透過信令收到對方的 ICE Candidate 時，使用此方法加入連線候選路徑。

- **關鍵事件監聽**
  - **`onicecandidate`**: 當瀏覽器找到一個可用的網路出口 (ICE Candidate) 時觸發。
    - **動作**: 必須將 event.candidate 透過信令 Server 傳送給對方。
  - **`ontrack`**: 當 P2P 連線建立成功，且對方有透過 `addTrack` 傳送媒體流時觸發。
    - **動作**: 這是**最重要**的事件，必須在這裡將 `event.streams[0]` 指派給 HTML `<video>` 元素的 `srcObject`，使用者才看得到畫面。
  - **`onconnectionstatechange`**: 監聽連線健康度。
    - `new`: 初始狀態。
    - `checking`: 正在尋找路徑。
    - `connected`: **連線成功**。
    - `disconnected`: 暫時斷線（如網路切換），可能會自動恢復。
    - `failed`: **連線失敗**，通常需要重試或放棄。

- **常用操作**
  - **`addTrack(track, stream)`**: 將本地的麥克風或攝影機軌道加入連線，準備傳送給對方。

### 2.3 RTCSessionDescription & SDP

- **SDP (Session Description Protocol)**
  - 這不是 JavaScript 物件，而是一串**純文字**格式的描述協定。
  - 包含資訊：
    - **Session**: 會話名稱、ID。
    - **Media**: 媒體類型 (audio/video)、Port、通訊協定 (RTP/SAVPF)。
    - **Codec**: 支援的編碼 (VP8, H.264, Opus...)。
    - **Candidate**: (有時也會寫在 SDP 內，雖然通常是透過 Trickle ICE 分開傳)。

- **RTCSessionDescription**
  - JavaScript 用來包裝 SDP 的物件。
  - 屬性：
    - `type`: "offer" | "answer" | "pranswer" | "rollback"
    - `sdp`: SDP 文字內容。

---

## 3. 系統架構設計

本專案採用 **Mesh 架構** 的 1 對 1 通話模式。

### 元件職責

- **Frontend (Vue 3)**:
  - 管理 `RTCPeerConnection`
  - 擷取麥克風與攝影機 (`MediaStream`)
  - 透過 Socket.IO 發送信令
- **Signaling Server (NestJS)**:
  - 轉發信令訊息 (`Join`, `Offer`, `Answer`, `ICE Candidate`)
  - 管理房間與在線狀態
  - 記錄通話日誌 (Call Logs)
- **STUN Server**:
  - 使用 Google 的公開 STUN 伺服器 (`stun:stun.l.google.com:19302`)

### 資料流向

1.  **使用者 A** 與 **使用者 B** 透過 WebSocket 連上 **Signaling Server**。
2.  **使用者 A** 發起通話，送出 `Offer`。
3.  **Signaling Server** 將 `Offer` 轉送給 **使用者 B**。
4.  **使用者 B** 同意通話，回傳 `Answer`。
5.  雙方交換 `ICE Candidates` 以建立 P2P 連線。
6.  **P2P 通道建立成功**，音訊與視訊直接對傳。

---

## 4. 前端實作 (Vue 3 + Composable)

核心邏輯封裝在 `src/composables/useVideoCall.ts`。

### 關鍵程式碼解析

#### A. 媒體擷取

```typescript
// 取得本地視訊/音訊流
const getLocalMedia = async () => {
  const constraints = {
    audio: true,
    video: true, // 或根據需求開關
  }
  localStream.value = await navigator.mediaDevices.getUserMedia(constraints)
}
```

#### B. 建立 PeerConnection

```typescript
const createPeerConnection = async () => {
  const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  }
  peerConnection.value = new RTCPeerConnection(config)

  // 1. 將本地串流加入連線
  localStream.value?.getTracks().forEach(track => {
    peerConnection.value!.addTrack(track, localStream.value!)
  })

  // 2. 監聽遠端串流
  peerConnection.value.ontrack = (event) => {
    remoteStream.value = event.streams[0]
  }

  // 3. 監聽 ICE 候選位址
  peerConnection.value.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('call:ice', { candidate: event.candidate, ... })
    }
  }
}
```

#### C. 信令交換 (Socket.IO)

我們定義了幾個關鍵事件：

- `call:initiate`: 發起通話
- `call:offer`: 傳送 SDP Offer
- `call:answer`: 傳送 SDP Answer
- `call:ice`: 傳送網路路徑資訊
- `call:end`: 結束通話

---

## 5. 後端實作 (NestJS + Socket.IO)

後端主要作為「轉發者 (Relay)」，不處理媒體數據。

### Gateway 實作 (`video-call.gateway.ts`)

```typescript
@WebSocketGateway({ namespace: 'video-call' })
export class VideoCallGateway {
  @SubscribeMessage('call:initiate')
  async handleInitiateCall(client: Socket, data: InitiateCallDto) {
    // 1. 檢查目標是否在線
    // 2. 通知目標有來電
    this.server.to(targetSocketId).emit('call:incoming', {
      callerId: client.user.id,
      callId: newCallId,
    })
    return { success: true, callId: newCallId }
  }

  @SubscribeMessage('call:offer')
  handleOffer(client: Socket, data: any) {
    // 單純轉發 SDP 給目標
    this.server.to(targetSocketId).emit('call:offer', {
      senderId: client.user.id,
      sdp: data.sdp,
    })
  }

  // Handle Answer, ICE Candidate 依此類推...
}
```

---

## 6. 連線流程詳解

假設 **User A (發起方)** 呼叫 **User B (接收方)**：

1.  **A** 點擊撥號:
    - 建立 `RTCPeerConnection`
    - 取得 `MediaStream`
    - Socket 送出 `call:initiate`
2.  **Server**:
    - 通知 **B** `call:incoming`
3.  **B** 收到來電:
    - 顯示接聽介面
4.  **B** 點擊接聽:
    - Socket 送出 `call:accept`
    - 建立 `RTCPeerConnection`
5.  **A** 收到 `call:accepted`:
    - 建立 Offer: `pc.createOffer()` -> `pc.setLocalDescription(offer)`
    - 傳送 Offer 給 **B**
6.  **B** 收到 `call:offer`:
    - 設定遠端描述: `pc.setRemoteDescription(offer)`
    - 建立 Answer: `pc.createAnswer()` -> `pc.setLocalDescription(answer)`
    - 傳送 Answer 給 **A**
7.  **A** 收到 `call:answer`:
    - 設定遠端描述: `pc.setRemoteDescription(answer)`
8.  雙方開始交換 `ICE Candidates`:
    - 找到路徑後，影像畫面出現。

---

## 7. 除錯與常見問題

### 常見錯誤

1.  **攝影機無法開啟**
    - **原因**: 瀏覽器安全性限制，WebRTC 只能在 `localhost` 或 `HTTPS` 環境下運作。
    - **解法**: 本機開發使用 localhost，部署時必須設定 SSL 憑證。

2.  **ICE Connection Failed**
    - **原因**: 防火牆擋住 P2P 連線，或者雙方在複雜的 NAT 後面。
    - **解法**: 目前僅用 STUN Server，如果遇到此情況通常需要架設 **TURN Server**。

3.  **無法收到信令**
    - **原因**: Socket.IO 連線斷開或 token 過期。
    - **解法**: 檢查瀏覽器 Console 的 Socket 連線狀態 (`socket.connected`)。

### 除錯工具

- **chrome://webrtc-internals**: Chrome 內建的神級除錯工具，可以看到詳細的 SDP 交換、流量圖表、封包遺失率。
