import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrum } from '@reown/appkit/networks'

export const projectId = '5c06da8ccdd14f20486cab1f9c13be72'

export const networks = [arbitrum]

export const metadata = {
  name: 'Yum',
  description:
    'A modern web3 application built with TanStack and WalletConnect',
  url:
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000',
  icons: [
    typeof window !== 'undefined'
      ? `${window.location.origin}/yum.svg`
      : '/yum.svg',
  ],
}

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
})
