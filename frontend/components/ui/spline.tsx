'use client'

import { useEffect, useRef } from 'react'

import { PencilLoader } from "@/components/ui/loader-1";

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className = '' }: SplineSceneProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Spline dynamically to avoid build issues
    if (!containerRef.current) return

    const splineScript = document.createElement('script')
    splineScript.type = 'module'
    splineScript.src = 'https://unpkg.com/@splinetool/viewer@1.0.0/build/spline-viewer.js'

    // Clear container and add script
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(splineScript)

      // Create spline viewer element
      const splineViewer = document.createElement('spline-viewer')
      splineViewer.setAttribute('url', scene)
      splineViewer.style.width = '100%'
      splineViewer.style.height = '100%'
      splineViewer.style.display = 'block'

      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.appendChild(splineViewer)
        }
      }, 100)
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [scene])

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      style={{ minHeight: '400px' }}
    >
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-purple-50/50">
        <PencilLoader size={100} label="Loading interactive 3D scene..." />
      </div>
    </div>
  )
}
