import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import type { QueryClient } from '@tanstack/react-query'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toast'
import { useToast } from '@/hooks/useToast'

interface MyRouterContext {
  queryClient: QueryClient
}

function RootLayout() {
  const { toasts, dismiss } = useToast()

  return (
    <>
      <Header />
      <Outlet />
      <Toaster toasts={toasts} onDismiss={dismiss} />
      {/* <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      /> */}
    </>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
})
