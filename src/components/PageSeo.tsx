import { useEffect } from 'react'
import { applySeo, type JsonLdScript } from '../lib/seo'

type PageSeoProps = {
  title: string
  description: string
  pathname: string
  imageUrl?: string
  imageAlt?: string
  siteName?: string
  robots?: string
  jsonLd?: JsonLdScript[]
}

export default function PageSeo({
  title,
  description,
  pathname,
  imageUrl,
  imageAlt,
  siteName,
  robots,
  jsonLd = [],
}: PageSeoProps) {
  const jsonLdFingerprint = JSON.stringify(jsonLd)

  useEffect(() => {
    const stableJsonLd = JSON.parse(jsonLdFingerprint) as JsonLdScript[]

    const cleanup = applySeo({
      title,
      description,
      pathname,
      imageUrl,
      imageAlt,
      siteName,
      robots,
      jsonLd: stableJsonLd,
    })

    return cleanup
  }, [title, description, pathname, imageUrl, imageAlt, siteName, robots, jsonLdFingerprint])

  return null
}
