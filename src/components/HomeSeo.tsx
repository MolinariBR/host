import { useEffect, useMemo } from 'react'
import { appConfig } from '../config/app-config'
import type { HotelProfile, PublicRoom } from '../lib/api'
import { applySeo, buildCanonicalUrl, toAbsoluteUrl, type JsonLdScript } from '../lib/seo'

type HomeSeoProps = {
  profile: HotelProfile | null
  heroImageUrl: string
  rooms: PublicRoom[]
}

function roomTypeLabel(type: PublicRoom['type']) {
  const labels: Record<PublicRoom['type'], string> = {
    FAMILIA: 'Quarto Familia (Grupo/Excursao)',
    CASAL: 'Quarto Casal + Solteiro',
    DUPLO: 'Quarto Duplo',
    INDIVIDUAL: 'Quarto Individual',
    ECONOMICO: 'Quarto Economico',
  }
  return labels[type]
}

function roomDailyPriceCents(room: PublicRoom) {
  return room.seasonalPriceCents || room.basePriceCents
}

function formatPrice(priceCents: number) {
  return Number((priceCents / 100).toFixed(2))
}

export default function HomeSeo({ profile, heroImageUrl, rooms }: HomeSeoProps) {
  const structuredData = useMemo<JsonLdScript[]>(() => {
    const pageUrl = buildCanonicalUrl('/')
    const hotelName = profile?.tradeName || appConfig.fallbackHotelName
    const absoluteHeroImageUrl = toAbsoluteUrl(heroImageUrl)

    const roomOffersByType = new Map<
      PublicRoom['type'],
      {
        type: PublicRoom['type']
        quantity: number
        minPriceCents: number
        maxCapacity: number
      }
    >()

    for (const room of rooms) {
      const current = roomOffersByType.get(room.type)
      const priceCents = roomDailyPriceCents(room)
      if (!current) {
        roomOffersByType.set(room.type, {
          type: room.type,
          quantity: 1,
          minPriceCents: priceCents,
          maxCapacity: room.capacity,
        })
        continue
      }
      current.quantity += 1
      current.minPriceCents = Math.min(current.minPriceCents, priceCents)
      current.maxCapacity = Math.max(current.maxCapacity, room.capacity)
    }

    const makesOffer = Array.from(roomOffersByType.values()).map((entry) => ({
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'BRL',
      price: formatPrice(entry.minPriceCents),
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        value: entry.quantity,
      },
      itemOffered: {
        '@type': 'Room',
        name: roomTypeLabel(entry.type),
        occupancy: {
          '@type': 'QuantitativeValue',
          maxValue: entry.maxCapacity,
          unitText: 'pessoas',
        },
      },
    }))

    const sameAs = [profile?.googleMapsUrl, profile?.googleBusinessUrl].filter(
      (value): value is string => Boolean(value)
    )

    const hotelJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      '@id': `${pageUrl}#hotel`,
      name: hotelName,
      description:
        'Hotel Santo Antonio em Itaguatins-TO com cafe da manha, internet, quartos com ar ou ventilador e reservas online.',
      image: absoluteHeroImageUrl,
      url: pageUrl,
      identifier: profile?.cnpj || undefined,
      telephone: profile?.phone || undefined,
      email: profile?.email || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: profile?.addressLine || undefined,
        addressLocality: profile?.city || appConfig.fallbackCity,
        addressRegion: profile?.state || appConfig.fallbackState,
        addressCountry: 'BR',
      },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Cafe da manha', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Internet Wi-Fi', value: true },
      ],
      sameAs: sameAs.length > 0 ? sameAs : undefined,
      makesOffer: makesOffer.length > 0 ? makesOffer : undefined,
    }

    return [{ id: 'seo-home-hotel', data: hotelJsonLd }]
  }, [profile, rooms, heroImageUrl])

  useEffect(() => {
    const hotelName = profile?.tradeName || appConfig.fallbackHotelName
    const description =
      'Hotel Santo Antonio em Itaguatins-TO: hospedagem com conforto, cafe da manha, internet e reservas online com confirmacao por WhatsApp.'

    const cleanup = applySeo({
      title: `${hotelName} em Itaguatins-TO | Reservas Online`,
      description,
      pathname: '/',
      imageUrl: heroImageUrl,
      imageAlt: `Fachada e ambiente do ${hotelName}`,
      siteName: hotelName,
      jsonLd: structuredData,
    })

    return cleanup
  }, [profile, heroImageUrl, structuredData])

  return null
}
