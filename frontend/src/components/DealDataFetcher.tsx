import { useState } from "react";
import { useDealData } from "../hooks/useDealData";
import { useCurrentEpoch } from "../hooks/useCurrentEpoch";
import { ChallengeDealModal } from "./ChallengeDealModal";
import {
  formatBytes,
  hexToString,
  formatBigNumberHex,
  hexToPieceCID,
} from "../utils/formatters";
import styles from "../styles/DealDataFetcher.module.css";

export const DealDataFetcher = () => {
  const [dealId, setDealId] = useState("");
  const [dealIdToFetch, setDealIdToFetch] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    dealData,
    isLoading: isDealLoading,
    error: dealError,
  } = useDealData(dealIdToFetch); // Only fetch when dealIdToFetch changes
  const {
    currentEpoch,
    isLoading: isEpochLoading,
    isError: isEpochError,
  } = useCurrentEpoch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDealIdToFetch(dealId); // Update dealIdToFetch to trigger the data fetch
  };
  
  // Handle successful challenge submission
  const handleChallengeSuccess = () => {
    // Reset the form and data
    setDealId("");
    setDealIdToFetch("");
  };

  const getDealStatus = (
    startEpoch: bigint,
    endEpoch: bigint,
    isTerminated: boolean
  ) => {
    if (!currentEpoch)
      return { status: "Loading...", className: styles.statusPending };

    if (isTerminated) {
      return {
        status: "Terminated",
        className: styles.statusTerminated,
      };
    }

    if (startEpoch > currentEpoch) {
      return {
        status: "Pending",
        className: styles.statusPending,
      };
    }

    if (currentEpoch > endEpoch) {
      return {
        status: "Expired",
        className: styles.statusExpired,
      };
    }

    return {
      status: "Active",
      className: styles.statusActive,
    };
  };

  const DataField = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div className={styles.dataField}>
      <p className={styles.dataLabel}>{label}</p>
      <p className={styles.dataValue}>{value}</p>
    </div>
  );

  const isLoading = isDealLoading || isEpochLoading;
  const error =
    dealError ||
    (isEpochError ? new Error("Failed to fetch current epoch") : undefined);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Deal Challenge Explorer</h1>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="dealId" className={styles.label}>
                Deal ID
              </label>
              <div className={styles.inputRow}>
                <input
                  id="dealId"
                  type="text"
                  value={dealId}
                  onChange={(e) => setDealId(e.target.value)}
                  placeholder="Enter Deal ID (e.g., 215593)"
                  className={styles.input}
                />
                <button
                  type="submit"
                  className={styles.button}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className={styles.loadingIcon} viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    "Fetch Deal"
                  )}
                </button>
              </div>
            </div>
            
            <div className={styles.challengeButtonContainer}>
              <button
                type="button"
                onClick={() => dealData && setIsModalOpen(true)}
                className={`${styles.challengeButton} ${!dealData ? styles.challengeButtonDisabled : ''}`}
                disabled={!dealData}
              >
                <svg
                  className={styles.buttonIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Challenge This Deal
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className={styles.error}>
            <div className={styles.errorIcon}>
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className={styles.errorMessage}>Error: {error.message}</div>
          </div>
        )}

        {dealData && (
          <div className={styles.dataCard}>
            <div className={styles.dataHeader}>
              <h2 className={styles.dataTitle}>Deal Information</h2>
            </div>
            <div className={styles.dataGrid}>
              <DataField
                label="Client Actor ID"
                value={dealData.dealClientActorId.toString()}
              />
              <DataField
                label="Provider Actor ID"
                value={dealData.dealProviderActorId.toString()}
              />
              <div className={styles.fullWidth}>
                <DataField
                  label="Payload CID"
                  value={hexToString(dealData.dealLabel.data)}
                />
              </div>
              <div className={styles.fullWidth}>
                <DataField
                  label="Piece CID"
                  value={hexToPieceCID(dealData.dealCommitment.data)}
                />
              </div>
              <DataField
                label="Start Epoch"
                value={dealData.dealTerm.start.toString()}
              />
              <DataField
                label="End Epoch"
                value={(
                  dealData.dealTerm.start + dealData.dealTerm.duration
                ).toString()}
              />
              <DataField
                label="Deal Price Per Epoch"
                value={formatBigNumberHex(dealData.dealPricePerEpoch.val)}
              />
              <DataField
                label="Deal Commitment Size"
                value={formatBytes(dealData.dealCommitment.size)}
              />
              <DataField
                label="Provider Collateral"
                value={formatBigNumberHex(dealData.providerCollateral.val)}
              />
              <DataField
                label="Client Collateral"
                value={formatBigNumberHex(dealData.clientCollateral.val)}
              />
              <DataField
                label="Verification Status"
                value={
                  <span
                    className={`${styles.statusBadge} ${
                      dealData.isDealActivated
                        ? styles.statusVerified
                        : styles.statusUnverified
                    }`}
                  >
                    {dealData.isDealActivated ? "Verified" : "Not Verified"}
                  </span>
                }
              />
              <DataField
                label="Deal Status"
                value={
                  <span
                    className={`${styles.statusBadge} ${
                      getDealStatus(
                        dealData.dealTerm.start,
                        dealData.dealTerm.start + dealData.dealTerm.duration,
                        dealData.activationStatus.terminated > BigInt(0)
                      ).className
                    }`}
                  >
                    {
                      getDealStatus(
                        dealData.dealTerm.start,
                        dealData.dealTerm.start + dealData.dealTerm.duration,
                        dealData.activationStatus.terminated > BigInt(0)
                      ).status
                    }
                  </span>
                }
              />
            </div>
          </div>
        )}
      </div>

      <ChallengeDealModal
        dealId={dealId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleChallengeSuccess}
      />
    </div>
  );
};
