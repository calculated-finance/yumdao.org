import { YumPriceChart } from '@/components/YumPriceChart'
import { YumStakingForm } from '@/components/YumStakingForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          YUM Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track YUM token price and manage your staking positions
        </p>
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
