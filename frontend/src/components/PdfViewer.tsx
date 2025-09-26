import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { useState } from "react";

type PdfViewerProps = {
  fileUrl: string;
  onLoad?: () => void;
};

export const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl, onLoad }) => {
  console.log("Rendering PDF Viewer with URL:", fileUrl);

  const handleDocumentLoad = () => {
    if (onLoad) {
      onLoad();
    }
  };

  return (
    <div style={{ height: "750px", border: "1px solid #ccc" }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer fileUrl={fileUrl} onDocumentLoad={handleDocumentLoad} />
      </Worker>
    </div>
  );
};
