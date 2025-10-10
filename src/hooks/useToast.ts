import { useCallback, useState } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning'
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

const TOAST_LIMIT = 3

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToast = (
  toasts: Toast[],
  toast: Omit<Toast, 'id'> & { id?: string },
): Toast[] => {
  const id = toast.id || genId()
  const newToast: Toast = {
    ...toast,
    id,
    duration: toast.duration ?? 5000,
  }

  // Remove existing toast with same id if it exists
  const existingIndex = toasts.findIndex((t) => t.id === id)
  if (existingIndex > -1) {
    toasts = toasts.filter((t) => t.id !== id)
  }

  return [newToast, ...toasts].slice(0, TOAST_LIMIT)
}

const removeToast = (toasts: Toast[], toastId: string): Toast[] => {
  return toasts.filter((t) => t.id !== toastId)
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  const toast = useCallback(
    ({ ...props }: Omit<Toast, 'id'> & { id?: string }) => {
      const id = genId()
      const newToast = { ...props, id }

      setState((prevState) => ({
        toasts: addToast(prevState.toasts, newToast),
      }))

      // Auto remove toast after duration
      if (newToast.duration && newToast.duration > 0) {
        const timeout = setTimeout(() => {
          setState((prevState) => ({
            toasts: removeToast(prevState.toasts, id),
          }))
        }, newToast.duration)

        toastTimeouts.set(id, timeout)
      }

      return {
        id,
        dismiss: () => {
          setState((prevState) => ({
            toasts: removeToast(prevState.toasts, id),
          }))

          const timeout = toastTimeouts.get(id)
          if (timeout) {
            clearTimeout(timeout)
            toastTimeouts.delete(id)
          }
        },
      }
    },
    [],
  )

  const dismiss = useCallback((toastId: string) => {
    setState((prevState) => ({
      toasts: removeToast(prevState.toasts, toastId),
    }))

    const timeout = toastTimeouts.get(toastId)
    if (timeout) {
      clearTimeout(timeout)
      toastTimeouts.delete(toastId)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss,
  }
}
