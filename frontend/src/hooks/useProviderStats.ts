import { useReadContract } from "wagmi";
import { DealRetrieveSLA } from "../contracts/DealRetrieveSLA";

export type ProviderStats = {
  totalDisputes: bigint;
  pendingDisputes: bigint;
  resolvedDisputes: bigint;
  failedDisputes: bigint;
  rejectedDisputes: bigint;
};

export const useProviderStats = (actorId: bigint | string | undefined) => {
  const { data, isLoading, error } = useReadContract({
    address: process.env.NEXT_PUBLIC_DEAL_RETRIEVE_CONTRACT as `0x${string}`,
    abi: DealRetrieveSLA.abi,
    functionName: "getProviderStats",
    args: actorId ? [BigInt(actorId)] : undefined,
    query: {
      enabled: !!actorId,
    },
  });

  return {
    stats: data as ProviderStats | undefined,
    isLoading,
    error,
  };
};