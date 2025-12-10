<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
    <!-- Sidebar -->
    <AdminSidebar
      :collapsed="isSidebarCollapsed"
      :mobile-open="isMobileSidebarOpen"
      @toggle="toggleSidebar"
      @mobile-close="closeMobileSidebar"
    />

    <!-- Main Area -->
    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-300"
      :class="[isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64']"
    >
      <!-- Top Bar -->
      <AdminTopBar
        @toggle-sidebar="toggleMobileSidebar"
      />

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-6">
        <slot />
      </main>
    </div>

    <!-- Mobile Sidebar Overlay -->
    <Transition name="fade">
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 z-40 bg-black/50 lg:hidden"
        @click="closeMobileSidebar"
      />
    </Transition>

    <!-- Floating Components -->
    <BackToTop />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminSidebar from '@/components/layout/admin/AdminSidebar.vue'
import AdminTopBar from '@/components/layout/admin/AdminTopBar.vue'
import BackToTop from '@/components/common/BackToTop.vue'

// Sidebar state
const isSidebarCollapsed = ref(false)
const isMobileSidebarOpen = ref(false)

// Load sidebar state from localStorage
onMounted(() => {
  const savedState = localStorage.getItem('admin-sidebar-collapsed')
  if (savedState !== null) {
    isSidebarCollapsed.value = savedState === 'true'
  }
})

// Toggle functions
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('admin-sidebar-collapsed', String(isSidebarCollapsed.value))
}

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
