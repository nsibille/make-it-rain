"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * Providers client — TanStack Query (cache data des Client Components) +
 * ToastProvider (toaster global, cf. DESIGN_SYSTEM §Toaster).
 * QueryClient instancié une fois par montage (état React) pour ne pas
 * partager le cache entre requêtes serveur.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
