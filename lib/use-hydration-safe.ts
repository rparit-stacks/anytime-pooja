import { useState, useEffect } from 'react'

/**
 * Custom hook to safely handle client-side only rendering
 * Prevents hydration mismatches by ensuring consistent server/client rendering
 */
export function useHydrationSafe() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated
}
