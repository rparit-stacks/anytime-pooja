"use client"

import Head from "next/head"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonicalUrl?: string
  noIndex?: boolean
}

export function SEOHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonicalUrl,
  noIndex = false
}: SEOHeadProps) {
  const { data: settingsData } = useSWR("/api/settings", swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000 // 5 minutes
  })

  const seoSettings = settingsData?.seo || {
    siteTitle: 'Anytime Pooja',
    siteDescription: 'Your spiritual journey begins here',
    siteKeywords: 'pooja items, spiritual products',
    ogTitle: 'Anytime Pooja',
    ogDescription: 'Your spiritual journey begins here',
    ogImage: '/images/og-image.jpg',
    twitterCard: 'summary_large_image',
    twitterSite: '',
    canonicalUrl: '',
    robotsTxt: ''
  }

  const faviconSettings = settingsData?.favicon || {
    faviconUrl: '/favicon.ico',
    appleTouchIcon: '/images/apple-touch-icon.png'
  }

  const generalSettings = settingsData?.general || {
    siteName: 'Anytime Pooja',
    siteUrl: 'https://anytimepooja.com',
    googleAnalyticsId: '',
    facebookPixelId: '',
    googleTagManagerId: ''
  }

  // Use provided values or fallback to settings
  const finalTitle = title ? `${title} | ${seoSettings.siteTitle}` : seoSettings.siteTitle
  const finalDescription = description || seoSettings.siteDescription
  const finalKeywords = keywords || seoSettings.siteKeywords
  const finalOgTitle = ogTitle || seoSettings.ogTitle
  const finalOgDescription = ogDescription || seoSettings.ogDescription
  const finalOgImage = ogImage || seoSettings.ogImage
  const finalCanonicalUrl = canonicalUrl || seoSettings.canonicalUrl

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={generalSettings.siteName} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      {finalCanonicalUrl && <link rel="canonical" href={finalCanonicalUrl} />}
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      
      {/* Favicon */}
      <link rel="icon" href={faviconSettings.faviconUrl} />
      <link rel="apple-touch-icon" href={faviconSettings.appleTouchIcon} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:site_name" content={generalSettings.siteName} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={seoSettings.twitterCard} />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={finalOgImage} />
      {seoSettings.twitterSite && <meta name="twitter:site" content={seoSettings.twitterSite} />}
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      
      {/* Google Analytics */}
      {generalSettings.googleAnalyticsId && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${generalSettings.googleAnalyticsId}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${generalSettings.googleAnalyticsId}');
              `,
            }}
          />
        </>
      )}
      
      {/* Google Tag Manager */}
      {generalSettings.googleTagManagerId && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${generalSettings.googleTagManagerId}');
              `,
            }}
          />
        </>
      )}
      
      {/* Facebook Pixel */}
      {generalSettings.facebookPixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${generalSettings.facebookPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
    </Head>
  )
}
