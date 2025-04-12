import { useReadContract } from "wagmi";
import { DealRetrieveSLA } from "../contracts/DealRetrieveSLA";

export const useRegisteredProviders = () => {
  const { data, isLoading, error } = useReadContract({
    address: DealRetrieveSLA.address,
    abi: DealRetrieveSLA.abi,
    functionName: "getRegisteredSpActorIds",
  });
  
  return {
    providerIds: data as bigint[] | undefined,
    isLoading,
    error,
  };
};