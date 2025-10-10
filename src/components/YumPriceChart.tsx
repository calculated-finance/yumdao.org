import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TimeFrame } from '@/hooks/useYumPrice'
import { useYumCurrentPrice, useYumPriceHistory } from '@/hooks/useYumPrice'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const timeFrameLabels: Record<TimeFrame, string> = {
  7: '7D',
  30: '30D',
  365: '1Y',
}

export function YumPriceChart() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>(7)

  const {
    data: priceHistory,
    isLoading: historyLoading,
    error: historyError,
  } = useYumPriceHistory(selectedTimeFrame)
  const {
    data: currentPrice,
    isLoading: priceLoading,
    error: priceError,
  } = useYumCurrentPrice()

  const chartData = useMemo(() => {
    return (
      priceHistory?.prices.map(([timestamp, price]) => ({
        time: timestamp,
        price: price,
        formattedTime: new Date(timestamp).toLocaleDateString(),
      })) || []
    )
  }, [priceHistory])

  const { firstPrice, lastPrice, priceDelta } = useMemo(() => {
    if (!priceHistory || priceHistory.prices.length < 2)
      return {
        firstPrice: 0,
        lastPrice: 0,
        priceDelta: 0,
      }

    const firstPrice = priceHistory.prices[0][1]
    const lastPrice = priceHistory.prices[priceHistory.prices.length - 1][1]

    return {
      firstPrice,
      lastPrice,
      priceDelta: ((lastPrice - firstPrice) / firstPrice) * 100,
    }
  }, [priceHistory])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price)
  }

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage.toFixed(2)}%`
  }

  if (historyError || priceError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>YUM Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Failed to load price data. Please try again later.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          YUM Price
          <div className="flex gap-1">
            {Object.keys(timeFrameLabels).map((timeFrame) => (
              <Button
                key={timeFrame}
                variant={
                  selectedTimeFrame === Number(timeFrame)
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() =>
                  setSelectedTimeFrame(Number(timeFrame) as TimeFrame)
                }
                className={
                  selectedTimeFrame === Number(timeFrame)
                    ? 'yum-gradient-bg text-background border-0 shadow-lg hover:shadow-xl transition-all duration-200'
                    : 'border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200'
                }
              >
                {timeFrameLabels[Number(timeFrame) as TimeFrame]}
              </Button>
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          {priceLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-32 mb-2"></div>
              <div className="h-6 bg-muted rounded w-24"></div>
            </div>
          ) : currentPrice ? (
            <div>
              <div className="text-3xl font-bold mb-1 yum-gradient">
                {formatPrice(currentPrice.current_price)}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={priceDelta >= 0 ? 'default' : 'destructive'}
                  className={`flex items-center gap-1 ${
                    priceDelta >= 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white border-0'
                      : 'bg-gradient-to-r from-red-500 to-pink-400 text-white border-0'
                  }`}
                >
                  {priceDelta >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatPercentage(priceDelta)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Change:{' '}
                  <span className="text-primary font-medium">
                    {formatPrice(lastPrice - firstPrice)}
                  </span>
                </span>
              </div>
            </div>
          ) : null}
        </div>
        <div className="h-64">
          {historyLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-muted-foreground">
                Loading chart...
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="yumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F3FA" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#6C40DE" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#1a1a2e" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="strokeGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#00F3FA" />
                    <stop offset="50%" stopColor="#4FACFE" />
                    <stop offset="100%" stopColor="#6C40DE" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(timestamp) => {
                    const date = new Date(timestamp)
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                  tickLine={{ stroke: '#6B7280', strokeWidth: 1 }}
                />
                <YAxis
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(value) => `$${value.toFixed(4)}`}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                  tickLine={{ stroke: '#6B7280', strokeWidth: 1 }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background/95 backdrop-blur-sm border border-primary/20 rounded-lg p-3 shadow-xl">
                          <p className="text-sm text-muted-foreground mb-1">
                            {new Date(label).toLocaleString()}
                          </p>
                          <p className="font-semibold text-primary">
                            {formatPrice(data.price)}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="url(#strokeGradient)"
                  strokeWidth={2}
                  fill="url(#yumGradient)"
                  filter="url(#glow)"
                  dot={false}
                  activeDot={{
                    r: 3,
                    fill: '#00F3FA',
                    filter: 'url(#glow)',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No price data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
