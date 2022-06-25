import { useRouter } from 'next/router'

const Logo = ({ height }) => (
  <svg height={height} viewBox='0 0 70 70' fill='none'>
    <circle cx='35' cy='35' r='35' fill='currentColor' />
  </svg>
)

export default {
  projectLink: 'https://github.com/shuding/cobe',
  docsRepositoryBase: 'https://github.com/shuding/cobe/blob/main/website/pages',
  search: true,
  titleSuffix: '',
  unstable_flexsearch: true,
  unstable_faviconGlyph: '⚫️',
  floatTOC: true,
  logo: () => {
    const { route } = useRouter()
    return (
      <>
        <Logo height={18} />
        {route === '/' ? null : (
          <span
            className='mx-2 font-extrabold hidden md:inline select-none'
            title='COBE'
            style={{ whiteSpace: 'nowrap' }}
          >
            COBE
          </span>
        )}
      </>
    )
  },
  head: ({ title, meta }) => {
    const ogImage =
      'https://repository-images.githubusercontent.com/429536908/62a4e686-8613-4b45-b7bb-fa35b558ae8e'

    return (
      <>
        <meta name='msapplication-TileColor' content='#ffffff' />
        <meta httpEquiv='Content-Language' content='en' />
        <meta
          name='description'
          content={meta.description || 'A 5kB WebGL globe library.'}
        />
        <meta
          name='og:description'
          content={meta.description || 'A 5kB WebGL globe library.'}
        />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@shuding_' />
        <meta name='twitter:image' content={ogImage} />
        <meta name='og:title' content={title ? title + ' – COBE' : 'COBE'} />
        <meta name='og:image' content={ogImage} />
        <meta name='apple-mobile-web-app-title' content='COBE' />
      </>
    )
  },
  footerText: ({ locale }) => {
    return (
      <p className='no-underline text-current font-semibold'>
        Made by{' '}
        <a
          href='https://twitter.com/shuding_'
          target='_blank'
          rel='noopener'
          className='no-underline font-semibold'
        >
          @shuding_
        </a>
        , deployed on{' '}
        <a
          href='https://vercel.com/?utm_source=cobe'
          target='_blank'
          rel='noopener'
          className='no-underline font-semibold'
        >
          Vercel
        </a>
        .
      </p>
    )
  },
  footerEditLink: () => {
    const { route } = useRouter()
    if (route.includes('/showcases/')) {
      return null
    }
    return 'Edit this page on GitHub'
  },
  gitTimestamp: false,
}
