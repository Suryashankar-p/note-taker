import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import store, { Dispatch } from "../redux/store.ts";
import { ACTIVE_SERVICES } from "../config.ts";
import { GetMemberSalesRole } from "../services/sales.ts";
import { GetMemberOCRRole } from "../services/tbwes_ocr.ts";
import { GetMemberGPTRole } from "../services/thermax_gpt.ts";
import { GetMemberDoctorConbotRole } from "../services/doctor_conbot.ts";
import { GetMemberTroubleshootingRole } from "../services/troubleshooting.ts";
import { GetMemberCyberBuddyRole } from "../services/cyberbuddy.ts";
import { GetHeatingOCRRole} from "../services/heating_ocr.ts";
import { TransmitterGetMemberOCRRole} from "../services/transmitter_ocr.ts";

type Type =
  | "sales"
  | "tbwes_ocr"
  | "thermax_gpt"
  | "doctor_conbot"
  | "troubleshooting"
  | "ciso_bot"
  | "transmitter_ocr"
  | "cyberbuddy"
  | "heating_ocr";

const useApiCheck = (type?: Type) => {
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const selectApi = async (select: Type) => {
    switch (select) {
      case "sales":
        return await GetMemberSalesRole();
      case "tbwes_ocr":
        return await GetMemberOCRRole();
      case "thermax_gpt":
        return await GetMemberGPTRole();
      case "doctor_conbot":
        return await GetMemberDoctorConbotRole();
      case "troubleshooting":
        return await GetMemberTroubleshootingRole();
      case "cyberbuddy":
        return await GetMemberCyberBuddyRole();
      case "heating_ocr":
        return await GetHeatingOCRRole();
      case "transmitter_ocr":
        return await TransmitterGetMemberOCRRole();
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
          console.error("Error fetching member role:", error);
        }
      } else {
        navigate("/ai-studio", { state: { message: "Service not available" } });
      }
    };
    fetchData();
  }, [navigate, type]);
  return loading;
};
export default useApiCheck;
