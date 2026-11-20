import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function useReveal(refreshKey = '') {
  const root = useRef(null)

  useEffect(() => {
    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      root.current.querySelectorAll('[data-reveal]').forEach((element) => {
        if (element.getBoundingClientRect().top < window.innerHeight) return
        gsap.from(element, {
          opacity: 0,
          y: 16,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 94%', once: true },
        })
      })
    }, root)
    return () => motion.revert()
  }, [refreshKey])

  return root
}
