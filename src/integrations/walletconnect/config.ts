import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { arbitrum } from '@reown/appkit/networks'

export const projectId = '5c06da8ccdd14f20486cab1f9c13be72'

export const networks = [arbitrum]

export const metadata = {
  name: 'YUM DAO',
  description: 'YUM DAO',
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
