import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { useCancelRequest } from '@/hooks/useStaking'
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
}

export function UnstakingRequestRow({
  request,
  onRequestCancelled,
}: UnstakingRequestRowProps) {
  const { toast } = useToast()
  const {
    cancelRequest,
    isPending: isCancelPending,
    isConfirmed: isCancelConfirmed,
  } = useCancelRequest()

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

  const handleCancel = async () => {
    try {
      await cancelRequest(request.id.toString())
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
    // TODO: Implement claim functionality when available
    toast({
      title: 'Coming Soon',
      description: 'Claim functionality will be available soon',
      variant: 'default',
    })
  }

  const isClaimable = request.availableAt && request.availableAt <= new Date()

  return (
    <TableRow key={request.id.toString()}>
      <TableCell className="font-medium">
        {parseFloat(request.amount).toFixed(6)} YUM
      </TableCell>
      <TableCell className="text-muted-foreground">
        {(request.availableAt ?? request.timeOfRequest).toLocaleString(
          undefined,
          {
            dateStyle: 'medium',
            timeStyle: 'short',
            hour12: true,
          },
        )}
      </TableCell>
      <TableCell className="flex gap-2 justify-end">
        {isClaimable && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClaim}
            className="text-xs"
          >
            Claim
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={isCancelPending}
          className="text-xs"
        >
          {isCancelPending ? 'Cancelling...' : 'Cancel'}
        </Button>
      </TableCell>
    </TableRow>
  )
}
