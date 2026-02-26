import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, MessageSquareQuote, Star } from 'lucide-react'
import { api, type PublicGoogleReviewsResponse } from '../lib/api'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() || '').join('')
}

function filledStars(rating: number) {
  return Math.max(0, Math.min(5, Math.round(rating)))
}

export default function GoogleReviewsCarousel() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PublicGoogleReviewsResponse | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadReviews() {
      setLoading(true)
      try {
        const response = await api.getGoogleReviews()
        if (!cancelled) {
          setData(response)
          setCurrentIndex(0)
        }
      } catch {
        if (!cancelled) setData(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadReviews()
    return () => {
      cancelled = true
    }
  }, [])

  const items = useMemo(() => data?.items || [], [data])
  const activeReview = useMemo(() => items[currentIndex], [items, currentIndex])

  function prev() {
    if (items.length <= 1) return
    setCurrentIndex((value) => (value - 1 + items.length) % items.length)
  }

  function next() {
    if (items.length <= 1) return
    setCurrentIndex((value) => (value + 1) % items.length)
  }

  if (!loading && (!data || !data.enabled || items.length === 0)) {
    return null
  }

  return (
    <section className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Comentarios no Google</h2>
            <p className="text-slate-600">
              Avaliacoes reais de quem ja se hospedou.
              {data?.placeName ? ` Fonte: ${data.placeName}.` : ''}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={items.length <= 1}
              className="p-3 rounded-xl border border-slate-300 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Comentario anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={items.length <= 1}
              className="p-3 rounded-xl border border-slate-300 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Proximo comentario"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-slate-600">
            Carregando comentarios...
          </div>
        )}

        {!loading && activeReview && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                {activeReview.authorPhotoUri ? (
                  <img
                    src={activeReview.authorPhotoUri}
                    alt={activeReview.authorName}
                    className="w-14 h-14 rounded-full object-cover border border-slate-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center border border-slate-300">
                    {initials(activeReview.authorName)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900">{activeReview.authorName}</p>
                  <p className="text-sm text-slate-600">
                    {activeReview.relativePublishTimeDescription || 'avaliacao no Google'}
                  </p>
                </div>
              </div>
              <MessageSquareQuote className="w-7 h-7 text-blue-600" />
            </div>

            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, index) => {
                const isFilled = index < filledStars(activeReview.rating)
                return (
                  <Star
                    key={`${activeReview.authorName}-star-${index}`}
                    className={`w-5 h-5 ${
                      isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                )
              })}
              <span className="ml-2 text-sm text-slate-600">{activeReview.rating.toFixed(1)}/5</span>
            </div>

            <p className="text-slate-700 text-lg leading-relaxed">{activeReview.text}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {activeReview.googleMapsUri && (
                <a
                  href={activeReview.googleMapsUri}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Ver comentario no Google
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {activeReview.authorProfileUri && (
                <a
                  href={activeReview.authorProfileUri}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Perfil do autor
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}

        {!loading && items.length > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            {items.map((item, index) => (
              <button
                type="button"
                key={`${item.authorName}-${index}`}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Abrir comentario ${index + 1}`}
              />
            ))}
          </div>
        )}

        {!loading && data?.placeGoogleMapsUri && (
          <div className="mt-6 text-center">
            <a
              href={data.placeGoogleMapsUri}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 font-semibold"
            >
              Ver todas as avaliacoes no Google
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
