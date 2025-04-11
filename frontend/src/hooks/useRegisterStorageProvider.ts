import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { DealRetrieveSLA } from '../contracts/DealRetrieveSLA';
import { useState } from 'react';

/**
 * Hook for registering a new storage provider
 * @returns Functions and state for registering a storage provider
 */
export const useRegisterStorageProvider = () => {
  const [actorId, setActorId] = useState<string | undefined>();
  
  const { data: hash, isPending, isSuccess, isError, error, writeContract } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
  });

  const registerSP = (spActorId: string, minStake: bigint) => {
    setActorId(spActorId);
    return writeContract({
      address: DealRetrieveSLA.address,
      abi: DealRetrieveSLA.abi,
      functionName: 'registerStorageProvider',
      args: [BigInt(spActorId)],
      value: minStake,
    });
  };

  return {
    registerSP,
    isPending,
    isSuccess,
    isConfirming,
    isConfirmed,
    isError,
    error,
    actorId,
    transactionHash: hash,
  };
};