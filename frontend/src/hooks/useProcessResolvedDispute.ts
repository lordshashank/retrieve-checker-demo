import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { DealRetrieveSLA } from "../contracts/DealRetrieveSLA";
import { useState } from "react";

export const useProcessResolvedDispute = () => {
  const [disputeId, setDisputeId] = useState<bigint | undefined>();
  
  const { data: hash, isPending, isError, error, writeContract } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
  });

  const processDispute = async (baseDisputeId: bigint) => {
    setDisputeId(baseDisputeId);
    writeContract({
      address: process.env.NEXT_PUBLIC_DEAL_RETRIEVE_CONTRACT as `0x${string}`,
      abi: DealRetrieveSLA.abi,
      functionName: 'processResolvedDispute',
      args: [baseDisputeId],
    });
  };

  return {
    processDispute,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    disputeId,
    transactionHash: hash,
  };
};