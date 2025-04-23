"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider"; // Adjust this path if needed
import ReportFormModal from "@/components/report-form-modal";
import { useRouter } from "next/navigation";

export default function ReportPage() {
  const [visible, setVisible] = useState(true);
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect guests to map and show the authentication modal automatically
    // This will use your existing AuthProvider login modal
    if (!isLoading && !isAuthenticated && isGuest) {
      // The AuthProvider will automatically show the login modal
      // when a guest tries to access a restricted route
      router.push('/map');
    }
  }, [isLoading, isAuthenticated, isGuest, router]);

  const handleClose = () => {
    setVisible(false);
    router.push('/map');
  };

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // Only show the report form if the user is authenticated
  return (
    <>
      {visible && isAuthenticated && <ReportFormModal onClose={handleClose} />}
    </>
  );
}