import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

function upsertHeadLink(
  rel: string,
  href: string,
  extra: Record<string, string> = {}
) {
  const selectorParts = [`link[rel="${rel}"]`]
  if (extra.sizes) selectorParts.push(`[sizes="${extra.sizes}"]`)
  if (extra.type) selectorParts.push(`[type="${extra.type}"]`)

  const selector = selectorParts.join('')
  const existing = document.head.querySelector<HTMLLinkElement>(selector)
  const link = existing || document.createElement('link')

  link.setAttribute('rel', rel)
  link.setAttribute('href', href)
  Object.entries(extra).forEach(([key, value]) => {
    link.setAttribute(key, value)
  })

  if (!existing) {
    document.head.appendChild(link)
  }
}

const faviconIco = new URL('./assets/favicon/favicon.ico', import.meta.url).href
const favicon32 = new URL('./assets/favicon/favicon-32x32.png', import.meta.url).href
const favicon16 = new URL('./assets/favicon/favicon-16x16.png', import.meta.url).href
const appleTouchIcon = new URL('./assets/favicon/apple-touch-icon.png', import.meta.url).href

upsertHeadLink('icon', faviconIco, { type: 'image/x-icon' })
upsertHeadLink('icon', favicon32, { type: 'image/png', sizes: '32x32' })
upsertHeadLink('icon', favicon16, { type: 'image/png', sizes: '16x16' })
upsertHeadLink('apple-touch-icon', appleTouchIcon, { sizes: '180x180' })

createRoot(document.getElementById('root')!).render(
  <App />,
)
