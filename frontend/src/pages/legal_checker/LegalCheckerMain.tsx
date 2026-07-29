import React, { useState } from "react";
import Header from "../../components/Header.tsx";
import LegalCheckerSidebar from "./SideBar.tsx";
import NdaReview from "./NdaReview.tsx";
import BankGuaranteeReview from "./BankGuaranteeReview.tsx";
import Admin from "./Admin.tsx";

const LegalCheckerMain: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>("NDA Review");
  const breadCrumbs = [
    { title: "AI Studio", url: "/ai-studio" },
    { title: "Legal Compliance Checker", url: "/ai-studio/legal_checker" },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "Bank Guarantee Review":
        return <BankGuaranteeReview />;
      case "Admin":
        return <Admin />;
      case "NDA Review":
      default:
        return <NdaReview />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header breadCrumbs={breadCrumbs} />
      <div className="flex flex-1 mt-4 overflow-hidden">
        <LegalCheckerSidebar onSelect={setCurrentPage} selected={currentPage} />
        <div className="flex-1 overflow-hidden py-6 px-2 ml-3 mr-3 mt-3 flex flex-col">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default LegalCheckerMain;
