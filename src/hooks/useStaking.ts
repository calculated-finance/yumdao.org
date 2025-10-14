import {
  ERC20_ABI,
  STAKING_ABI,
  VYUM_TOKEN_ADDRESS,
  YUM_TOKEN_ADDRESS,
} from '@/lib/contracts'
import { formatUnits, parseUnits } from 'viem'
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

export function useERC20Balance(tokenAddress: `0x${string}`) {
  const { address } = useAccount()

  console.log('Fetching ERC20 balance for address:', address)

  const {
    data: balance,
    error,
    isLoading,
    refetch,
  } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  console.log(balance, error, isLoading)

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const formattedBalance =
    balance && decimals !== undefined
      ? formatUnits(balance as bigint, decimals as number)
      : '0'

  return {
    balance: formattedBalance,
    rawBalance: balance as bigint | undefined,
    decimals: decimals as number | undefined,
    isLoading,
    refetch,
  }
}

export function useERC20TotalSupply(tokenAddress: `0x${string}`) {
  const {
    data: totalSupply,
    isLoading,
    refetch,
  } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'totalSupply',
  })

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const formattedTotalSupply =
    totalSupply && decimals !== undefined
      ? formatUnits(totalSupply as bigint, decimals as number)
      : '0'

  return {
    totalSupply: formattedTotalSupply,
    rawTotalSupply: totalSupply as bigint | undefined,
    decimals: decimals as number | undefined,
    isLoading,
    refetch,
  }
}

export function useERC20Allowance(
  tokenAddress: `0x${string}`,
  spender: `0x${string}`,
) {
  const { address } = useAccount()

  const {
    data: allowance,
    isLoading,
    refetch,
  } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, spender] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const formattedAllowance =
    allowance && decimals !== undefined
      ? formatUnits(allowance as bigint, decimals as number)
      : '0'

  return {
    allowance: formattedAllowance,
    rawAllowance: allowance as bigint | undefined,
    decimals: decimals as number | undefined,
    isLoading,
    refetch,
  }
}

export function useStakedBalance() {
  const { address } = useAccount()

  const {
    data: stakedAmount,
    isLoading,
    refetch,
  } = useReadContract({
    address: VYUM_TOKEN_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getStakedAmount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: decimals } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const formattedStaked =
    stakedAmount && decimals !== undefined
      ? formatUnits(stakedAmount as bigint, decimals as number)
      : '0'

  return {
    stakedBalance: formattedStaked,
    rawStakedBalance: stakedAmount as bigint | undefined,
    decimals: decimals as number | undefined,
    isLoading,
    refetch,
  }
}

export function useApproveERC20(
  tokenAddress: `0x${string}`,
  spender: `0x${string}`,
) {
  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const approve = async (amount: string) => {
    if (!decimals) throw new Error('Failed to get token decimals')

    const parsedAmount = parseUnits(amount, decimals as number)

    return writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, parsedAmount],
    })
  }

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useStakeYum(amount?: string) {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { address } = useAccount()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const { data: decimals } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const parsedAmount =
    amount && decimals ? parseUnits(amount, decimals as number) : undefined

  const simulation = useSimulateContract({
    address: VYUM_TOKEN_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'deposit',
    args: parsedAmount && address ? [parsedAmount, address] : undefined,
    account: address,
    query: {
      enabled:
        !!address &&
        !!decimals &&
        !!amount &&
        !isNaN(Number(amount)) &&
        Number(amount) > 0,
    },
  })

  const stake = async (stakeAmount: string) => {
    if (!decimals) throw new Error('Failed to get token decimals')
    if (!address) throw new Error('No connected wallet address')

    const parsedStakeAmount = parseUnits(stakeAmount, decimals as number)

    return writeContract({
      address: VYUM_TOKEN_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'deposit',
      args: [parsedStakeAmount, address],
    })
  }

  return {
    stake,
    simulation,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useUnstakeYum(amount?: string) {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { address } = useAccount()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const { data: decimals } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const parsedAmount =
    amount && decimals ? parseUnits(amount, decimals as number) : undefined

  const simulation = useSimulateContract({
    address: VYUM_TOKEN_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'requestRedeem',
    args: parsedAmount ? [parsedAmount] : undefined,
    account: address,
    query: {
      enabled:
        !!address &&
        !!decimals &&
        !!amount &&
        !isNaN(Number(amount)) &&
        Number(amount) > 0,
    },
  })

  console.log(simulation)

  const unstake = async (unstakeAmount: string) => {
    if (!decimals) throw new Error('Failed to get token decimals')

    const parsedUnstakeAmount = parseUnits(unstakeAmount, decimals as number)

    return writeContract({
      address: VYUM_TOKEN_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'requestRedeem',
      args: [parsedUnstakeAmount],
    })
  }

  return {
    unstake,
    simulation,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useUnstakingRequests() {
  const { address } = useAccount()

  const {
    data: requests,
    isLoading,
    refetch,
  } = useReadContract({
    address: VYUM_TOKEN_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'fetchRequests',
    args: address ? [address, 0] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: decimals } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const { data: cooldownPeriod } = useReadContract({
    address: VYUM_TOKEN_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'cooldownPeriod',
  })

  const formattedRequests =
    requests && decimals && cooldownPeriod
      ? (requests as any[]).map((request: any) => ({
          id: request.id,
          shares: request.shares,
          amount: formatUnits(request.shares as bigint, decimals as number),
          timeOfRequest: new Date(Number(request.timeOfRequest) * 1000),
          availableAt: new Date(
            (Number(request.timeOfRequest) + Number(cooldownPeriod)) * 1000,
          ),
          status: request.status,
        }))
      : []

  return {
    requests: formattedRequests,
    rawRequests: requests as any[] | undefined,
    isLoading,
    refetch,
  }
}

export function useCancelRequest() {
  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const cancelRequest = async (requestId: string | number) => {
    return writeContract({
      address: VYUM_TOKEN_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'cancelRequest',
      args: [BigInt(requestId)],
    })
  }

  return {
    cancelRequest,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

export function useCalculateAPY() {
  const { data: assetsFromOneVYUM } = useReadContract({
    address: VYUM_TOKEN_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'convertToAssets',
    args: [parseUnits('1', 18)],
  })

  const { data: decimals } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const contractDeploymentDate = new Date(1721433600000)

  const calculateAPY = () => {
    if (!assetsFromOneVYUM || !decimals) return null

    const yumPerVYUM = Number(
      formatUnits(assetsFromOneVYUM as bigint, decimals as number),
    )

    const now = new Date()
    const timeElapsedMs = now.getTime() - contractDeploymentDate.getTime()
    const timeElapsedYears = timeElapsedMs / (1000 * 60 * 60 * 24 * 365.25)

    if (timeElapsedYears < 1 / 365.25) return null

    const apy = Math.pow(yumPerVYUM, 1 / timeElapsedYears) - 1

    return {
      apy: apy * 100,
      currentRate: yumPerVYUM,
      timeElapsedYears,
      deploymentDate: contractDeploymentDate,
    }
  }

  const result = calculateAPY()

  return {
    apy: result?.apy
      ? result.apy.toLocaleString(undefined, { maximumFractionDigits: 1 })
      : null,
    currentRate: result?.currentRate,
    timeElapsedYears: result?.timeElapsedYears,
    deploymentDate: result?.deploymentDate,
    isLoading: !assetsFromOneVYUM || !decimals,
    rawAssetsFromOneVYUM: assetsFromOneVYUM,
  }
}
