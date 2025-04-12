import { useReadContract } from "wagmi";
import { DealRetrieveSLA } from "../contracts/DealRetrieveSLA";

/**
 * Hook to check if a dispute has been processed
 * @param disputeId The ID of the dispute to check
 * @returns Object containing processed status and loading state
 */
export const useDisputeProcessed = (disputeId: bigint | undefined) => {
  const { data, isLoading, error, refetch } = useReadContract({
    address: DealRetrieveSLA.address,
    abi: DealRetrieveSLA.abi,
    functionName: "processedDisputes",
    args: disputeId ? [disputeId] : undefined,
    query: {
      enabled: !!disputeId,
    },
  });
  console.log("Dispute processed data:", data);
  // data will be a boolean indicating if the dispute has been processed
  const isProcessed = data !== undefined ? Boolean(data) : false;

  return {
    isProcessed,
    isLoading,
    error,
    refetch,
  };
};