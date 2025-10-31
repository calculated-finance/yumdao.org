import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UnstakingRequestRow } from '@/components/UnstakingRequestRow'
import { useUnstakingRequests } from '@/hooks/useStaking'
import { useAccount } from 'wagmi'

interface UnstakingRequestsCardProps {
  onBalanceRefresh?: () => void
}

export function UnstakingRequestsCard({
  onBalanceRefresh,
}: UnstakingRequestsCardProps) {
  const { isConnected } = useAccount()
  const { requests: pendingRequests, refetch: refetchRequests } =
    useUnstakingRequests()

  if (!isConnected) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Unstaking Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">No pending unstaking requests</p>
              <p className="text-xs mt-1">
                Your unstaking requests will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Amount</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Available At
                  </TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <UnstakingRequestRow
                    key={request.id.toString()}
                    request={request}
                    onRequestCancelled={() => {
                      refetchRequests()
                    }}
                    onRequestClaimed={() => {
                      refetchRequests()
                      onBalanceRefresh?.()
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
