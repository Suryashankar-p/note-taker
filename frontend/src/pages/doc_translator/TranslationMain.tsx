import React, { useState, useEffect } from "react";
import Header from "../../components/Header.tsx";
import { useNavigate } from "react-router-dom";
import useOCRApiCheck from "../../hooks/useOCRApiCheck.ts";
import PageLoading from "../../components/PageLoading.tsx";
import TranslatorSidebar from "./SideBar.tsx";
import Translator from "./Translator.tsx";
import useApiCheck from "../../hooks/useApiCheck.ts";

const Translation: React.FC = () => {
  const loading = useApiCheck('doc_translator');
  const [currentPage, setCurrentPage] = useState<string>("Activity");
  const [breadCrumbs, setBreadCrumbs] = useState([
    {
      title: "AI Studio",
      url: "/ai-studio",
    },
    {
      title: "Document Translator",
      url: "/ai-studio/doc_translator",
    },
  ]);
  const navigate = useNavigate();


  const handleSidebarSelect = (page: string) => {
    setCurrentPage(page);

    let pageUrl;
    switch (page) {
      case "Translator":
        pageUrl = "/ai-studio/doc_translator";
        break;
      default:
        pageUrl = "/ai-studio/doc_translator";
        break;
    }

    navigate(pageUrl);
    setBreadCrumbs([
      {
        title: "AI Studio",
        url: "/ai-studio",
      },
      {
        title: "Translator",
        url: pageUrl,
      },
    ]);
  };

  const renderPage = () => {
    return <Translator/>
  };

  //   useEffect(() => {
  //     const currentPath = window.location.pathname;

  //     if (currentPath.includes("members")) {
  //       setCurrentPage("members");
  //     } else if (currentPath.includes("usage")) {
  //       setCurrentPage("usage");
  //     } else {
  //       setCurrentPage("Activity");
  //     }
  //   }, []);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header breadCrumbs={breadCrumbs} />
      <div className="flex flex-1 mt-4 overflow-hidden">
        <TranslatorSidebar
          onSelect={handleSidebarSelect}
          selected={'Translator'}
        />
        <div className="flex-1 overflow-hidden py-6 px-2 ml-3 mr-3 mt-3 flex flex-col">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default Translation;
