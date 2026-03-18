import { headers } from 'next/headers'
import type { Metadata } from 'next'
import { IpGlobe } from './IpGlobe'

export const metadata: Metadata = {
  title: 'Your Location',
}

export default async function IpPage() {
  const h = await headers()

  const rawLat = h.get('x-vercel-ip-latitude')
  const rawLon = h.get('x-vercel-ip-longitude')
  const rawCity = h.get('x-vercel-ip-city')
  const rawCountry = h.get('x-vercel-ip-country')

  const lat = rawLat ? parseFloat(rawLat) : 37.78
  const lon = rawLon ? parseFloat(rawLon) : -122.44
  const city = rawCity ? decodeURIComponent(rawCity) : 'San Francisco'
  const country = rawCountry ?? 'US'

  return (
    <div className='page'>
      <div className='hero'>
        <div className='ip-header'>
          <span className='ip-label'>you are in</span>
          <span className='ip-city'>
            {city}, {country}
          </span>
        </div>
        <div className='hero-globe'>
          <IpGlobe lat={lat} lon={lon} city={city} />
        </div>
        <div className='ip-coords'>
          {Math.abs(lat).toFixed(4)}°{lat >= 0 ? 'N' : 'S'},{' '}
          {Math.abs(lon).toFixed(4)}°{lon >= 0 ? 'E' : 'W'}
        </div>
      </div>
    </div>
  )
}
