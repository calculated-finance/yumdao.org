import { WalletConnectButton } from '@/components/ui/wallet-connect-button'

export function Header() {
  return (
    <header className="container flex h-16 max-w-screen justify-end px-4 py-2">
      <nav className="flex items-center space-x-4">
        <WalletConnectButton />
      </nav>
    </header>
  )
}
