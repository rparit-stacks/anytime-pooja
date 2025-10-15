import { SWRConfiguration } from 'swr'

export const swrFetcher = (url: string) => fetch(url, {
  cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}).then((r) => r.json())

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0, // Disable automatic refresh
  dedupingInterval: 0, // Disable deduplication
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  fetcher: swrFetcher
}
