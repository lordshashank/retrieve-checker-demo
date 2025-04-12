import { useAccount, useReadContract } from "wagmi";
import { DealRetrieveSLA } from "../contracts/DealRetrieveSLA";

export type DealDisputeData = {
  baseDisputeId: bigint;
  dealId: bigint;
  dealLabel: {
    data: string;
    isString: boolean;
  };
  providerAddress: string;
  providerActorId: bigint;
  reason: string;
  raiser: string;
};

export const useUserChallenges = () => {
  const { address } = useAccount();
  const { data, isLoading, error, refetch } = useReadContract({
    address: DealRetrieveSLA.address,
    abi: DealRetrieveSLA.abi,
    functionName: "getDisputesByRaiser",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
  return {
    challenges: data as DealDisputeData[] | undefined,
    isLoading,
    error,
    refetch,
  };
};