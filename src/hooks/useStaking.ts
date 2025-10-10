import {
  ERC20_ABI,
  STAKING_ABI,
  STAKING_CONTRACT_ADDRESS,
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

// Hook to get YUM token balance
export function useYumBalance() {
  const { address } = useAccount()

  const {
    data: balance,
    error,
    isLoading,
    refetch,
  } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  console.log({
    balance,
    error,
    isLoading,
  })

  const { data: decimals } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
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

// Hook to get YUM token allowance for staking contract
export function useYumAllowance() {
  const { address } = useAccount()

  const {
    data: allowance,
    isLoading,
    refetch,
  } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, STAKING_CONTRACT_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: decimals } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
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

// Hook to get staked YUM balance
export function useStakedBalance() {
  const { address } = useAccount()

  const {
    data: stakedAmount,
    isLoading,
    refetch,
  } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
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

// Hook to approve YUM tokens for staking
export function useApproveYum() {
  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const { data: decimals } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const approve = async (amount: string) => {
    if (!decimals) throw new Error('Failed to get token decimals')

    const parsedAmount = parseUnits(amount, decimals as number)

    return writeContract({
      address: YUM_TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [STAKING_CONTRACT_ADDRESS, parsedAmount],
      // Gas estimation is automatically handled by writeContract
      // You can optionally override with specific gas settings:
      // gas: 100000n, // Custom gas limit
      // gasPrice: parseGwei('20'), // Custom gas price
      // maxFeePerGas: parseGwei('20'), // EIP-1559
      // maxPriorityFeePerGas: parseGwei('1'), // EIP-1559
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

// Hook to stake YUM tokens with gas estimation
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

  // Simulate the stake transaction for the provided amount
  const parsedAmount =
    amount && decimals ? parseUnits(amount, decimals as number) : undefined

  const simulation = useSimulateContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'deposit',
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

  const stake = async (
    stakeAmount: string,
    customGasOptions?: {
      gasLimit?: bigint
      maxFeePerGas?: bigint
      maxPriorityFeePerGas?: bigint
    },
  ) => {
    if (!decimals) throw new Error('Failed to get token decimals')

    const parsedStakeAmount = parseUnits(stakeAmount, decimals as number)

    return writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'deposit',
      args: [parsedStakeAmount],
      // Apply custom gas options if provided
      ...(customGasOptions?.gasLimit && { gas: customGasOptions.gasLimit }),
      ...(customGasOptions?.maxFeePerGas && {
        maxFeePerGas: customGasOptions.maxFeePerGas,
      }),
      ...(customGasOptions?.maxPriorityFeePerGas && {
        maxPriorityFeePerGas: customGasOptions.maxPriorityFeePerGas,
      }),
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

// Hook to unstake YUM tokens
export function useUnstakeYum() {
  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const { data: decimals } = useReadContract({
    address: YUM_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  const unstake = async (amount: string) => {
    if (!decimals) throw new Error('Failed to get token decimals')

    const parsedAmount = parseUnits(amount, decimals as number)

    return writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'withdraw',
      args: [parsedAmount],
      // Gas estimation is automatically handled by writeContract
      // You can optionally override with specific gas settings:
      // gas: 120000n, // Custom gas limit for unstaking
      // maxFeePerGas: parseGwei('25'), // Custom max fee
      // maxPriorityFeePerGas: parseGwei('1.5'), // Priority fee
    })
  }

  return {
    unstake,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
  }
}

// Utility hook for gas estimation examples
export function useGasEstimation() {
  const { address } = useAccount()

  // Example: Get gas estimate for a specific staking amount
  const getStakeGasEstimate = (amount: string) => {
    if (!address) return null

    const parsedAmount = parseUnits(amount, 18) // Assuming 18 decimals

    return useSimulateContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'deposit',
      args: [parsedAmount],
      account: address,
      query: {
        enabled: !!address && !!amount && !isNaN(Number(amount)),
      },
    })
  }

  return {
    getStakeGasEstimate,
  }
}
