import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Text from "../components/Text";
import sales from "../assets/sales_establish.png";
import Button from "../components/Button";
import Avatar3 from "../assets/avatar3.png";
import Search from "../assets/search_icon.svg";
import Input from "../components/Input";
import DocIntel from "../assets/document_ai.png";
import Project_3 from "../assets/project_3.png";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../redux/store";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles.css";
import NoData from "../assets/no_data";
import Toast from "../components/Toast";
import { selectImage } from "../utils/functions.ts";
import { GetMemberGPTRole } from "../services/thermax_gpt.ts";
import { GetMemberDoctorConbotRole } from "../services/doctor_conbot.ts";
import PageLoading from "../components/PageLoading.tsx";
import { GetServices } from "../services/common.ts";
import { GetMemberSalesRole } from "../services/sales.ts";
import { GetMemberOCRRole } from "../services/tbwes_ocr.ts";
import { GetMemberTroubleshootingRole } from "../services/troubleshooting.ts";
import { GetMemberCyberBuddyRole } from "../services/cyberbuddy.ts";
import { GetHeatingOCRRole } from "../services/heating_ocr.ts";
import { TransmitterGetMemberOCRRole } from "../services/transmitter_ocr.ts";
import { GetTranslatorRole } from "../services/doc_translator.ts";
import { GetMemberEdgeRole } from "../services/edge.ts";

const DOMAIN = window.env?.DOMAIN || import.meta.env.VITE_DOMAIN;

interface Card {
  title: string;
  description: string;
  id: number;
  is_active: boolean;
  created_on: string;
  last_modified_on: string;
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const [services, setServices] = useState<Card[]>([]);
  const [totalServies, setTotalServices] = useState<number>(0);
  const [pageError, setPageError] = useState<boolean>(false);
  const navigate = useNavigate();
  let timeoutId: NodeJS.Timeout | null = null;
  const toastStatus = useSelector((state: RootState) => state.toast);
  const location = useLocation();
  const { state } = location;
  const [loading, setLoading] = useState<boolean>(false);

  const message = state?.message;

  useEffect(() => {
    if (message && message !== "") {
      dispatch.toast.openToast({ status: true, message: message });
      navigate("/ai-studio");
    }
  }, [message]);

  useEffect(() => {
    getAvailableServices(0, 100, "");
  }, []);

  const getAvailableServices = async (
    skip: number,
    limit: number,
    search_term: string
  ) => {
    //setLoading(true);
    try {
      const servicesList = await GetServices(skip, limit, search_term);
      console.log("Service List:", servicesList)
      if (servicesList?.result) {
        let filteredResult = servicesList.result;
        if (DOMAIN === "https://aistudio.thermaxglobal.com") {
          const titlesToRemove = ["Heating OCR"];
          filteredResult = filteredResult.filter(
            (service: Card) => !titlesToRemove.includes(service.title)
          );
        }
        console.log("Filtered Result:", filteredResult);
        setServices(filteredResult);
        setTotalServices(servicesList?.total);
      } else {
        setPageError(true);
        if (servicesList?.detail)
          dispatch.toast.openToast({
            status: true,
            message: servicesList?.detail,
          });
        navigate("/");
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      getAvailableServices(0, 100, searchTerm);
    }, 500); // Adjust the delay time (in milliseconds) as needed
  };

  const getSalesRole = async () => {
    try {
      const response = await GetMemberSalesRole();
      if (response?.role) {
        navigate("./sales");
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({ status: true, message: response?.detail });
      }
    } catch (err) {
      navigate("/");
    }
  };

  const getOCRRole = async () => {
    try {
      const response = await GetMemberOCRRole();
      if (response?.role) {
        navigate("./tbwes_ocr");
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({ status: true, message: response?.detail });
      }
    } catch (err) {
      navigate("/");
    }
  };

  const TransmittergetOCRRole = async () => {
    try {
      const response = await TransmitterGetMemberOCRRole();
      if (response?.role) {
        navigate("./transmitter_ocr");
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({ status: true, message: response?.detail });
      }
    } catch (err) {
      navigate("/");
    }
  };

  const getGPTRole = async () => {
    try {
      const response = await GetMemberGPTRole();
      if (response?.email) {
        navigate("./thermax_gpt");
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({ status: true, message: response?.detail });
      }
    } catch (err) {
      navigate("/");
    }
  };

  const getDoctorConbotRole = async () => {
    try {
      const response = await GetMemberDoctorConbotRole();
      if (response?.role) {
        navigate("./doctor_conbot");
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({ status: true, message: response?.detail });
      }
    } catch (err) {
      navigate("/");
    }
  };

  const getTranslatorRole = async () => {
    try {
      const translatorRole = await GetTranslatorRole();
      if (translatorRole?.email) {
        navigate("./doc_translator");
      } else {
        if (translatorRole?.detail) {
          setPageError(true);
          dispatch.toast.openToast({
            status: true,
            message: translatorRole?.detail,
          });
        } else {
          setPageError(true);
          dispatch.toast.openToast({
            status: true,
            message: "Server failed to respond",
          });
        }
      }
    } catch (error) {
      navigate("/");
    }
  };


  const getTroubleshootingRole = async () => {
    try {
      const response = await GetMemberTroubleshootingRole();
      if (response?.role) {
        navigate("./troubleshooting");
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({ status: true, message: response?.detail });
      }
    } catch (err) {
      navigate("/");
    }
  };

  const getCyberBuddyRole = async () => {
    try {
      const response = await GetMemberCyberBuddyRole();
      if (response?.role) {
        navigate("./cyberbuddy");
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({ status: true, message: response?.detail });
      }
    } catch (err) {
      navigate("/");
    }
  };

  const getHeatingOCRRole = async () => {
    try {
      const response = await GetHeatingOCRRole();
      if (response?.role) {
        navigate("./heating_ocr");
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({ status: true, message: response?.detail });
      }
    } catch (err) {
      navigate("/");
    }
  };

  const getEdgeRole = async () => {
    try {
      const response = await GetMemberEdgeRole();
      if (response?.role) {
        navigate("./edge");
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({ status: true, message: response?.detail });
      }
    } catch (err) {
      console.log("my err");
    }
  };

  const openService = (title: string) => {
    switch (title) {
      case "Sales Enablement Tool":
        getSalesRole();
        break;
      case "TBWES OCR":
        getOCRRole();
        break;
      case "Thermax-GPT":
        getGPTRole();
        break;
      case "Document Translator":
        getTranslatorRole();
        break;
      case "Dr. ConBot":
        getDoctorConbotRole();
        break;
      case "Smart Troubleshooting App":
        getTroubleshootingRole();
        break;
      case "CyberBuddy":
        getCyberBuddyRole();
        break;
      case "Heating OCR":
        getHeatingOCRRole();
        break;
      case "Transmitter OCR":
        TransmittergetOCRRole();
        break;
      case "Edge Bot":
        getEdgeRole();
        break;
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div>
      <Header />
      {toastStatus.status && pageError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-90 space-y-4">
          <Toast type="error" />
        </div>
      )}
      <div className="w-7xl mx-auto px-4 ml-4 py-6 mb-12 md:py-6">
        {/* Your dashboard content goes here */}
        <div className="flex flex-row justify-between mt-[10vh]">
          <div className="flex flex-col">
            <Text className="ml-2" type="header2">
              AI Studio
            </Text>
            {services && (
              <Text type="small" className="text-faint_text ml-5">{`(${services?.length > 1
                ? services?.length + " Results"
                : services?.length + " Result"
                } of ${totalServies})`}</Text>
            )}
          </div>
          <Input
            onChange={onSearchChange}
            prefixIcon={<img src={Search} alt="Icon" />}
            placeholder="Search"
            fixed_size="large"
          />
        </div>
        {services?.length > 0 ? (
          <div
            className="relative top-5 left-2 w-full 
          max-h-[70vh] overflow-y-auto 
          md:max-h-[65vh] 
          lg:max-h-[70vh] 
          sm:max-h-[60vh]"           >
            <div className="flex flex-wrap gap-10">
              {services?.map((item: Card, index: number) => (
                <div
                  key={index}
                  className="relative gap-3 flex flex-col items-start w-64 h-96 bg-white border border-gray-300 shadow-md rounded-2xl"
                >
                  <div className="object-cover w-full h-48 overflow-hidden flex items-center justify-center rounded-t-lg">
                    <img
                      loading="lazy"
                      src={selectImage(item.title)}
                      alt="sales"
                      className="object-cover w-full h-full rounded-t-lg"
                    />
                  </div>
                  <div className="px-2">
                    <Text type="subtitle">{item.title}</Text>
                    <Text
                      title={item.description}
                      type="small"
                      className="text-faint_text line-clamp-3 tooltip"
                    >
                      {item.description}
                    </Text>
                  </div>
                  <div className="flex flex-row ml-2 absolute bottom-7 left-3 justify-between space-x-2">
                    <Button
                      onClick={() => openService(item.title)}
                      className="w-32 h-8 justify-center mt-2"
                      custom_type="danger"
                    >
                      <Text className="text-danger" type="button-text">
                        VIEW
                      </Text>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <NoData />
          </div>
        )}
        {/* Add more content as needed */}
      </div>
    </div>
  );
};

export default Dashboard;
