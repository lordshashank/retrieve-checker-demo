"use client";

import React, { useEffect, useState } from "react";
import { useRegisteredProviders } from "../../hooks/useRegisteredProviders";
import { useProviderStake } from "../../hooks/useProviderStake";
import { useProviderStats, ProviderStats } from "../../hooks/useProviderStats";
import Layout from "../../components/Layout";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useChainId } from "wagmi";
import { useAccount } from "wagmi";
import RegisterSPModal from "../../components/RegisterSPModal";
import styles from "../../styles/RegisteredSPs.module.css";

interface ProviderInfo {
  actorId: bigint;
  stake?: bigint;
  stats?: ProviderStats;
}

const RegisteredSPs = () => {
  const [selectedProviders, setSelectedProviders] = useState<ProviderInfo[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { providerIds, isLoading: isLoadingProviderIds, error: providerIdsError } = useRegisteredProviders();
  const { isConnected } = useAccount();

  // Update the list of providers when provider IDs are loaded
  useEffect(() => {
    if (providerIds) {
      const providers = providerIds.map(id => ({ actorId: id }));
      setSelectedProviders(providers);
    }
  }, [providerIds]);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setIsSidebarExpanded(e.detail.isExpanded);
    };

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

  const containerClass = `${styles.container} ${
    isSidebarExpanded ? styles.expanded : styles.contracted
  }`;

  // Display loading state
  if (isLoadingProviderIds) {
    return (
      <Layout>
        <div className={containerClass}>
          <h1 className={styles.title}>Registered Storage Providers</h1>
          <div className={styles.loading}>Loading storage providers...</div>
        </div>
      </Layout>
    );
  }

  // Display error state
  if (providerIdsError) {
    return (
      <Layout>
        <div className={containerClass}>
          <h1 className={styles.title}>Registered Storage Providers</h1>
          <div className={styles.error}>
            Error loading providers: {providerIdsError.message}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={containerClass}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Registered Storage Providers</h1>
          </div>
          <div className={styles.headerActions}>
            {isConnected && (
              <button 
                className={styles.registerButton}
                onClick={() => setIsRegisterModalOpen(true)}
              >
                Register SP
              </button>
            )}
            <div className={styles.connectButton}>
              <ConnectButton />
            </div>
          </div>
        </div>

        {selectedProviders.length === 0 ? (
          <div className={styles.emptyState}>
            No registered storage providers found.
          </div>
        ) : (
          <div className={styles.grid}>
            {selectedProviders.map((provider) => (
              <ProviderCard key={provider.actorId.toString()} actorId={provider.actorId} />
            ))}
          </div>
        )}

        {/* Register SP Modal */}
        <RegisterSPModal 
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={() => {
            // Refresh the providers list after successful registration
            // refetch();
          }}
        />
      </div>
    </Layout>
  );
};

// Provider card component that uses the hooks directly
const ProviderCard = ({ actorId }: { actorId: bigint }) => {
  const { stake, isLoading: isLoadingStake, error: stakeError } = useProviderStake(actorId.toString());
  const { stats, isLoading: isLoadingStats, error: statsError } = useProviderStats(actorId.toString());
  const chainId = useChainId();
  
  // Determine the prefix based on the network (chainId)
  const getNetworkPrefix = () => {
    // Filecoin Mainnet = 314, Calibration = 314159
    return chainId === 314 ? "f0" : "t0";
  };
  
  const isLoading = isLoadingStake || isLoadingStats;
  const error = stakeError || statsError;

  // Convert Wei to FIL (1 FIL = 10^18 Wei)
  const formatFIL = (weiValue: bigint | undefined) => {
    if (!weiValue) return '0';
    
    // Convert to string and ensure it has 18 digits for proper decimal placement
    let weiString = weiValue.toString();
    // Pad with leading zeros if needed to ensure at least 18 digits
    while (weiString.length < 18) {
      weiString = '0' + weiString;
    }
    
    // Place the decimal point: everything to the left of the last 18 digits is FIL
    const decimalIndex = weiString.length - 18;
    if (decimalIndex <= 0) {
      // Value is less than 1 FIL
      return '0.' + '0'.repeat(-decimalIndex) + weiString;
    } else {
      // Value is at least 1 FIL
      const filPart = weiString.substring(0, decimalIndex);
      const weiPart = weiString.substring(decimalIndex);
      
      // Trim trailing zeros in the decimal part and return
      const trimmedWeiPart = weiPart.replace(/0+$/, '');
      
      if (trimmedWeiPart.length === 0) {
        return filPart;
      }
      
      return filPart + '.' + trimmedWeiPart;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          SP Actor ID: {getNetworkPrefix()}{actorId.toString()}
        </h2>
        <div className={styles.loading}>Loading provider data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          SP Actor ID: {getNetworkPrefix()}{actorId.toString()}
        </h2>
        <div className={styles.error}>Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        SP Actor ID: {getNetworkPrefix()}{actorId.toString()}
      </h2>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Stake</h3>
        <p className={styles.stakeAmount}>{formatFIL(stake)} FIL</p>
      </div>

      {stats && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Dispute Statistics</h3>
          <div className={styles.statsList}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Disputes:</span>
              <span className={styles.statValue}>
                {stats.totalDisputes.toString()}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Pending:</span>
              <span className={styles.statValue}>
                {stats.pendingDisputes.toString()}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Resolved:</span>
              <span className={styles.statValue}>
                {stats.resolvedDisputes.toString()}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Failed:</span>
              <span className={styles.statValue}>
                {stats.failedDisputes.toString()}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Rejected:</span>
              <span className={styles.statValue}>
                {stats.rejectedDisputes.toString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisteredSPs;
