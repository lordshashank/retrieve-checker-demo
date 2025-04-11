import { useReadContract } from "wagmi";
import { DealRetrieveSLA } from "../contracts/DealRetrieveSLA";

type DealCommitment = {
  data: string;
  size: bigint;
};

type DealTerm = {
  start: bigint;
  duration: bigint;
};

type ActivationStatus = {
  activated: bigint;
  terminated: bigint;
};

type BigIntValue = {
  val: string;
  neg: boolean;
};

type DealData = {
  dealClientActorId: bigint;
  dealProviderActorId: bigint;
  dealLabel: {
    data: string;
    isString: boolean;
  };
  dealTerm: DealTerm;
  dealPricePerEpoch: BigIntValue;
  dealCommitment: DealCommitment;
  providerCollateral: BigIntValue;
  clientCollateral: BigIntValue;
  activationStatus: ActivationStatus;
  isDealActivated: boolean;
};

export const useDealData = (dealId: string) => {
  const { data, isLoading, error } = useReadContract({
    address: process.env.NEXT_PUBLIC_DEAL_RETRIEVE_CONTRACT as `0x${string}`,
    abi: DealRetrieveSLA.abi,
    functionName: "getAllDealData",
    args: [BigInt(dealId)],
    query: {
      enabled: !!dealId,
    },
  });
  console.log(data);
  return {
    dealData: data as DealData | undefined,
    isLoading,
    error,
  };
};
