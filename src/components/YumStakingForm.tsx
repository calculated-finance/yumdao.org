import { StakingInfoPanel } from '@/components/StakingInfoPanel'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UnstakingRequestsCard } from '@/components/UnstakingRequestsCard'
import {
  useApproveERC20,
  useERC20Allowance,
  useERC20Balance,
  useStakeYum,
  useUnstakeYum,
  useUnstakingRequests,
} from '@/hooks/useStaking'
import { useToast } from '@/hooks/useToast'
import { VYUM_TOKEN_ADDRESS, YUM_TOKEN_ADDRESS } from '@/lib/contracts'
import { cn } from '@/lib/utils'
import { useForm } from '@tanstack/react-form'
import { useEffect, useState } from 'react'
import { parseUnits } from 'viem'
import { useAccount } from 'wagmi'

interface StakeFormData {
  amount: string
}

interface UnstakeFormData {
  amount: string
}

export function YumStakingForm() {
  const { isConnected, address } = useAccount()
  const [isStaking, setIsStaking] = useState(true)
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const { toast } = useToast()

  const { balance: yumBalance, refetch: refetchYumBalance } =
    useERC20Balance(YUM_TOKEN_ADDRESS)

  const { balance: vYumBalance, refetch: refetchVyumBalance } =
    useERC20Balance(VYUM_TOKEN_ADDRESS)

  const { allowance: stakingAllowance, refetch: refetchAllowance } =
    useERC20Allowance(YUM_TOKEN_ADDRESS, VYUM_TOKEN_ADDRESS)

  const {
    approve,
    isPending: isApproving,
    isConfirmed: isApproved,
  } = useApproveERC20(YUM_TOKEN_ADDRESS, VYUM_TOKEN_ADDRESS)

  const {
    stake,
    simulation: stakeSimulation,
    isPending: isStakePending,
    isConfirmed: isStakeConfirmed,
  } = useStakeYum(stakeAmount)

  const {
    unstake,
    simulation: unstakeSimulation,
    isPending: isUnstakePending,
    isConfirmed: isUnstakeConfirmed,
  } = useUnstakeYum(unstakeAmount)

  const { requests: pendingRequests, refetch: refetchRequests } =
    useUnstakingRequests()

  const unstakeableAmount = pendingRequests
    .reduce((total, req) => {
      return total - Number(req.amount)
    }, Number(vYumBalance))
    .toString()

  useEffect(() => {
    if (isApproved) {
      refetchAllowance()
      toast({
        title: 'Approval Successful',
        description: 'YUM tokens approved for staking',
        variant: 'success',
      })
    }
  }, [isApproved, refetchAllowance, toast])

  useEffect(() => {
    if (isStakeConfirmed) {
      refetchYumBalance()
      refetchVyumBalance()
      refetchAllowance()
      setStakeAmount('')
      toast({
        title: 'Staking Successful',
        description: 'YUM tokens have been staked successfully',
        variant: 'success',
      })
    }
  }, [
    isStakeConfirmed,
    refetchYumBalance,
    refetchVyumBalance,
    refetchAllowance,
    toast,
  ])

  useEffect(() => {
    if (isUnstakeConfirmed) {
      refetchYumBalance()
      refetchVyumBalance()
      refetchRequests()
      setUnstakeAmount('')
      toast({
        title: 'Unstaking Successful',
        description: 'YUM tokens have been unstaked successfully',
        variant: 'success',
      })
    }
  }, [
    isUnstakeConfirmed,
    refetchYumBalance,
    refetchVyumBalance,
    refetchRequests,
    toast,
  ])

  const stakeForm = useForm({
    defaultValues: {
      amount: '',
    },
    onSubmit: async ({ value }: { value: StakeFormData }) => {
      if (!isConnected || !address) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet to stake',
          variant: 'error',
        })
        return
      }

      try {
        const amount = value.amount.trim()
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
          toast({
            title: 'Invalid Amount',
            description: 'Please enter a valid amount to stake',
            variant: 'error',
          })
          return
        }

        if (Number(amount) > Number(yumBalance)) {
          toast({
            title: 'Insufficient Balance',
            description:
              'You do not have enough YUM tokens to stake this amount',
            variant: 'error',
          })
          return
        }

        const requiredAllowance = parseUnits(amount, 18)
        const currentAllowance = parseUnits(stakingAllowance || '0', 18)

        if (currentAllowance < requiredAllowance) {
          toast({
            title: 'Approval Required',
            description: 'Approving YUM tokens for staking...',
            variant: 'default',
          })
          await approve(amount)
          return
        }

        toast({
          title: 'Staking in Progress',
          description: 'Staking transaction submitted...',
          variant: 'default',
        })

        await stake(amount)
        stakeForm.reset()
        setStakeAmount('')
      } catch (error) {
        console.error('Staking failed:', error)
        toast({
          title: 'Staking Failed',
          description:
            error instanceof Error
              ? error.message
              : 'An error occurred while staking',
          variant: 'error',
        })
      }
    },
  })

  const unstakeForm = useForm({
    defaultValues: {
      amount: '',
    },
    onSubmit: async ({ value }: { value: UnstakeFormData }) => {
      if (!isConnected || !address) {
        toast({
          title: 'Wallet Not Connected',
          description: 'Please connect your wallet to unstake',
          variant: 'error',
        })
        return
      }

      try {
        const amount = value.amount.trim()
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
          toast({
            title: 'Invalid Amount',
            description: 'Please enter a valid amount to unstake',
            variant: 'error',
          })
          return
        }

        if (Number(amount) > Number(unstakeableAmount)) {
          toast({
            title: 'Insufficient Staked Balance',
            description:
              'You do not have enough staked YUM tokens to unstake this amount',
            variant: 'error',
          })
          return
        }

        toast({
          title: 'Unstaking in Progress',
          description: 'Unstaking transaction submitted...',
          variant: 'default',
        })

        await unstake(amount)
        unstakeForm.reset()
        setUnstakeAmount('')
      } catch (error) {
        console.error('Unstaking failed:', error)
        toast({
          title: 'Unstaking Failed',
          description:
            error instanceof Error
              ? error.message
              : 'An error occurred while unstaking',
          variant: 'error',
        })
      }
    },
  })

  const handleMaxStake = () => {
    const maxAmount = yumBalance.replace(',', '')
    stakeForm.setFieldValue('amount', maxAmount)
    setStakeAmount(maxAmount)
  }

  const handleMaxUnstake = () => {
    const maxAmount = unstakeableAmount
    unstakeForm.setFieldValue('amount', maxAmount)
    setUnstakeAmount(maxAmount)
  }

  return (
    <div className="space-y-6">
      <StakingInfoPanel />

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              YUM Staking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Please connect your wallet to stake YUM
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Tabs defaultValue="stake" className="w-full">
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                YUM Staking
                <div className="flex gap-1">
                  <TabsList className="bg-transparent flex gap-1">
                    <TabsTrigger
                      value="stake"
                      className="px-0 border-none bg-transparent"
                    >
                      <Button
                        key="staking"
                        variant={isStaking ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsStaking(true)}
                        className={cn({
                          'yum-gradient-bg text-background border-0 shadow-lg hover:shadow-xl transition-all duration-200':
                            isStaking,
                          'border-primary/30 text-white hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200':
                            !isStaking,
                        })}
                      >
                        <span className="font-mono">Stake</span>
                      </Button>
                    </TabsTrigger>
                    <TabsTrigger
                      value="unstake"
                      className="px-0 border-none bg-transparent"
                    >
                      <Button
                        key="unstaking"
                        variant={!isStaking ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsStaking(false)}
                        className={cn({
                          'yum-gradient-bg text-background border-0 shadow-lg hover:shadow-xl transition-all duration-200':
                            !isStaking,
                          'border-primary/30 text-white hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200':
                            isStaking,
                        })}
                      >
                        <span className="font-mono">Unstake</span>
                      </Button>
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TabsContent value="stake" className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    stakeForm.handleSubmit()
                  }}
                  className="space-y-4"
                >
                  <stakeForm.Field
                    name="amount"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return 'Amount is required'
                        const numValue = parseFloat(value)
                        if (isNaN(numValue) || numValue <= 0)
                          return 'Please enter a valid amount'
                        const maxBalance = parseFloat(
                          yumBalance.replace(',', '') || '0',
                        )
                        if (numValue > maxBalance) return 'Insufficient balance'
                        return undefined
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            id="stake-amount"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const value = e.target.value
                              field.handleChange(value)
                              setStakeAmount(value)
                            }}
                            placeholder="0.00 (Amount to Stake)"
                            type="number"
                            step="0.000001"
                            className="pr-16"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleMaxStake}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto py-1 px-2 text-xs font-mono font-semibold text-muted-foreground"
                          >
                            MAX
                          </Button>
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </stakeForm.Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isApproving ||
                      isStakePending ||
                      !stakeForm.state.isValid ||
                      (!!stakeAmount &&
                        stakeAmount !== '0' &&
                        !stakeSimulation?.data) // Disable if simulation fails
                    }
                  >
                    {isApproving
                      ? 'Approving...'
                      : isStakePending
                        ? 'Staking...'
                        : stakeSimulation?.isLoading &&
                            !!stakeAmount &&
                            stakeAmount !== '0'
                          ? 'Simulating Transaction...'
                          : !!stakeAmount &&
                              stakeAmount !== '0' &&
                              stakeSimulation?.error
                            ? 'Invalid Transaction'
                            : 'Stake YUM'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="unstake" className="space-y-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    unstakeForm.handleSubmit()
                  }}
                  className="space-y-4"
                >
                  <unstakeForm.Field
                    name="amount"
                    validators={{
                      onChange: ({ value }) => {
                        if (!value) return 'Amount is required'
                        const numValue = parseFloat(value)
                        if (isNaN(numValue) || numValue <= 0)
                          return 'Please enter a valid amount'
                        const maxStaked = parseFloat(vYumBalance || '0')
                        if (numValue > maxStaked)
                          return 'Insufficient staked balance'
                        return undefined
                      },
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            id="unstake-amount"
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                              const value = e.target.value
                              field.handleChange(value)
                              setUnstakeAmount(value) // Update tracked amount for simulation
                            }}
                            placeholder="0.00 (Amount to Unstake)"
                            type="number"
                            step="0.000001"
                            className="pr-16"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleMaxUnstake}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto py-1 px-2 text-xs font-mono font-semibold text-muted-foreground"
                          >
                            MAX
                          </Button>
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </unstakeForm.Field>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isUnstakePending ||
                      !unstakeForm.state.isValid ||
                      (!!unstakeAmount &&
                        unstakeAmount !== '0' &&
                        !unstakeSimulation?.data) // Disable if simulation fails
                    }
                  >
                    {isUnstakePending
                      ? 'Unstaking...'
                      : unstakeSimulation?.isLoading &&
                          !!unstakeAmount &&
                          unstakeAmount !== '0'
                        ? 'Simulating Transaction...'
                        : !!unstakeAmount &&
                            unstakeAmount !== '0' &&
                            unstakeSimulation?.error
                          ? 'Invalid Transaction'
                          : 'Unstake YUM'}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      )}

      <UnstakingRequestsCard />
    </div>
  )
}
