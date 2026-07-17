"use client";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { store } from "../lib/redux/store/store";

const queryClient = new QueryClient();

interface QueryProviderProps {
  children: ReactNode;
}

export default function AppProvider({ children }: QueryProviderProps) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </Provider>
  );
}
