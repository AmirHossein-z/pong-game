import { useEffect, useState } from 'react'

export function useOrientation(): { isPortrait: boolean; isCoarsePointer: boolean } {
  const [isPortrait, setPortrait] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(orientation: portrait)').matches
      : false,
  )
  const [isCoarsePointer, setCoarse] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(pointer: coarse)').matches
      : false,
  )

  useEffect(() => {
    const portraitMq = window.matchMedia('(orientation: portrait)')
    const coarseMq = window.matchMedia('(pointer: coarse)')

    const onPortrait = () => setPortrait(portraitMq.matches)
    const onCoarse = () => setCoarse(coarseMq.matches)

    portraitMq.addEventListener('change', onPortrait)
    coarseMq.addEventListener('change', onCoarse)
    return () => {
      portraitMq.removeEventListener('change', onPortrait)
      coarseMq.removeEventListener('change', onCoarse)
    }
  }, [])

  return { isPortrait, isCoarsePointer }
}
