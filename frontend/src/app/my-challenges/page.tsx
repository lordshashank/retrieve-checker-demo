"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUserChallenges, DealDisputeData } from "../../hooks/useUserChallenges";
import { useDisputeStatus, disputeStatusMap } from "../../hooks/useDisputeStatus";
import { useDisputeProcessed } from "../../hooks/useDisputeProcessed";
import { useAccount, useChainId } from "wagmi";
import { hexToString } from "../../utils/formatters";
import styles from "../../styles/MyChallenges.module.css";
import { useProcessResolvedDispute } from "../../hooks/useProcessResolvedDispute";

const MyChallenges = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const { challenges, isLoading } = useUserChallenges();
  const { isConnected } = useAccount();

  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setIsSidebarExpanded(e.detail.isExpanded);
    };

    // Listen for sidebar state changes
    window.addEventListener(
      "sidebarStateChange",
      handleSidebarChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "sidebarStateChange",
        handleSidebarChange as EventListener
      );
    };
  }, []);

  // Function to truncate CID for display
  const truncateCid = (cid: string) => {
    if (!cid) return "";
    return `${cid.substring(0, 6)}...${cid.substring(cid.length - 4)}`;
  };

  return (
    <Layout>
      <div className="p-8">
        <div
          className={`${styles.container} ${
            isSidebarExpanded ? styles.expanded : styles.contracted
          }`}
        >
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>My Challenges</h1>
              <p className={styles.subtitle}>
                View and track all your dispute challenges
              </p>
            </div>
            <div className={styles.connectButton}>
              <ConnectButton />
            </div>
          </div>
          
          <div className={styles.content}>
            {!isConnected ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📊</div>
                <h2 className={styles.emptyTitle}>Connect Your Wallet</h2>
                <p className={styles.emptyText}>
                  Please connect your wallet to view your challenges and disputes.
                </p>
              </div>
            ) : isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading your challenges...</p>
              </div>
            ) : challenges && challenges.length > 0 ? (
              <>
                <div className={styles.stats}>
                  <div className={styles.statCard}>
                    <div className={styles.statTitle}>Total Challenges</div>
                    <div className={styles.statValue}>{challenges.length}</div>
                  </div>
                  <StatsCards challenges={challenges} />
                </div>
                
                <h2 className={styles.title}>Your Challenges</h2>
                
                <div className={styles.challengesGrid}>
                  {challenges.map((challenge: DealDisputeData) => (
                    <ChallengeCard 
                      key={challenge.baseDisputeId.toString()} 
                      challenge={challenge}
                      truncateCid={truncateCid}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <h2 className={styles.emptyTitle}>No Challenges Found</h2>
                <p className={styles.emptyText}>
                  You haven't raised any challenges yet. Visit the Challenge Deal page to raise a new dispute.
                </p>
                <Link href="/challenge-deal" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Challenge a Deal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Challenge Card Component
const ChallengeCard = ({ 
  challenge, 
  truncateCid 
}: { 
  challenge: DealDisputeData, 
  truncateCid: (cid: string) => string 
}) => {
  const { statusText, isLoading, refetch } = useDisputeStatus(challenge.baseDisputeId);
  const { isProcessed, isLoading: isLoadingProcessed } = useDisputeProcessed(challenge.baseDisputeId);
  const { processDispute, isPending, isConfirming, isConfirmed, isError } = useProcessResolvedDispute();
  const [decodedCid, setDecodedCid] = useState<string>("");
  const [displayCid, setDisplayCid] = useState<string>("");
  const chainId = useChainId();
  const [showProcessSuccess, setShowProcessSuccess] = useState(false);

  // Update the stats card counter when status changes
  useEffect(() => {
    if (statusText && !isLoading) {
      // Call the global function to update stats if it exists
      // @ts-ignore
      if (window.updateDisputeStatsStatus) {
        // @ts-ignore
        window.updateDisputeStatsStatus(challenge.baseDisputeId.toString(), statusText);
      }
    }
  }, [statusText, isLoading, challenge.baseDisputeId]);

  // Show success message when transaction is confirmed and reset after 5 seconds
  useEffect(() => {
    if (isConfirmed) {
      setShowProcessSuccess(true);
      // Refresh the status after successful processing
      refetch();
      const timer = setTimeout(() => {
        setShowProcessSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, refetch]);

  const getNetworkPrefix = () => {
    // Filecoin Mainnet = 314, Calibration = 314159
    return chainId === 314 ? "f0" : "t0";
  };

  const handleProcessDispute = () => {
    processDispute(challenge.baseDisputeId);
  };

  // Process CID only once when component mounts or challenge changes
  useEffect(() => {
    if (challenge.dealLabel.data) {
      try {
        // Handle hex CIDs
        if (challenge.dealLabel.data.startsWith('0x')) {
          const decoded = hexToString(challenge.dealLabel.data);
          setDecodedCid(decoded);
          
          // Format for display
          if (decoded.length > 20) {
            if (decoded.startsWith('bafy') || decoded.startsWith('Qm')) {
              setDisplayCid(`${decoded.substring(0, 8)}...${decoded.substring(decoded.length - 6)}`);
            } else {
              setDisplayCid(`${decoded.substring(0, 10)}...${decoded.substring(decoded.length - 6)}`);
            }
          } else {
            setDisplayCid(decoded);
          }
        } else {
          // For non-hex CIDs
          setDecodedCid(challenge.dealLabel.data);
          
          // Format for display
          if (challenge.dealLabel.data.length > 20) {
            if (challenge.dealLabel.data.startsWith('bafy') || challenge.dealLabel.data.startsWith('Qm')) {
              setDisplayCid(`${challenge.dealLabel.data.substring(0, 8)}...${challenge.dealLabel.data.substring(challenge.dealLabel.data.length - 6)}`);
            } else {
              setDisplayCid(`${challenge.dealLabel.data.substring(0, 10)}...${challenge.dealLabel.data.substring(challenge.dealLabel.data.length - 6)}`);
            }
          } else {
            setDisplayCid(challenge.dealLabel.data);
          }
        }
      } catch (error) {
        setDecodedCid(challenge.dealLabel.data);
        setDisplayCid(challenge.dealLabel.data.length > 20 
          ? `${challenge.dealLabel.data.substring(0, 10)}...${challenge.dealLabel.data.substring(challenge.dealLabel.data.length - 6)}` 
          : challenge.dealLabel.data);
      }
    }
  }, [challenge.dealLabel.data]);

  const getStatusBadgeClass = (status: string | undefined) => {
    switch (status) {
      case "PENDING":
        return styles.statusPending;
      case "FAILED":
        return styles.statusFailed;
      case "RESOLVED":
        return styles.statusResolved;
      case "REJECTED":
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(decodedCid);
    // Could add toast notification here if you have one
  };

  // Enhanced status text that includes processed state
  const getEnhancedStatusText = () => {
    if (isLoading || isLoadingProcessed) return "Loading...";
    
    // Simply use the statusText directly since the swapping is done in the hook
    return isProcessed ? `${statusText} and processed` : statusText;
  };

  return (
    <div className={styles.challengeCard}>
      <div className={styles.cardId}>ID: {challenge.baseDisputeId.toString()}</div>
      <div className={styles.cardTitle}>
        Deal #{challenge.dealId.toString()}
      </div>
      
      {/* Improved CID display with inline formatting */}
      <div className={styles.cidRow}>
        CID:
        <div className={styles.cidValue}>{displayCid}</div>
        <button 
          className={styles.copyButton}
          onClick={handleCopy}
          title="Copy full CID"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      
      <div className={styles.cardInfoRow}>
        Provider ID:<span>{getNetworkPrefix()}{challenge.providerActorId.toString()}</span>
      </div>
      
      <div className={styles.cardReason}>
        "{challenge.reason}"
      </div>
      
      <div>
        {isLoading || isLoadingProcessed ? (
          <div className={styles.statusBadge}>Loading...</div>
        ) : (
          <div className={`${styles.statusBadge} ${getStatusBadgeClass(statusText)}`}>
            {getEnhancedStatusText()}
          </div>
        )}
      </div>
      
      {/* Process dispute button - only show for RESOLVED disputes that need processing and haven't been processed yet */}
      {statusText === "RESOLVED" && !isProcessed && (
        <div className={styles.actionButtonContainer}>
          {showProcessSuccess ? (
            <div className={styles.successMessage}>
              Dispute processed successfully!
            </div>
          ) : (
            <button 
              className={styles.processButton}
              onClick={handleProcessDispute}
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  {isConfirming ? "Confirming..." : "Processing..."}
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "0.5rem"}}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Process Dispute
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Stats Cards Component to track real-time status counts
const StatsCards = ({ challenges }: { challenges: DealDisputeData[] }) => {
  const [stats, setStats] = useState({
    pending: 0,
    resolved: 0,
    failed: 0,
    rejected: 0
  });

  // Use a state to track when all statuses have been fetched
  const [statusFetches, setStatusFetches] = useState<{[key: string]: string}>({});

  // Use useEffect to fetch the status for each challenge
  useEffect(() => {
    // Create a tracking object for statuses
    const newStatusFetches: {[key: string]: string} = {};
    
    // Reset the fetch status tracking when challenges change
    setStatusFetches({});
    
    challenges.forEach(challenge => {
      const disputeId = challenge.baseDisputeId.toString();
      // Initialize with empty status
      newStatusFetches[disputeId] = "";
    });
    
    if (challenges.length > 0) {
      setStatusFetches(newStatusFetches);
    }
  }, [challenges]);

  // Re-calculate stats whenever a status is updated
  useEffect(() => {
    // Only proceed if we have statuses to count
    if (Object.keys(statusFetches).length === 0) return;
    
    // Count the different status types
    const newStats = {
      pending: 0,
      resolved: 0,
      failed: 0,
      rejected: 0
    };
    
    Object.values(statusFetches).forEach(status => {
      switch (status) {
        case "PENDING":
          newStats.pending++;
          break;
        case "RESOLVED":
          newStats.resolved++;
          break;
        case "FAILED":
          newStats.failed++;
          break;
        case "REJECTED":
          newStats.rejected++;
          break;
        default:
          // For empty or unrecognized statuses, count as pending
          if (!status) newStats.pending++;
          break;
      }
    });
    
    setStats(newStats);
  }, [statusFetches]);

  // This function will be called by ChallengeCard components to update the status
  const updateStatus = (disputeId: string, status: string) => {
    setStatusFetches(prev => ({
      ...prev,
      [disputeId]: status
    }));
  };

  // Make the updateStatus function available globally so ChallengeCard can call it
  useEffect(() => {
    // @ts-ignore
    window.updateDisputeStatsStatus = updateStatus;
    
    return () => {
      // @ts-ignore
      delete window.updateDisputeStatsStatus;
    };
  }, []);

  return (
    <>
      <div className={styles.statCard}>
        <div className={styles.statTitle}>Pending</div>
        <div className={styles.statValue}>{stats.pending}</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statTitle}>Resolved</div>
        <div className={styles.statValue}>{stats.resolved}</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statTitle}>Failed</div>
        <div className={styles.statValue}>{stats.failed}</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statTitle}>Rejected</div>
        <div className={styles.statValue}>{stats.rejected}</div>
      </div>
    </>
  );
};

export default MyChallenges;