import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import localFont from 'next/font/local'
import './globals.css'

const GeistPixel = localFont({
  src: './GeistPixel-Square.woff2',
  variable: '--font-pixel',
})

const GeistPixelLine = localFont({
  src: './GeistPixel-Line.woff2',
  variable: '--font-pixel-line',
})

const DepartureMono = localFont({
  src: './DepartureMono-Regular.woff',
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'COBE',
    template: '%s - COBE',
  },
  description: 'The 5KB WebGL globe',
  openGraph: {
    title: 'COBE',
    description: 'The 5KB WebGL globe',
    images: [
      'https://repository-images.githubusercontent.com/429536908/62a4e686-8613-4b45-b7bb-fa35b558ae8e',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@shuding',
    images: [
      'https://repository-images.githubusercontent.com/429536908/62a4e686-8613-4b45-b7bb-fa35b558ae8e',
    ],
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="%23243ab0"/></svg>',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='en'
      className={`${GeistPixel.variable} ${GeistPixelLine.variable} ${DepartureMono.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
