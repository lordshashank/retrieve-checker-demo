import { useBlockNumber } from "wagmi";

export const useCurrentEpoch = () => {
  const { data: blockNumber, isError, isLoading } = useBlockNumber();

  // In Filecoin, epochs are approximately equal to block numbers
  // Each epoch is about 30 seconds
  const currentEpoch = blockNumber ? BigInt(blockNumber) : undefined;

  return {
    currentEpoch,
    isLoading,
    isError,
  };
};
