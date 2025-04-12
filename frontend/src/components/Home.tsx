import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const Home = () => {
  const { address, isConnected } = useAccount();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    const handleSidebarChange = (e: CustomEvent) => {
      setIsSidebarExpanded(e.detail.isExpanded);
    };

    // Listen for sidebar state changes
    window.addEventListener(
      "sidebarStateChange",
      handleSidebarChange as EventListener
    );

    // Start animations after a short delay
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);

    return () => {
      window.removeEventListener(
        "sidebarStateChange",
        handleSidebarChange as EventListener
      );
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`${styles.container} ${
      isSidebarExpanded ? styles.expanded : styles.contracted
    }`}>
      <div className={styles.bgGradient}></div>
      <div className={styles.glowOrbs}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
      </div>
      <main className={styles.main}>
        <div className={`${styles.content} ${animationStarted ? styles.animated : ''}`}>
          <div className={styles.logoSection}>
            <div className={styles.logoGlow}></div>
            <h1 className={styles.title}>Deal Retrieve Checker</h1>
            <p className={styles.subtitle}>Explore the Filecoin Network</p>
          </div>

          <div className={styles.walletSection}>
            <div className={styles.walletButton}>
              <ConnectButton />
            </div>

            {!isConnected && (
              <div className={styles.walletCard}>
                <div className={styles.cardGlow}></div>
                <h2 className={styles.walletTitle}>Connect your wallet</h2>
                <p className={styles.walletDescription}>
                  Please connect your wallet to interact with Dapp
                </p>
              </div>
            )}
          </div>

          <div className={styles.infoSection}>
            <p className={styles.description}>
              Explore and verify Filecoin storage deals. Check deal status, verify
              retrievals, and monitor storage provider performance.
            </p>
            
            <div className={styles.features}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p>Verify & Challenge Deals</p>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 19V13M9 13V5M9 13H15M15 19V13M15 13V5" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p>Track Storage Providers</p>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p>Monitor Performance</p>
              </div>
            </div>
          </div>

          <div className={styles.actionSection}>
            <Link href="/challenge-deal" className={styles.challengeButton}>
              <span className={styles.buttonGlow}></span>
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
              Challenge Deal
            </Link>
            <p className={styles.helpText}>
              Click to verify and challenge storage deals
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
