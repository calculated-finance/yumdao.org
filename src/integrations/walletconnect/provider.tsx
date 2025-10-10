import { arbitrum } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { metadata, projectId, wagmiAdapter } from './config'
import type { ReactNode } from 'react'

const queryClient = new QueryClient()

const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId,
  networks: [arbitrum],
  metadata,
  features: {
    analytics: true,
  },
})

export function getContext() {
  return { queryClient, appKit, wagmiAdapter, projectId, metadata }
}

interface WalletConnectProviderProps {
  children: ReactNode
}

export function Provider({ children }: WalletConnectProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
