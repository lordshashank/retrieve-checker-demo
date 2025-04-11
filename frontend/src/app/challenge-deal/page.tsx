"use client";

import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { DealDataFetcher } from "../../components/DealDataFetcher";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../../styles/ChallengeDeal.module.css";

const ChallengeDeal = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

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

  return (
    <Layout>
      <div className="p-8">
        <div
          className={`${styles.container} ${
            isSidebarExpanded ? styles.expanded : styles.contracted
          }`}
        >
          <div className={styles.header}>
            <Link href="/" className={styles.backButton}>
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
            <div className={styles.connectButton}>
              <ConnectButton />
            </div>
          </div>
          <div className={styles.content}>
            <DealDataFetcher />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChallengeDeal;
