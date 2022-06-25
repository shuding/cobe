import './styles.css'
import 'nextra-theme-docs/style.css'
import Head from 'next/head'

export default function Nextra({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page)
  return getLayout(
    <>
      <Head>
        <link
          href='https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;700&display=block'
          rel='stylesheet'
        />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
