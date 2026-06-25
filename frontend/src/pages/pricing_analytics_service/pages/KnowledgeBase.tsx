import { Navigate } from "react-router-dom";

const KnowledgeBase = () => {
  const role = localStorage.getItem("pricing_analytics_role") || "ceo";

  if (role === "ceo") {
    return <Navigate to="ceo/overall-margin" replace />;
  }
  return <Navigate to="analyst" replace />;
};

export default KnowledgeBase;
