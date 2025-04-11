import { useReadContract } from "wagmi";
import { DealRetrieveSLA } from "../contracts/DealRetrieveSLA";

export const useRegisteredProviders = () => {
  const { data, isLoading, error } = useReadContract({
    address: process.env.NEXT_PUBLIC_DEAL_RETRIEVE_CONTRACT as `0x${string}`,
    abi: DealRetrieveSLA.abi,
    functionName: "getRegisteredSpActorIds",
  });
  
  return {
    providerIds: data as bigint[] | undefined,
    isLoading,
    error,
  };
};