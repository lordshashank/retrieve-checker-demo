import { useReadContract } from "wagmi";
import { RetrieveChecker } from "../contracts/RetrieveChecker";

// Define status mapping for cleaner output
// Note: In the contract, RESOLVED (2) means retrieval worked (challenge failed)
// and FAILED (3) means retrieval failed (challenge succeeded)
// We swap these in our UI for clarity
export const disputeStatusMap = {
  0: "NONE",
  1: "PENDING", 
  2: "FAILED",    // Swapped from RESOLVED - means challenge failed (retrieval worked)
  3: "RESOLVED",  // Swapped from FAILED - means challenge succeeded (retrieval failed)
  4: "REJECTED"
};

export type DisputeStatus = keyof typeof disputeStatusMap;

export const useDisputeStatus = (disputeId: bigint | undefined) => {
  console.log("Dispute ID:", disputeId);
  const { data, isLoading, error, refetch } = useReadContract({
    address: RetrieveChecker.address,
    abi: RetrieveChecker.abi,
    functionName: "getDisputeStatus",
    args: disputeId ? [disputeId] : undefined,
    query: {
      enabled: !!disputeId,
    },
  });
  console.log("Dispute status data:", data);
  // Convert numeric status to string representation
  const statusCode = data !== undefined ? Number(data) as DisputeStatus : undefined;
  const statusText = statusCode !== undefined ? disputeStatusMap[statusCode] : undefined;

  return {
    statusCode,
    statusText,
    isLoading,
    error,
    refetch,
  };
};