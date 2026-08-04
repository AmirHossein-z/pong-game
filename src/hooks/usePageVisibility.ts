import { useEffect, useState } from 'react'

export function usePageVisibility(onHidden: () => void, enabled: boolean): boolean {
  const [visible, setVisible] = useState(
    typeof document !== 'undefined' ? document.visibilityState === 'visible' : true,
  )

  useEffect(() => {
    if (!enabled) return

    const onVis = () => {
      const isVisible = document.visibilityState === 'visible'
      setVisible(isVisible)
      if (!isVisible) onHidden()
    }

    const onBlur = () => {
      setVisible(false)
      onHidden()
    }

    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('blur', onBlur)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('blur', onBlur)
    }
  }, [onHidden, enabled])

  return visible
}
