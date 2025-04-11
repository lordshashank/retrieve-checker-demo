import { http, createConfig } from "wagmi";
import { filecoin, filecoinCalibration } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [filecoin, filecoinCalibration],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    }),
  ],
  transports: {
    [filecoin.id]: http(),
    [filecoinCalibration.id]: http(),
  },
});
