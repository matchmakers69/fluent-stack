import type { Metadata } from 'next'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fluentstack.pl'
export const SITE_NAME = 'FluentStack'
export const TEACHER_NAME = 'Przemek Lewtak'

export type SupportedLocale = 'pl' | 'en'

export function buildLocalePath(locale: SupportedLocale, path: string = '/'): string {
  const normalized = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  if (locale === 'pl') return normalized || '/'
  return `/en${normalized}`
}

export function buildCanonicalUrl(locale: SupportedLocale, path: string = '/'): string {
  const localePath = buildLocalePath(locale, path)
  if (localePath === '/') return SITE_URL
  return `${SITE_URL}${localePath}`
}

export function buildAlternates(locale: SupportedLocale, path: string = '/') {
  return {
    canonical: buildCanonicalUrl(locale, path),
    languages: {
      pl: buildCanonicalUrl('pl', path),
      en: buildCanonicalUrl('en', path),
      'x-default': buildCanonicalUrl('pl', path),
    },
  } satisfies NonNullable<Metadata['alternates']>
}

export function buildOpenGraph(params: {
  title: string
  description: string
  locale: SupportedLocale
  path?: string
  type?: 'website' | 'article'
}): Metadata['openGraph'] {
  return {
    title: params.title,
    description: params.description,
    url: buildCanonicalUrl(params.locale, params.path ?? '/'),
    siteName: SITE_NAME,
    locale: params.locale === 'pl' ? 'pl_PL' : 'en_US',
    type: params.type ?? 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: params.title }],
  }
}

export function buildTwitterCard(params: {
  title: string
  description: string
}): Metadata['twitter'] {
  return {
    card: 'summary_large_image',
    title: params.title,
    description: params.description,
    images: ['/og-image.jpg'],
  }
}
