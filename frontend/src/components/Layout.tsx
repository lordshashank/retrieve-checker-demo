"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [sidebarExpanded, setSidebarExpanded] = useState(!isHomePage);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column" 
    }}>
      <Sidebar defaultCollapsed={isHomePage}/>
      <main style={{ 
        transition: "all 0.3s", 
        flexGrow: 1, 
        display: "flex", 
        flexDirection: "column", 
        // width: "webkit-fill-available",
      }}>
        {children}
        <Footer isTransparent={isHomePage} />
      </main>
    </div>
  );
};

export default Layout;
