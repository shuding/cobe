import './styles.css'
import 'nextra-theme-docs/style.css'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Nextra({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => page)
  const router = useRouter()
  
  // Get title from pageProps or use a default
  const title = pageProps.title || pageProps.pageOpts?.title || 'COBE'
  const titleWithSuffix = title === 'COBE' ? title : `${title} – COBE`
  
  return getLayout(
    <>
      <Head>
        <title key="title">{titleWithSuffix}</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
