"use client"

import { useEffect } from "react"
import { initCapacitor } from "@/lib/capacitor-init"

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initCapacitor()
  }, [])

  return <>{children}</>
}
