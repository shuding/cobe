import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { IpGlobe } from './IpGlobe'

async function getLocation() {
  const h = await headers()
  const rawLat = h.get('x-vercel-ip-latitude')
  const rawLon = h.get('x-vercel-ip-longitude')
  const rawCity = h.get('x-vercel-ip-city')
  const rawCountry = h.get('x-vercel-ip-country')
  return {
    lat: rawLat ? parseFloat(rawLat) : null,
    lon: rawLon ? parseFloat(rawLon) : null,
    city: rawCity ? decodeURIComponent(rawCity) : null,
    country: rawCountry ?? null,
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { city, country } = await getLocation()
  return { title: city && country ? `${city}, ${country}` : 'Where Are You?' }
}

export default async function IpPage() {
  const { lat, lon, city, country } = await getLocation()

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '0.65rem',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: 0,
          }}
        >
          you are in
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-pixel-line), sans-serif',
            fontSize: 'min(10vw, 2.8em)',
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: 'var(--ink)',
            margin: '0.25rem 0 1rem',
            textAlign: 'center',
          }}
        >
          {city && country ? `${city}, ${country}` : 'Unknown Location'}
        </h2>
        <IpGlobe lat={lat} lon={lon} city={city} />
        {lat !== null && lon !== null && (
          <p
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.08em',
              marginTop: '1rem',
              textAlign: 'center',
            }}
          >
            {Math.abs(lat).toFixed(4)}°{lat >= 0 ? 'N' : 'S'},{' '}
            {Math.abs(lon).toFixed(4)}°{lon >= 0 ? 'E' : 'W'}
          </p>
        )}
        <p
          style={{
            fontFamily: 'var(--font-mono), monospace',
            fontSize: '0.65rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.06em',
            marginTop: '2rem',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          {'Powered by '}
          <a href='https://github.com/shuding/cobe' style={{ color: 'inherit', textDecoration: 'underline' }}>
            COBE
          </a>
          {' + '}
          <a href='https://nextjs.org' style={{ color: 'inherit', textDecoration: 'underline' }}>
            Next.js
          </a>
          {' using '}
          <a
            href='https://vercel.com/kb/guide/geo-ip-headers-geolocation-vercel-functions'
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            Vercel geolocation
          </a>
          {' · '}
          <a
            href='https://github.com/shuding/cobe/blob/main/website/app/ip/page.tsx'
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            view page source
          </a>
        </p>
      </div>
    </div>
  )
}
