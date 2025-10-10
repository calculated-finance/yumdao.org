import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useApproveYum,
  useStakedBalance,
  useStakeYum,
  useUnstakeYum,
  useYumAllowance,
  useYumBalance,
} from '@/hooks/useStaking'
import { useToast } from '@/hooks/useToast'
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
  const [isStaking, setIsStaking] = useState(false)
  const [stakeAmount, setStakeAmount] = useState('')
  const { toast } = useToast()

  // Contract hooks
  const { balance, refetch: refetchBalance } = useYumBalance()
  const { allowance, refetch: refetchAllowance } = useYumAllowance()
  const { stakedBalance, refetch: refetchStaked } = useStakedBalance()

  const {
    approve,
    isPending: isApproving,
    isConfirmed: isApproved,
  } = useApproveYum()
  const {
    stake,
    simulation: stakeSimulation,
    isPending: isStakePending,
    isConfirmed: isStakeConfirmed,
  } = useStakeYum(stakeAmount)
  const {
    unstake,
    isPending: isUnstakePending,
    isConfirmed: isUnstakeConfirmed,
  } = useUnstakeYum()

  // Refresh data when transactions complete
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
      refetchBalance()
      refetchStaked()
      refetchAllowance()
      setStakeAmount('') // Clear tracked amount when stake is confirmed
      toast({
        title: 'Staking Successful',
        description: 'YUM tokens have been staked successfully',
        variant: 'success',
      })
    }
  }, [isStakeConfirmed, refetchBalance, refetchStaked, refetchAllowance, toast])

  useEffect(() => {
    if (isUnstakeConfirmed) {
      refetchBalance()
      refetchStaked()
      toast({
        title: 'Unstaking Successful',
        description: 'YUM tokens have been unstaked successfully',
        variant: 'success',
      })
    }
  }, [isUnstakeConfirmed, refetchBalance, refetchStaked, toast])

  const mockEstimatedAPY = '12.5'

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

        // Check if user has enough balance
        if (Number(amount) > Number(balance)) {
          toast({
            title: 'Insufficient Balance',
            description:
              'You do not have enough YUM tokens to stake this amount',
            variant: 'error',
          })
          return
        }

        // Check if allowance is sufficient
        const requiredAllowance = parseUnits(amount, 18) // Assuming 18 decimals
        const currentAllowance = parseUnits(allowance || '0', 18)

        if (currentAllowance < requiredAllowance) {
          // Need to approve first
          toast({
            title: 'Approval Required',
            description: 'Approving YUM tokens for staking...',
            variant: 'default',
          })
          await approve(amount)
          return // Wait for approval to complete before staking
        }

        // Proceed with staking
        toast({
          title: 'Staking in Progress',
          description: 'Staking transaction submitted...',
          variant: 'default',
        })

        // Get gas estimate from simulation and add 20% buffer
        const gasLimit = stakeSimulation?.data?.request?.gas
          ? (stakeSimulation.data.request.gas * 120n) / 100n
          : undefined

        await stake(amount, {
          gasLimit,
        })
        stakeForm.reset()
        setStakeAmount('') // Clear the tracked amount
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

        // Check if user has enough staked balance
        if (Number(amount) > Number(stakedBalance)) {
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
    const maxAmount = balance.replace(',', '')
    stakeForm.setFieldValue('amount', maxAmount)
    setStakeAmount(maxAmount) // Update tracked amount for simulation
  }

  const handleMaxUnstake = () => {
    unstakeForm.setFieldValue('amount', stakedBalance)
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            YUM Staking
            <div className="flex gap-1">
              <Button
                key="staking"
                variant={isStaking ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsStaking(true)}
                className={
                  isStaking
                    ? 'yum-gradient-bg text-background border-0 shadow-lg hover:shadow-xl transition-all duration-200'
                    : 'border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200'
                }
              >
                Staking
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Please connect your wallet to start staking
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Tabs defaultValue="stake" className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
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
                      'border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200':
                        !isStaking,
                    })}
                  >
                    Stake
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
                      'border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200':
                        isStaking,
                    })}
                  >
                    Unstake
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
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Available Balance
                  </span>
                  <span className="font-semibold">{balance} YUM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Estimated APY
                  </span>
                  <span className="font-semibold text-green-600">
                    {mockEstimatedAPY}%
                  </span>
                </div>
              </div>

              <stakeForm.Field
                name="amount"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Amount is required'
                    const numValue = parseFloat(value)
                    if (isNaN(numValue) || numValue <= 0)
                      return 'Please enter a valid amount'
                    const maxBalance = parseFloat(
                      balance.replace(',', '') || '0',
                    )
                    if (numValue > maxBalance) return 'Insufficient balance'
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="stake-amount">Amount to Stake</Label>
                    <div className="relative">
                      <Input
                        id="stake-amount"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const value = e.target.value
                          field.handleChange(value)
                          setStakeAmount(value) // Update tracked amount for simulation
                        }}
                        placeholder="0.00"
                        type="number"
                        step="0.000001"
                        className="pr-16"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleMaxStake}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto py-1 px-2 text-xs"
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
                      ? 'Validating...'
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
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Staked Balance
                  </span>
                  <span className="font-semibold">{stakedBalance} YUM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Pending Rewards
                  </span>
                  <span className="font-semibold text-green-600">
                    Coming Soon
                  </span>
                </div>
              </div>

              <unstakeForm.Field
                name="amount"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'Amount is required'
                    const numValue = parseFloat(value)
                    if (isNaN(numValue) || numValue <= 0)
                      return 'Please enter a valid amount'
                    const maxStaked = parseFloat(stakedBalance || '0')
                    if (numValue > maxStaked)
                      return 'Insufficient staked balance'
                    return undefined
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor="unstake-amount">Amount to Unstake</Label>
                    <div className="relative">
                      <Input
                        id="unstake-amount"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="0.00"
                        type="number"
                        step="0.000001"
                        className="pr-16"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleMaxUnstake}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto py-1 px-2 text-xs"
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
                disabled={isUnstakePending || !unstakeForm.state.isValid}
              >
                {isUnstakePending ? 'Unstaking...' : 'Unstake YUM'}
              </Button>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
