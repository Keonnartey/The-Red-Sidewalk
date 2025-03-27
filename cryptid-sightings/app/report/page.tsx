"use client";

import { useState } from "react";
import ReportFormModal from "@/components/report-form-modal";

export default function ReportPage() {
  const [visible, setVisible] = useState(true);

  const handleClose = () => {
    // You could also redirect away here if needed
    setVisible(false);
  };

  return (
    <>
      {visible && <ReportFormModal onClose={handleClose} />}
    </>
  );
}
