"use client";

import { useState, useEffect } from "react";
import Home from "../pages/Home";
import Layout from "../components/Layout";

export default function Page() {
  // Use state to track client-side mounting
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <Layout>
      <Home />
    </Layout>
  ) : null;
}
