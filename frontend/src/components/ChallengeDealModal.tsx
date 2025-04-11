import { useState, useEffect } from "react";
import { useRaiseDispute } from "../hooks/useRaiseDispute";
import styles from "../styles/ChallengeDealModal.module.css";
import { useRouter } from "next/navigation";

interface ChallengeDealModalProps {
  dealId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Add a callback for successful submission
}

export const ChallengeDealModal = ({
  dealId,
  isOpen,
  onClose,
  onSuccess,
}: ChallengeDealModalProps) => {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const { raiseDispute, isPending, isSuccess, isConfirming, isConfirmed, isError, error } = useRaiseDispute();
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Show success message as soon as transaction is sent
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
    }
  }, [isSuccess]);

  // Handle redirection only after transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      // Close modal and trigger reset after confirmation
      onClose();
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Fall back to full page refresh if no callback provided
        window.location.href = "/challenge-deal";
      }
    }
  }, [isConfirmed, onClose, onSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      await raiseDispute(dealId, reason);
    } catch (err) {
      console.error("Failed to raise dispute:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Challenge Deal</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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
            <p>Challenge submitted successfully!</p>
            {isConfirming && (
              <p className={styles.redirectingText}>Waiting for confirmation...</p>
            )}
            {isConfirmed && (
              <p className={styles.redirectingText}>Redirecting...</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="reason" className={styles.label}>
                Reason for Challenge
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter the reason for challenging this deal..."
                className={styles.textarea}
                rows={4}
                required
              />
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

            <div className={styles.buttonGroup}>
              <button
                type="button"
                onClick={onClose}
                className={`${styles.button} ${styles.cancelButton}`}
                disabled={isPending || isConfirming}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.button} ${styles.submitButton}`}
                disabled={isPending || isConfirming || !reason.trim()}
              >
                {isPending || isConfirming ? (
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
                    {isConfirming ? "Confirming..." : "Processing..."}
                  </>
                ) : (
                  "Challenge Deal"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
