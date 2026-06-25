import { useLocation } from "react-router-dom";
import PricingAnalyst from "../components/PricingAnalyst";
import CeoBriefing from "../components/CeoBriefing";

const KnowledgeBase = () => {
  const location = useLocation();
  const role = location.state?.role || "ceo";

  return (
    <div className="p-6">
      {role === "ceo" ? <CeoBriefing /> : <PricingAnalyst />}
    </div>
  );
};

export default KnowledgeBase;
