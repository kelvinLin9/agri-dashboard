/**
 * 影片相關型別定義
 */

export enum VideoQuality {
  HIGH = '1080p',
  MEDIUM = '720p',
  LOW = '480p',
}

export interface VideoQualityConfig {
  width: number
  height: number
  bitrate: number      // bits per second
  frameRate: number
}

export const VIDEO_QUALITY_CONFIGS: Record<VideoQuality, VideoQualityConfig> = {
  [VideoQuality.HIGH]: {
    width: 1920,
    height: 1080,
    bitrate: 5000000,  // 5 Mbps
    frameRate: 30,
  },
  [VideoQuality.MEDIUM]: {
    width: 1280,
    height: 720,
    bitrate: 2500000,  // 2.5 Mbps
    frameRate: 30,
  },
  [VideoQuality.LOW]: {
    width: 854,
    height: 480,
    bitrate: 1000000,  // 1 Mbps
    frameRate: 30,
  },
}

export interface VideoMetadata {
  title?: string
  description?: string
  tags?: string[]
  duration?: number    // seconds
  fileSize?: number    // bytes
}

export interface RecordingSettings {
  quality: VideoQuality
  facingMode: 'user' | 'environment'  // front/back camera
  audioEnabled: boolean
  maxDuration?: number  // seconds, 0 = unlimited
}

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  elapsedTime: number
  blob: Blob | null
  error: string | null
}
