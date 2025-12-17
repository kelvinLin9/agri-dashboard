<template>
  <!-- 來電提示 Modal -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="isVisible" class="incoming-call">
        <div class="incoming-call__card">
          <!-- 頭像 -->
          <div class="incoming-call__avatar">
            <div class="incoming-call__avatar-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="incoming-call__pulse" />
          </div>

          <!-- 文字 -->
          <h3 class="incoming-call__title">{{ callerName }}</h3>
          <p class="incoming-call__subtitle">
            {{ callType === 'video' ? '視訊通話' : '語音通話' }}
          </p>

          <!-- 按鈕 -->
          <div class="incoming-call__actions">
            <!-- 拒絕 -->
            <button
              type="button"
              class="incoming-call__btn incoming-call__btn--reject"
              @click="$emit('reject')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                  clip-rule="evenodd"
                  transform="rotate(135 12 12)"
                />
              </svg>
            </button>

            <!-- 接聽 -->
            <button
              type="button"
              class="incoming-call__btn incoming-call__btn--accept"
              @click="$emit('accept')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 來電提示元件
 * 顯示來電通知，讓使用者選擇接聽或拒絕
 */
import type { CallType } from '@/composables/useVideoCall'

// Props
defineProps<{
  /** 是否顯示 */
  isVisible: boolean
  /** 來電者名稱 */
  callerName: string
  /** 通話類型 */
  callType: CallType
}>()

// Emits
defineEmits<{
  accept: []
  reject: []
}>()
</script>

<style scoped lang="scss">
.incoming-call {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;

  &__card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 24px;
    padding: 2.5rem 3rem;
    text-align: center;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    min-width: 300px;
  }

  &__avatar {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 0 auto 1.5rem;

    &-icon {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 50px;
        height: 50px;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }

  &__pulse {
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    border: 2px solid rgba(34, 197, 94, 0.6);
    animation: pulse 1.5s infinite;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 600;
    color: white;
    margin: 0 0 0.5rem;
  }

  &__subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 2rem;
  }

  &__actions {
    display: flex;
    gap: 2rem;
    justify-content: center;
  }

  &__btn {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    svg {
      width: 32px;
      height: 32px;
    }

    &:hover {
      transform: scale(1.1);
    }

    &--reject {
      background: #ef4444;
      color: white;

      &:hover {
        background: #dc2626;
      }
    }

    &--accept {
      background: #22c55e;
      color: white;
      animation: ring 1s infinite;

      &:hover {
        background: #16a34a;
      }
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes ring {
  0%,
  100% {
    transform: rotate(0deg);
  }
  10%,
  30% {
    transform: rotate(-10deg);
  }
  20%,
  40% {
    transform: rotate(10deg);
  }
  50% {
    transform: rotate(0deg);
  }
}

// 動畫
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}
</style>
