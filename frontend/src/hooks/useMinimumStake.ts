import { useReadContract } from 'wagmi';
import { DealRetrieveSLA } from '../contracts/DealRetrieveSLA';

/**
 * Hook to fetch the minimum stake required for storage provider registration
 * @returns The minimum stake required in wei, loading and error states
 */
export const useMinimumStake = () => {
  const { data, isLoading, isError, error } = useReadContract({
    address: DealRetrieveSLA.address,
    abi: DealRetrieveSLA.abi,
    functionName: 'minimumStake',
  });

  return {
    minimumStake: data as bigint | undefined,
    isLoading,
    isError,
    error,
  };
};