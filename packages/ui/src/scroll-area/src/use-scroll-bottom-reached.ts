import type { Ref } from 'vue'
import { debounce } from 'lodash-es'
import { onMounted, onUnmounted, ref } from 'vue'

interface UseScrollBottomReachedOptions {
  bottomThreshold?: number
  debounceDelay?: number
  onBottomReached?: () => void
}

export function useScrollBottomReached(options: UseScrollBottomReachedOptions = {}) {
  const { bottomThreshold = 50, debounceDelay = 200, onBottomReached } = options

  const viewportRef: Ref<HTMLElement | undefined> = ref()

  function handleBottomReached() {
    onBottomReached?.()
  }

  const debouncedBottomReached = debounce(handleBottomReached, debounceDelay)

  function handleScroll() {
    if (!viewportRef.value)
      return

    const { scrollTop, scrollHeight, clientHeight } = viewportRef.value
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - bottomThreshold

    if (isAtBottom) {
      debouncedBottomReached()
    }
    else {
      // 如果不在底部，取消防抖
      debouncedBottomReached.cancel()
    }
  }

  onMounted(() => {
    viewportRef.value?.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    viewportRef.value?.removeEventListener('scroll', handleScroll)
    // 取消防抖函数
    debouncedBottomReached.cancel()
  })

  return {
    viewportRef,
    handleScroll,
  }
}
