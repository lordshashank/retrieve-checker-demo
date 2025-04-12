"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, getDefaultWallets, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "./config/wagmi";
import "@rainbow-me/rainbowkit/styles.css";


const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
            accentColor:
              "radial-gradient(circle at 50% 10%, rgba(47, 55, 115, 0.1) 0%, rgba(10, 15, 28, 0) 60%), radial-gradient(circle at 85% 25%, rgba(109, 70, 217, 0.2) 0%, rgba(10, 15, 28, 0) 60%), radial-gradient(circle at 15% 60%, rgba(25, 119, 207, 0.15) 0%, rgba(10, 15, 28, 0) 70%);",
            accentColorForeground: "#efeee7",
            fontStack: "system",
            overlayBlur: "small",
          })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
