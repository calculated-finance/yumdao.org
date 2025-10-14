import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export type TimeFrame = 7 | 30 | 365

export interface YumPriceData {
  prices: Array<[number, number]>
  market_caps: Array<[number, number]>
  total_volumes: Array<[number, number]>
}

export interface YumCurrentPrice {
  current_price: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
}

const fetchYumPriceHistory = async (days: TimeFrame): Promise<YumPriceData> => {
  const response = await axios.get(
    `https://pro-api.coingecko.com/api/v3/coins/yum/market_chart?vs_currency=usd&days=${days}`,
    {
      headers: {
        'x-cg-pro-api-key': import.meta.env.VITE_COINGECKO_API_KEY,
        'Allow-Control-Allow-Origin': '*',
      },
    },
  )

  if (response.status !== 200) {
    throw new Error('Failed to fetch YUM price data')
  }

  return response.data
}

const fetchYumCurrentPrice = async (): Promise<YumCurrentPrice> => {
  const response = await axios.get(
    `https://pro-api.coingecko.com/api/v3/simple/price?ids=yum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
    {
      headers: {
        'x-cg-pro-api-key': import.meta.env.VITE_COINGECKO_API_KEY,
        'Allow-Control-Allow-Origin': '*',
      },
    },
  )

  if (response.status !== 200) {
    throw new Error('Failed to fetch YUM current price')
  }

  const data = response.data

  return {
    current_price: data.yum.usd,
    price_change_24h: data.yum.usd_24h_change || 0,
    price_change_percentage_24h: data.yum.usd_24h_change || 0,
    market_cap: data.yum.usd_market_cap || 0,
    total_volume: data.yum.usd_24h_vol || 0,
  }
}

export const useYumPriceHistory = (timeFrame: TimeFrame = 7) => {
  return useQuery({
    queryKey: ['yum-price-history', timeFrame],
    queryFn: () => fetchYumPriceHistory(timeFrame),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  })
}

export const useYumCurrentPrice = () => {
  return useQuery({
    queryKey: ['yum-current-price'],
    queryFn: fetchYumCurrentPrice,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  })
}
