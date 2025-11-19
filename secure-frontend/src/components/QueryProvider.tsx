"use client"

import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // Avoid immediate refetching on the client'
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient() // Always create a new query client on the server
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}


// function QueryProvider({children}: {children: React.ReactNode}) {
//     const [queryClient] = useState(() => new QueryClient()); // ✅ BEST PRACTICE
//     return (
//     <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
//   )
// }

// export default QueryProvider
