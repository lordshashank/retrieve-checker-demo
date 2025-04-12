import { useReadContract } from "wagmi";
import { DealRetrieveSLA } from "../contracts/DealRetrieveSLA";

export const useProviderStake = (actorId: bigint | string | undefined) => {
  const { data, isLoading, error } = useReadContract({
    address: DealRetrieveSLA.address,
    abi: DealRetrieveSLA.abi,
    functionName: "getProviderStake",
    args: actorId ? [BigInt(actorId)] : undefined,
    query: {
      enabled: !!actorId,
    },
  });

  return {
    stake: data as bigint | undefined,
    isLoading,
    error,
  };
};