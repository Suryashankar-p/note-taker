import {
  FileText,
  Thermometer,
  BarChart3,
  DollarSign,
  List,
  X,
  Lock,
} from "lucide-react";

import FileUploadCard from "../components/FileUploadCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoadFiles = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([
    {
      title: "COGS Extract",
      description: "COGS FY 26 FY 25 FY 24_v1.csv",
      status: "upload",
      fileName: "",
      icon: <FileText className="text-red-600" />,
    },

    {
      title: "Heating Targets",
      description: "Target/Heating_Targets.csv",
      status: "upload",
      fileName: "",
      icon: <Thermometer className="text-red-600" />,
    },

    {
      title: "Heating Baseline",
      description: "Baseline/Heating_baseline.csv",
      status: "upload",
      fileName: "",
      icon: <BarChart3 className="text-red-600" />,
    },

    {
      title: "Price List",
      description:
        "Quarterly standard price list CSV (e.g. Q3FY26 in filename). Upload one file per quarter you need.",
      status: "upload",
      fileName: "",
      icon: <List className="text-red-600" />,
    },

    {
      title: "Cost List",
      description:
        "Quarterly standard cost list CSV. Upload one file per quarter you need.",
      status: "upload",
      fileName: "",
      icon: <DollarSign className="text-red-600" />,
    },

    {
      title: "Non-standard Targets",
      description:
        "Target/Heating_Non-Standard_Targets.csv — column J new margins_vJan26",
      status: "upload",
      fileName: "",
      icon: <X className="text-red-600" />,
    },
  ]);

  const handleUpload = (title: string, uploadedFile: File) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.title === title
          ? { ...file, status: "loaded", fileName: uploadedFile.name }
          : file,
      ),
    );
  };

  const allUploaded = files.every((file) => file.status === "loaded");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-24 py-12">
        <h1 className="text-xl font-bold">Load Data Files</h1>

        <p className="mt-3 text-gray-500 text-sm">
          Upload all required files before continuing.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-5">
          {files.map((file) => (
            <FileUploadCard
              key={file.title}
              title={file.title}
              description={file.description}
              status={file.status as "loaded" | "upload"}
              icon={file.icon}
              onUpload={(uploadedFile: File) =>
                handleUpload(file.title, uploadedFile)
              }
              fileName={file.fileName}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center text-center gap-3">
          <button
            onClick={() => allUploaded && navigate("workspace")}
            disabled={!allUploaded}
            className={`
              flex
              items-center
              justify-center
              gap-2
              w-[500px]
              rounded-xl 
              px-6
              py-3.5
              text-sm
              font-semibold 
              shadow-sm
              transition-all
              duration-200
              ${
                allUploaded
                  ? "bg-[#a61c1e] text-white hover:bg-red-700 cursor-pointer"
                  : "bg-[#dbdbdb] text-[#7c7c7c] cursor-not-allowed"
              }
            `}
          >
            {!allUploaded && <Lock size={18} className="text-[#969696]" />}
            Upload all six files to continue {allUploaded && "→"}
          </button>
          
          <div className="mt-2 text-xs font-medium text-gray-500 max-w-lg leading-relaxed">
            GIA Enterprise AI requires all data nodes for accurate cross-dimensional analysis.
            <br />
            <a href="#" className="text-[#a61c1e] hover:underline font-semibold mt-1 inline-block">
              Learn more about our data requirements
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadFiles;
