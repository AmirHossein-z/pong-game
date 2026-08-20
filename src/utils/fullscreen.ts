/** Best-effort fullscreen helpers. Unsupported browsers (e.g. iPhone
 * Safari) and denied requests are silently ignored. */

export async function enterFullscreen(): Promise<void> {
  if (document.fullscreenElement) return
  const el = document.documentElement
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen({ navigationUI: 'hide' })
    } else {
      const webkit = el as HTMLElement & { webkitRequestFullscreen?: () => void }
      webkit.webkitRequestFullscreen?.()
    }
  } catch {
    // Ignore: not supported or blocked outside a user gesture.
  }
}

export function exitFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen().catch(() => {})
  }
}
