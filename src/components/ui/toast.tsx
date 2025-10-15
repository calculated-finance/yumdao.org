import { AlertTriangle, CheckCircle, X, XCircle } from 'lucide-react'
import { Button } from './button'
import type { Toast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

interface ToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const variantStyles = {
  default: 'bg-background border-border text-foreground',
  success:
    'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
  error:
    'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
  warning:
    'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
}

const icons = {
  default: null,
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
}

export function ToastComponent({ toast, onDismiss }: ToastProps) {
  const Icon = icons[toast.variant || 'default']

  return (
    <div
      className={cn(
        'pointer-events-auto relative flex w-full items-center space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        'animate-in slide-in-from-right-full duration-300',
        variantStyles[toast.variant || 'default'],
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <div className="grid gap-1">
        <div className="text-sm font-semibold">{toast.title}</div>
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 rounded-md p-0 hover:bg-black/10 dark:hover:bg-white/10"
        onClick={() => onDismiss(toast.id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}

interface ToasterProps {
  toasts: Array<Toast>
  onDismiss: (id: string) => void
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
