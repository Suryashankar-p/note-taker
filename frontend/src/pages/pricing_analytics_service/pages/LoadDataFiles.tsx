import {
  FileText,
  Thermometer,
  BarChart3,
  DollarSign,
  List,
  X,
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

        <div className="mt-10 flex justify-end">
          <button
          onClick={()=>navigate('workspace')}
            className="
              rounded-xl 
              bg-red-600 
              px-5
              py-2
              text-sm
              font-medium 
              text-white
              shadow-sm
              hover:bg-red-700
              transition
            "
          >
            Upload all six files to continue →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadFiles;
