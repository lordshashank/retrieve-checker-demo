"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import styles from "../styles/Sidebar.module.css";

interface SidebarProps {
  defaultCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ defaultCollapsed = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Challenge Deal", href: "/challenge-deal", icon: DocumentTextIcon },
    { name: "Registered SPs", href: "/registered-sps", icon: UserGroupIcon },
    { name: "My Challenges", href: "/my-challenges", icon: ClipboardDocumentCheckIcon },
  ];

  useEffect(() => {
    // Dispatch custom event when sidebar state changes
    const event = new CustomEvent("sidebarStateChange", {
      detail: { isExpanded: !isCollapsed },
    });
    window.dispatchEvent(event);
  }, [isCollapsed]);

  return (
    <div
      className={`${styles.sidebar} ${
        isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded
      }`}
    >
      <div className={styles.header}>
        {!isCollapsed && <span className={styles.title}>Retrieve Checker</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles.toggleButton}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronDoubleRightIcon className={styles.toggleIcon} />
          ) : (
            <ChevronDoubleLeftIcon className={styles.toggleIcon} />
          )}
        </button>
      </div>
      <nav className={styles.nav}>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navLink} ${
                isActive ? styles.navLinkActive : styles.navLinkInactive
              }`}
            >
              <item.icon
                className={`${styles.icon} ${
                  isActive ? styles.iconActive : styles.iconInactive
                }`}
                aria-hidden="true"
              />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
