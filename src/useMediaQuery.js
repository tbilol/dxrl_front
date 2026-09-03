import { useEffect, useState } from 'react'

/** CSS media query'ni React holatiga bog'laydi (ekran o'lchami o'zgarsa qayta render). */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia?.(query).matches ?? false,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setMatches(e.matches)
    setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** >= 1024px — yon menyu va yonma-yon maketlar. */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}

/** >= 640px — ikki ustunli to'r. */
export function useIsTabletUp() {
  return useMediaQuery('(min-width: 640px)')
}
