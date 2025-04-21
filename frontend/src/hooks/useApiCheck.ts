import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import store, { Dispatch } from "../redux/store.ts";
import { ACTIVE_SERVICES } from "../config.ts";
import { GetMemberSalesRole } from "../services/sales.ts";
import { GetMemberOCRRole } from "../services/tbwes_ocr.ts";
// import { GetTranslatorRole } from "../services/doc_translator.ts";
//import { GetTrainingQARole } from "../services/training_qa.ts";
import { GetMemberGPTRole } from "../services/thermax_gpt.ts";
import { GetMemberDoctorConbotRole } from "../services/doctor_conbot.ts";
import { GetMemberTroubleshootingRole } from "../services/troubleshooting.ts";

type Type =
  | "sales"
  | "tbwes_ocr"
  | "doc_translator"
  | "training_qa"
  | "thermax_gpt"
  | "doctor_conbot"
  | "troubleshooting";

const useApiCheck = (type?: Type) => {
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const selectApi = async (select: Type) => {
    switch (select) {
      case "sales":
        return await GetMemberSalesRole();
      case "tbwes_ocr":
        return await GetMemberOCRRole();
   //   case "doc_translator":
    //    return await GetTranslatorRole();
    // case "training_qa":
    //   return await GetTrainingQARole();
      case "thermax_gpt":
        return await GetMemberGPTRole();
      case "doctor_conbot":
        return await GetMemberDoctorConbotRole();
      case "troubleshooting":
        return await GetMemberTroubleshootingRole();
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (ACTIVE_SERVICES[type]) {
        try {
          const data: any = await selectApi(type);
          if (!data?.email && !data?.role) {
            navigate("/ai-studio", { state: { message: "User not a member" } });
          } else {
            (store.dispatch as Dispatch).memberRole.setRole({
              service: type,
              details: data,
            });
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching member sales role:", error);
        }
      } else {
        navigate("/ai-studio", { state: { message: "Service not available" } });
      }
    };

    fetchData();
  }, [navigate]);

  return loading;
};

export default useApiCheck;
