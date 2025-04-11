import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { DealRetrieveSLA } from "../contracts/DealRetrieveSLA";
import { useState } from "react";

export const useRaiseDispute = () => {
  const [dealId, setDealId] = useState<string | undefined>();
  
  const { data: hash, isPending, isSuccess, isError, error, writeContract } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
  });

  const raiseDispute = async (disputeDealId: string, reason: string) => {
    setDealId(disputeDealId);
    writeContract({
      address: process.env.NEXT_PUBLIC_DEAL_RETRIEVE_CONTRACT as `0x${string}`,
      abi: DealRetrieveSLA.abi,
      functionName: "raiseDispute",
      args: [BigInt(disputeDealId), reason],
    });
  };

  return {
    raiseDispute,
    isPending,
    isSuccess,
    isConfirming,
    isConfirmed,
    isError,
    error,
    dealId,
    transactionHash: hash,
  };
};
