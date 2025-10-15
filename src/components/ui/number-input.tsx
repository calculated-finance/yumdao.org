import { cn } from '@/lib/utils'
import {
  NumberInput as NumberInputHero,
  type NumberInputProps,
} from '@heroui/number-input'

function NumberInput({
  className,
  classNames,
  type,
  ...props
}: NumberInputProps) {
  return (
    <NumberInputHero
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-mono',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      classNames={{
        inputWrapper: 'focus-within:ring-0 focus-within:outline-none',
        input:
          'focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none',
        ...classNames,
      }}
      {...props}
    />
  )
}

export { NumberInput }
