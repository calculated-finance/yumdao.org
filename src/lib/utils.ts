import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

/**
 * Check if a string represents a valid decimal number
 * @param value - The string to validate
 * @returns True if it's a valid decimal number
 */
export function isValidDecimalNumber(value: string): boolean {
  if (!value || value === '') return false

  // Remove commas for validation
  const cleanValue = value.replace(/,/g, '')

  // Check for valid decimal format using regex
  // Allows: digits, optional decimal point followed by digits
  // Does not allow: multiple decimal points, trailing decimal without digits, etc.
  const decimalRegex = /^-?\d+(\.\d+)?$/

  return decimalRegex.test(cleanValue) && !isNaN(Number(cleanValue))
}

/**
 * Format a number string with comma separators for thousands
 * @param value - The numeric string to format
 * @returns Formatted string with commas or original value if invalid
 */
export function formatNumberWithCommas(value: string): string {
  if (!value || value === '') return ''

  // Remove any existing commas
  const cleanValue = value.replace(/,/g, '')

  // If it's not a valid decimal number, return as is (don't format invalid numbers)
  if (!isValidDecimalNumber(value)) return value

  // Split by decimal point
  const parts = cleanValue.split('.')

  // Add commas to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // Join back with decimal if it exists
  return parts.join('.')
} /**
 * Remove commas from a formatted number string
 * @param value - The formatted number string
 * @returns Clean numeric string without commas
 */
export function parseFormattedNumber(value: string): string {
  return value.replace(/,/g, '')
}
