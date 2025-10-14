import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCalculateAPY, useERC20TotalSupply } from '@/hooks/useStaking'
import { useYumCurrentPrice } from '@/hooks/useYumPrice'
import { VYUM_TOKEN_ADDRESS } from '@/lib/contracts'

export function StakingInfoPanel() {
  const { totalSupply: vYumTotalSupply, isLoading: isLoadingTotalSupply } =
    useERC20TotalSupply(VYUM_TOKEN_ADDRESS)

  const { apy, currentRate, isLoading: isLoadingAPY } = useCalculateAPY()

  const { data: yumPriceData } = useYumCurrentPrice()

  const yumStaked = currentRate ? Number(vYumTotalSupply) * currentRate : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staking Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Lifetime APY
              </span>
              <span className="font-semibold text-green-600">
                {isLoadingAPY ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : apy ? (
                  `${apy}%`
                ) : (
                  <span className="text-muted-foreground">Calculating...</span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">vYUM Price</span>
              <span className="font-semibold">
                {!currentRate ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : (
                  `$${(
                    currentRate * (yumPriceData?.current_price ?? 0)
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 4,
                  })}`
                )}
              </span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Total supply staked
              </span>
              <span className="font-semibold">
                {isLoadingTotalSupply || !currentRate ? (
                  <span className="text-muted-foreground">Loading...</span>
                ) : (
                  `${(yumStaked / 1_000_000).toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}%`
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Unstaking Period
              </span>
              <span className="font-semibold">2 weeks</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
