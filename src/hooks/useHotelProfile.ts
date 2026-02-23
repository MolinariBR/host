import { useEffect, useState } from 'react'
import { api, type HotelProfile } from '../lib/api'

let cachedProfile: HotelProfile | null = null
let inFlightRequest: Promise<HotelProfile> | null = null

async function fetchProfile() {
  if (cachedProfile) return cachedProfile
  if (!inFlightRequest) {
    inFlightRequest = api
      .getHotelProfile()
      .then((profile) => {
        cachedProfile = profile
        return profile
      })
      .finally(() => {
        inFlightRequest = null
      })
  }
  return inFlightRequest
}

export function useHotelProfile() {
  const [profile, setProfile] = useState<HotelProfile | null>(cachedProfile)
  const [loading, setLoading] = useState(!cachedProfile)

  useEffect(() => {
    let cancelled = false

    if (cachedProfile) {
      setProfile(cachedProfile)
      setLoading(false)
      return
    }

    void fetchProfile()
      .then((data) => {
        if (cancelled) return
        setProfile(data)
      })
      .catch(() => {
        if (cancelled) return
        setProfile(null)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { profile, loading }
}
