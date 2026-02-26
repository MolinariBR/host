export type JsonLdScript = {
  id: string
  data: unknown
}

type ApplySeoOptions = {
  title: string
  description: string
  pathname: string
  imageUrl?: string
  imageAlt?: string
  siteName?: string
  ogType?: 'website' | 'article'
  robots?: string
  locale?: string
  twitterCard?: 'summary' | 'summary_large_image'
  jsonLd?: JsonLdScript[]
  cleanupJsonLdOnUnmount?: boolean
}

function upsertMetaByName(name: string, content: string) {
  const selector = `meta[name="${name}"]`
  const existing = document.head.querySelector<HTMLMetaElement>(selector)
  const meta = existing || document.createElement('meta')
  meta.setAttribute('name', name)
  meta.setAttribute('content', content)
  if (!existing) document.head.appendChild(meta)
}

function upsertMetaByProperty(property: string, content: string) {
  const selector = `meta[property="${property}"]`
  const existing = document.head.querySelector<HTMLMetaElement>(selector)
  const meta = existing || document.createElement('meta')
  meta.setAttribute('property', property)
  meta.setAttribute('content', content)
  if (!existing) document.head.appendChild(meta)
}

function removeMetaByName(name: string) {
  const element = document.head.querySelector(`meta[name="${name}"]`)
  if (element) element.remove()
}

function removeMetaByProperty(property: string) {
  const element = document.head.querySelector(`meta[property="${property}"]`)
  if (element) element.remove()
}

function upsertCanonical(url: string) {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const link = existing || document.createElement('link')
  link.setAttribute('rel', 'canonical')
  link.setAttribute('href', url)
  if (!existing) document.head.appendChild(link)
}

function upsertJsonLd(id: string, data: unknown) {
  const existing = document.head.querySelector<HTMLScriptElement>(`script#${id}`)
  const script = existing || document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.text = JSON.stringify(data)
  if (!existing) document.head.appendChild(script)
}

function removeJsonLd(id: string) {
  const existing = document.head.querySelector<HTMLScriptElement>(`script#${id}`)
  if (existing) existing.remove()
}

export function resolveSiteOrigin() {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim().replace(/\/+$/, '')
  if (configuredSiteUrl) return configuredSiteUrl
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

function normalizePathname(pathname: string) {
  if (!pathname) return '/'
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

export function buildCanonicalUrl(pathname: string) {
  const origin = resolveSiteOrigin()
  const normalized = normalizePathname(pathname)
  if (!origin) return normalized
  return `${origin}${normalized}`
}

export function toAbsoluteUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url
  const origin = resolveSiteOrigin()
  if (!origin) return url
  return new URL(url, `${origin}/`).toString()
}

export function applySeo({
  title,
  description,
  pathname,
  imageUrl,
  imageAlt,
  siteName,
  ogType = 'website',
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  locale = 'pt_BR',
  twitterCard = 'summary_large_image',
  jsonLd = [],
  cleanupJsonLdOnUnmount = true,
}: ApplySeoOptions) {
  const canonicalUrl = buildCanonicalUrl(pathname)
  const absoluteImageUrl = imageUrl ? toAbsoluteUrl(imageUrl) : undefined

  document.title = title
  upsertMetaByName('description', description)
  upsertMetaByName('robots', robots)
  upsertCanonical(canonicalUrl)

  upsertMetaByProperty('og:type', ogType)
  upsertMetaByProperty('og:locale', locale)
  upsertMetaByProperty('og:title', title)
  upsertMetaByProperty('og:description', description)
  upsertMetaByProperty('og:url', canonicalUrl)
  if (siteName) {
    upsertMetaByProperty('og:site_name', siteName)
  }

  upsertMetaByName('twitter:card', twitterCard)
  upsertMetaByName('twitter:title', title)
  upsertMetaByName('twitter:description', description)

  if (absoluteImageUrl) {
    upsertMetaByProperty('og:image', absoluteImageUrl)
    upsertMetaByProperty('og:image:alt', imageAlt || title)
    upsertMetaByName('twitter:image', absoluteImageUrl)
    upsertMetaByName('twitter:image:alt', imageAlt || title)
  } else {
    removeMetaByProperty('og:image')
    removeMetaByProperty('og:image:alt')
    removeMetaByName('twitter:image')
    removeMetaByName('twitter:image:alt')
  }

  for (const entry of jsonLd) {
    upsertJsonLd(entry.id, entry.data)
  }

  return () => {
    if (!cleanupJsonLdOnUnmount) return
    for (const entry of jsonLd) {
      removeJsonLd(entry.id)
    }
  }
}
