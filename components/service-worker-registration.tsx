'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(() => {
              // Service worker registered successfully
            })
            .catch((registrationError) => {
              if (process.env.NODE_ENV === 'development') {
                console.error('SW registration failed: ', registrationError)
              }
            })
        })
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Service worker registration error: ', error)
        }
      }
    }
  }, [])

  return null
}
