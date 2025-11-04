import React, { useState, Fragment, useEffect } from "react";
import {
  Dialog,
  Transition,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import Text from "../Text";
import Close from "../../assets/close.svg";
import download from "../../assets/download.svg";
import { getIframeSrc } from "../../utils/functions.ts";
import { PdfViewer } from "../PdfViewer";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";


const FileViewModal = ({ fileUrl, isOpen, onClose }) => {
  const loader= useSelector((state: RootState) => state.loadingState.status)

  const [loading, setLoading] = useState(loader ?? true);
  const [excelHtml, setExcelHtml] = useState(""); // 👈 to store rendered Excel HTML

  const closeModal = () => {
    onClose();
  };

  const onDownload = () => {
    const a = document.createElement("a");
    a.href = fileUrl.url;
    a.download = fileUrl.name || "downloaded-file";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 👇 When modal opens, check if file is Excel and render it
  useEffect(() => {
    const loadExcel = async () => {
      if (!fileUrl?.url) return;
      setLoading(true);

      try {
        let workbook;
        const base64Data = fileUrl.url.split(",")[1]; // remove data: prefix

        if (fileUrl.name.endsWith(".xlsx")) {
          // New Excel format
          workbook = XLSX.read(base64Data, { type: "base64" });
        } else if (fileUrl.name.endsWith(".xls")) {
          // Old Excel format
          // Convert base64 to binary string
          const binary = atob(base64Data);
          workbook = XLSX.read(binary, { type: "binary" });
        } else {
          throw new Error("Unsupported Excel file type");
        }

        // Render first sheet (or all sheets)
        const firstSheet = workbook.SheetNames[0];
        let html = XLSX.utils.sheet_to_html(workbook.Sheets[firstSheet]);
        // Add borders to the table
       html = `
<style>
  /* General table style */
  table {
    border-collapse: collapse;
    width: 100%;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    table-layout: fixed;
    background-color: #fff;
  }

  /* Header row */
  th {
    background-color: #f3f3f3;
    font-weight: bold;
    text-align: center;
    padding: 8px;
    border: 1px solid #ccc;
    color: #333;
  }

  /* Table cells */
  td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Alternating row colors */
  tr:nth-child(even) td {
    background-color: #fafafa;
  }

  /* Hover highlight */
  tr:hover td {
    background-color: #e6f2ff;
  }

  /* Fix width for table container */
  div {
    overflow-x: auto;
    width: 100%;
  }
</style>
<div>${html}</div>
`;
        setExcelHtml(html);
      } catch (err) {
        console.error("Error rendering Excel:", err);
        setExcelHtml("<p>Unable to display Excel file.</p>");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) loadExcel();
  }, [fileUrl, isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0061F3]/10" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-hidden">
          <div className="flex items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className="w-full lg:max-w-6xl max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <DialogTitle
                  as="h3"
                  className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                >
                  <Text className="lg:w-[55rem] md:w-[50rem] sm:w-[30rem] xs:w-[10rem] w-[10rem] truncate ellipsis">
                    {fileUrl?.name}
                  </Text>

                  <button
                    className="absolute right-12 -top-5"
                    onClick={onDownload}
                  >
                    <img src={download} alt="download" loading="lazy" />
                  </button>

                  <button
                    className="absolute -right-4 -top-5"
                    onClick={closeModal}
                  >
                    <img src={Close} alt="close" loading="lazy" />
                  </button>
                </DialogTitle>

                <div className="h-[calc(100vh-150px)] mt-8 w-full overflow-y-scroll relative">
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                        <p className="mt-2 text-gray-700">Loading...</p>
                      </div>
                    </div>
                  )}

                  {/* 👇 Handle file types */}
                  {["jpg", "jpeg", "png"].includes(
                    fileUrl?.type?.toLowerCase()
                  ) ? (
                    <img
                      src={fileUrl?.url}
                      alt={fileUrl?.name || "Image"}
                      className="w-full h-full object-contain"
                      onLoad={() => setLoading(false)}
                    />
                  ) : ["mp4", "webm", "ogg"].includes(
                      fileUrl?.type?.toLowerCase()
                    ) ? (
                    <video
                      src={fileUrl?.url}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                      onCanPlay={() => setLoading(false)}
                    />
                  ) : fileUrl?.type?.toLowerCase() === "pdf" ? (
                    <div
                      className="w-full h-full"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <PdfViewer
                        fileUrl={fileUrl?.url}
                        onLoad={() => setLoading(false)}
                      />
                    </div>
                  ) : fileUrl?.type?.toLowerCase() === "excel" ? (
                    <div
                      className="excel-container w-full h-full overflow-auto"
                      dangerouslySetInnerHTML={{ __html: excelHtml }}
                    />
                  ) : (
                    <iframe
                      id="file-iframe"
                      title="file-iframe"
                      src={getIframeSrc(fileUrl?.url, fileUrl?.type)}
                      className={`w-full h-full ${
                        loading ? "hidden" : "block"
                      }`}
                      allowTransparency={true}
                      onLoad={() => setLoading(false)}
                    />
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FileViewModal;
