import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {Roboto_Slab} from 'next/font/google'

const roboto = Roboto_Slab({
  weight: ['400', '700'],
  subsets: ['latin'],
})

export default function App({ Component, pageProps }: AppProps) {
  return <main className={roboto.className}><Component {...pageProps} /></main>
}
