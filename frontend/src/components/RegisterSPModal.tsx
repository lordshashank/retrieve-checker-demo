"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { useMinimumStake } from "../hooks/useMinimumStake";
import { useRegisterStorageProvider } from "../hooks/useRegisterStorageProvider";
import styles from "../styles/RegisterSPModal.module.css";

interface RegisterSPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RegisterSPModal: React.FC<RegisterSPModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [spId, setSpId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { address } = useAccount();
  const chainId = useChainId();

  // Get minimum stake from contract
  const { minimumStake, isLoading: isLoadingStake } = useMinimumStake();
  
  // Registration contract interaction
  const { 
    registerSP, 
    isPending: isRegistering, 
    isSuccess,
    isConfirming,
    isConfirmed,
    isError,
    error: registerError 
  } = useRegisterStorageProvider();

  // Format the stake value to a readable format
  const formattedMinStake = minimumStake
    ? parseFloat(minimumStake.toString()) / 1e18
    : 0;

  // Check if input ID has a valid prefix
  const hasValidPrefix = (id: string) => {
    return id.startsWith('t0') || id.startsWith('f0');
  };

  // Extract the numeric part of the actor ID
  const getNumericActorId = (id: string) => {
    if (hasValidPrefix(id)) {
      return id.substring(2); // Remove 't0' or 'f0' prefix
    }
    return id;
  };

  // Validate the SP ID format
  const isValidSPId = (id: string) => {
    // Allow raw numbers or properly prefixed IDs
    return (!hasValidPrefix(id) && /^\d+$/.test(id)) || 
           (hasValidPrefix(id) && /^[tf]0\d+$/.test(id));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation for SP ID
    if (!spId || !isValidSPId(spId)) {
      setError("Please enter a valid Storage Provider ID (number only or with t0/f0 prefix)");
      return;
    }

    if (!minimumStake) {
      setError("Could not determine minimum stake amount");
      return;
    }

    try {
      // Extract numeric part of the actor ID before sending to contract
      const numericId = getNumericActorId(spId);
      registerSP(numericId, minimumStake);
    } catch (err: any) {
      setError(err?.message || "Failed to submit transaction. Please try again.");
    }
  };

  // Handle successful registration
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
    }
  }, [isSuccess]);

  // Close modal only after transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      // Close the modal after confirmation
      onClose();
    }
  }, [isConfirmed, onClose, onSuccess]);

  // Display error from contract write
  useEffect(() => {
    if (isError && registerError) {
      setError(registerError.message || "Transaction failed. Please try again.");
    }
  }, [isError, registerError]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Register Storage Provider</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={isRegistering || isConfirming}
          >
            ×
          </button>
        </div>

        {showSuccess ? (
          <div className={styles.successMessage}>
            <svg 
              className={styles.successIcon} 
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
            <p>Storage Provider registered successfully!</p>
            {isConfirming && (
              <p className={styles.redirectingText}>Waiting for confirmation...</p>
            )}
            {isConfirmed && (
              <p className={styles.redirectingText}>Registration confirmed!</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="spId">Storage Provider ID</label>
              <input
                type="text"
                id="spId"
                value={spId}
                onChange={(e) => setSpId(e.target.value)}
                placeholder="Enter SP Actor ID (e.g., t01000 or 1000)"
                className={styles.input}
                disabled={isRegistering}
              />
            </div>

            <div className={styles.stakeInfo}>
              <div className={styles.stakeRow}>
                <div className={styles.stakeLabel}>Required Stake:</div>
                <div className={styles.stakeValue}>
                  {isLoadingStake ? "Loading..." : `${formattedMinStake} FIL`}
                </div>
              </div>
              <div className={styles.stakeDescription}>
                This amount will be locked as collateral for the storage provider.
              </div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isRegistering || isConfirming}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isRegistering || isConfirming || !spId || !address || isLoadingStake}
              >
                {isRegistering || isConfirming ? "Registering..." : "Register SP"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterSPModal;