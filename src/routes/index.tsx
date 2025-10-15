import { YumPriceChart } from '@/components/YumPriceChart'
import { YumStakingForm } from '@/components/YumStakingForm'
import { useERC20Balance } from '@/hooks/useStaking'
import { VYUM_TOKEN_ADDRESS, YUM_TOKEN_ADDRESS } from '@/lib/contracts'
import { createFileRoute } from '@tanstack/react-router'
import { useAccount } from 'wagmi'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { isConnected } = useAccount()

  const { balance: yumBalance, isLoading: isLoadingYum } =
    useERC20Balance(YUM_TOKEN_ADDRESS)

  const { balance: vYumBalance, isLoading: isLoadingVyum } =
    useERC20Balance(VYUM_TOKEN_ADDRESS)

  const isLoading = isLoadingYum || isLoadingVyum

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
        <div className="mb-4 lg:mb-8">
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
        {isConnected && !isLoading && (
          <div className="flex gap-4 sm:gap-8 mb-8 lg:mb-0 items-end">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="yum.svg"
                alt="YUM Icon"
                className="h-6 w-6 sm:h-8 sm:w-8"
              />
              <div className="flex items-end gap-1 sm:gap-2">
                <span className="text-white text-xl sm:text-3xl font-mono font-bold">
                  {Number(yumBalance).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}{' '}
                </span>
                <span className="text-muted-foreground text-lg sm:text-2xl font-semibold">
                  YUM
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="vyum.svg"
                alt="vYUM Icon"
                className="h-6 w-6 sm:h-8 sm:w-8"
              />
              <div className="flex items-end gap-1 sm:gap-2">
                <span className="text-white text-xl sm:text-3xl font-bold font-mono">
                  {Number(vYumBalance).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}{' '}
                </span>
                <span className="text-muted-foreground text-lg sm:text-2xl font-semibold">
                  vYUM
                </span>
              </div>
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
