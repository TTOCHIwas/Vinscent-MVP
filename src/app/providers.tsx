'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { createQueryClient } from '../lib/queryClient'

/**
 * Props interface for the Providers component
 */
interface ProvidersProps {
  children: React.ReactNode
}

/**
 * Root providers component that wraps the entire application
 * Sets up TanStack Query client with dev tools for development environment
 * 
 * @param children - React children to wrap with providers
 * @returns JSX element with QueryClientProvider and dev tools
 */
export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          buttonPosition="bottom-left"
          position="bottom"
        />
      )}
    </QueryClientProvider>
  )
}