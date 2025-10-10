import { WalletConnectButton } from '@/components/ui/wallet-connect-button'

export function Header() {
  return (
    <header className="container flex h-16 max-w-screen items-center justify-between px-6 border-b border-border/40 backdrop-blur-sm bg-card/50">
      <div className="flex items-center space-x-3">
        <img src="/yum-logo.svg" alt="YUM Logo" className="w-8 h-8" />
        <h1 className="text-xl font-bold yum-gradient">YUM DAO</h1>
      </div>
      <nav className="flex items-center space-x-4">
        <WalletConnectButton />
      </nav>
    </header>
  )
}
