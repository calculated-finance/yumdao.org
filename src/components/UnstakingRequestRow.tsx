import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { useCancelRequest, useClaimRequest } from '@/hooks/useStaking'
import { useToast } from '@/hooks/useToast'
import { useEffect } from 'react'

interface UnstakingRequest {
  id: bigint | string
  shares: bigint
  amount: string
  timeOfRequest: Date
  status: number
  availableAt?: Date
}

interface UnstakingRequestRowProps {
  request: UnstakingRequest
  onRequestCancelled: () => void
  onRequestClaimed: () => void
}

export function UnstakingRequestRow({
  request,
  onRequestCancelled,
  onRequestClaimed,
}: UnstakingRequestRowProps) {
  const { toast } = useToast()
  const {
    cancelRequest,
    isPending: isCancelPending,
    isConfirmed: isCancelConfirmed,
  } = useCancelRequest()

  const {
    claimRequest,
    isPending: isClaimPending,
    isConfirmed: isClaimConfirmed,
  } = useClaimRequest()

  useEffect(() => {
    if (isCancelConfirmed) {
      onRequestCancelled()
      toast({
        title: 'Request Cancelled',
        description: 'Unstaking request has been cancelled successfully',
        variant: 'success',
      })
    }
  }, [isCancelConfirmed, onRequestCancelled, toast])

  useEffect(() => {
    if (isClaimConfirmed) {
      onRequestClaimed()
      toast({
        title: 'Claim Successful',
        description: 'YUM tokens have been claimed successfully',
        variant: 'success',
      })
    }
  }, [isClaimConfirmed, onRequestClaimed, toast])

  const handleCancel = async () => {
    try {
      cancelRequest(request.id.toString())
    } catch (error) {
      console.error('Cancel request failed:', error)
      toast({
        title: 'Cancel Failed',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while canceling the request',
        variant: 'error',
      })
    }
  }

  const handleClaim = async () => {
    try {
      claimRequest(request.id.toString())
    } catch (error) {
      console.error('Claim request failed:', error)
      toast({
        title: 'Claim Failed',
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while claiming the request',
        variant: 'error',
      })
    }
  }

  const isClaimable = request.availableAt && request.availableAt <= new Date()

  return (
    <TableRow key={request.id.toString()}>
      <TableCell className="font-medium whitespace-nowrap">
        <div className="flex gap-2">
          <img src="vyum.svg" alt="YUM Icon" className="h-5 w-5" />
          <div className="flex gap-1">
            <span className="font-mono font-semibold">
              {parseFloat(request.amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}{' '}
            </span>
            <span className="text-muted-foreground font-mono font-semibold">
              vYUM
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-mono whitespace-nowrap">
        {(request.availableAt ?? request.timeOfRequest).toLocaleString(
          undefined,
          {
            dateStyle: 'medium',
            timeStyle: 'short',
            hour12: true,
          },
        )}
      </TableCell>
      <TableCell className="flex gap-2 justify-end whitespace-nowrap">
        {isClaimable && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClaim}
            disabled={isClaimPending}
            className="text-xs font-mono font-semibold"
          >
            {isClaimPending ? 'Claiming...' : 'Claim'}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isCancelPending}
          className="text-xs font-mono font-semibold"
        >
          {isCancelPending ? 'Cancelling...' : 'Cancel'}
        </Button>
      </TableCell>
    </TableRow>
  )
}
