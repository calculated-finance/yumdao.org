import { YumPriceChart } from '@/components/YumPriceChart'
import { YumStakingForm } from '@/components/YumStakingForm'
import { useERC20Balance } from '@/hooks/useStaking'
import { VYUM_TOKEN_ADDRESS, YUM_TOKEN_ADDRESS } from '@/lib/contracts'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { balance: yumBalance, isLoading: isLoadingYum } =
    useERC20Balance(YUM_TOKEN_ADDRESS)
  const { balance: vYumBalance, isLoading: isLoadingvYum } =
    useERC20Balance(VYUM_TOKEN_ADDRESS)

  const isLoading = isLoadingYum || isLoadingvYum

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between">
        <div className="mb-8">
          <div className="flex gap-2 items-center mb-2">
            <img src="yum.svg" alt="YUM Icon" className="mt-1 h-9 w-9" />
            <h1 className="text-4xl font-bold tracking-tight ">
              YUM Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Track YUM token price and manage your staking positions
          </p>
        </div>
        {!isLoading && (
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <img src="yum.svg" alt="YUM Icon" className="h-9 w-9" />
              <span className="text-white text-3xl font-bold">
                {Number(yumBalance).toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}{' '}
                YUM
              </span>
            </div>
            <div className="flex items-center gap-3">
              <img src="vyum.svg" alt="vYUM Icon" className="h-9 w-9" />
              <span className="text-white text-3xl font-bold">
                {Number(vYumBalance).toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}{' '}
                vYUM
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <YumPriceChart />
        </div>
        <div>
          <YumStakingForm />
        </div>
      </div>
    </div>
  )
}
