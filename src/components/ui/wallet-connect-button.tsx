import type { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { arbitrum } from '@reown/appkit/networks'
import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react'
import type { VariantProps } from 'class-variance-authority'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'
import { useAccount, useSwitchChain } from 'wagmi'

interface WalletConnectButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  connectText?: string
  disconnectText?: string
  showAddress?: boolean
  asChild?: boolean
}

export function WalletConnectButton({
  connectText = 'Connect Wallet',
  disconnectText = 'Disconnect',
  showAddress = true,
  variant = 'default',
  size = 'default',
  asChild = false,
  className,
  ...props
}: WalletConnectButtonProps) {
  const { open } = useAppKit()
  const { disconnect } = useDisconnect()
  const { allAccounts } = useAppKitAccount()
  const { address, chainId, connector, isConnected } = useAccount()

  const { switchChain } = useSwitchChain()

  React.useEffect(() => {
    if (chainId === arbitrum.id) return

    switchChain({
      chainId: arbitrum.id,
      connector: connector,
    })
  }, [chainId])

  if (isConnected && address) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={`${className} flex items-center gap-2`}
            {...props}
          >
            <img height={14} width={14} src={connector?.icon} />
            <span>{connector?.name}</span>
            {showAddress
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : disconnectText}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="end">
          <div className="space-y-2">
            {allAccounts.map((account) => (
              <div
                key={account.address}
                className={`flex items-center justify-start space-x-4 p-2 rounded-md cursor-pointer transition-colors hover:bg-muted ${
                  account.address === address ? 'bg-muted' : ''
                }`}
                onClick={() => open({ view: 'Account' })}
              >
                <img
                  height={30}
                  width={30}
                  src={connector?.icon}
                  className="rounded"
                />
                <div className="flex flex-col">
                  <div className="text-sm font-medium">
                    {account.address.slice(0, 6)}...
                    {account.address.slice(-4)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {connector?.name}
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-2 flex justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm"
                onClick={() => open({ view: 'Connect' })}
              >
                Switch
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-red-400"
                onClick={() => disconnect()}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Button
      onClick={() => open({ view: 'Connect' })}
      variant={variant}
      size={size}
      asChild={asChild}
      className={className}
      {...props}
    >
      {connectText}
    </Button>
  )
}
