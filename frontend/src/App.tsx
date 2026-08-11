import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/Login";
import PageNotFound from "./assets/PageNotFound";
import PageLoading from "./components/PageLoading";

const isAuthenticated = () => {
  const Token = localStorage.getItem("access_token");
  return !!Token;
};

const ProtectedRoute = ({ element }: any) => {
  const location = useLocation();

  if (isAuthenticated()) {
    return element;
  } else {
    const currentPath = location.pathname;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(currentPath)}`}
        replace
      />
    );
  }
};

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChatPage = lazy(() => import("./pages/sales/ChatPageMain"));
const Settings = lazy(() => import("./pages/sales/settings/Settings"));
const Translator = lazy(() => import("./pages/doc_translator/TranslationMain"));
const DocTranslatorSettings = lazy(
  () => import("./pages/doc_translator/settings/Settings")
);
const EdgeChatPage = lazy(() => import("./pages/edge/ChatPageMain"));
const EdgeSettings = lazy(() => import("./pages/edge/settings/Settings"));
const TBWES_OCR = lazy(() => import("./pages/tbwes_ocr/OcrMain.tsx"));
const Thermax_GPT = lazy(() => import("./pages/thermax_gpt/GPTMain.tsx"));
const TRANSMITTER_OCR = lazy(() => import("./pages/transmitter_ocr/TransmitterOcrMain.tsx"));
const Thermax_GPT_Settings = lazy(
  () => import("./pages/thermax_gpt/settings/Settings.tsx")
);
const Doctor_ConBot = lazy(
  () => import("./pages/doctor_conbot/DoctorConBotMain.tsx")
);
const Doctor_ConBot_Settings = lazy(
  () => import("./pages/doctor_conbot/settings/Settings.tsx")
);

const TroubleshootingMain = lazy(
  () => import("./pages/troubleshooting/TroubleshootingMain")
);
const TroubleshootingSettings = lazy(
  () => import("./pages/troubleshooting/settings/Settings.tsx")
);
const CyberBuddyMain = lazy(
  () => import("./pages/cyberbuddy/CyberBuddyMain.tsx")
);
const CyberBuddySettings = lazy(
  () => import("./pages/cyberbuddy/settings/Settings.tsx")
);
const HeatingOCRMain = lazy(
  () => import("./pages/heating_ocr/OcrMain.tsx")
);
const LegalCheckerMain = lazy(
  () => import("./pages/legal_checker/LegalCheckerMain.tsx")
);
const PricingAnalyticsService = lazy(
  () => import("./pages/pricing_analytics_service/index.tsx")
);
const LoadFiles = lazy(
  () => import("./pages/pricing_analytics_service/pages/LoadDataFiles")
);
const SettingsLayout = lazy(
  () => import("./pages/pricing_analytics_service/pages/SettingsLayout")
);
const MembersTab = lazy(
  () => import("./pages/pricing_analytics_service/pages/MembersTab")
);
const PricingAnalyticsServiceWorkspace = lazy(
  () => import("./pages/pricing_analytics_service/pages/Workspace.tsx")
);

const PricingAnalyticsServiceWorkspaceDashboard = lazy(
  () => import("./pages/pricing_analytics_service/pages/Dashboard.tsx")
);
const PricingAnalyticsServiceWorkspaceAnalytics = lazy(
  () => import("./pages/pricing_analytics_service/pages/KnowledgeBase.tsx")
);
const CeoBriefing = lazy(
  () => import("./pages/pricing_analytics_service/components/CeoBriefing.tsx")
);
const PricingAnalyst = lazy(
  () => import("./pages/pricing_analytics_service/components/PricingAnalyst.tsx")
);
const OverallMargin = lazy(
  () => import("./pages/pricing_analytics_service/components/ceo/OverallMargin.tsx")
);
const Classification = lazy(
  () => import("./pages/pricing_analytics_service/components/ceo/Classification.tsx")
);
const Skycraper = lazy(
  () => import("./pages/pricing_analytics_service/components/ceo/Skycraper.tsx")
);
const DispersionView = lazy(
  () => import("./pages/pricing_analytics_service/components/ceo/DispersionView.tsx")
);
const SelectBu = lazy(
  () => import("./pages/pricing_analytics_service/components/ceo/SelectBu.tsx")
);
const OverallMarginTab = lazy(
  () => import("./pages/pricing_analytics_service/components/analyst/OverallMarginTab.tsx")
);
const SkyscraperTab = lazy(
  () => import("./pages/pricing_analytics_service/components/analyst/SkyscraperTab.tsx")
);
const QoqMatrixTab = lazy(
  () => import("./pages/pricing_analytics_service/components/analyst/QoqMatrixTab.tsx")
);
const SkuDrillDownTab = lazy(
  () => import("./pages/pricing_analytics_service/components/analyst/SkuDrillDownTab.tsx")
);
const AnalystSelectBu = lazy(
  () => import("./pages/pricing_analytics_service/components/analyst/AnalystSelectBu.tsx")
);
const AnalystUpload = lazy(
  () => import("./pages/pricing_analytics_service/components/analyst/AnalystUpload.tsx")
);





const App = () => (
  <Suspense fallback={<PageLoading />}>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/ai-studio"
        element={<ProtectedRoute element={<Dashboard />} />}
      />
      <Route
        path="/ai-studio/tbwes_ocr"
        element={<ProtectedRoute element={<TBWES_OCR />} />}
      />
      <Route
        path="/ai-studio/transmitter_ocr"
        element={<ProtectedRoute element={<TRANSMITTER_OCR />} />}
      />
      <Route
        path="/ai-studio/sales"
        element={<ProtectedRoute element={<ChatPage />} />}
      />
      <Route
        path="/ai-studio/sales/settings"
        element={<ProtectedRoute element={<Settings />} />}
      />
      <Route
        path="/ai-studio/doc_translator"
        element={<ProtectedRoute element={<Translator />} />}
      />
      <Route
        path="/ai-studio/doc_translator/settings"
        element={<ProtectedRoute element={<DocTranslatorSettings />} />}
      />
      <Route
        path="/ai-studio/edge"
        element={<ProtectedRoute element={<EdgeChatPage />} />}
      />
      <Route
        path="/ai-studio/edge/settings"
        element={<ProtectedRoute element={<EdgeSettings />} />}
      />
      <Route
        path="/ai-studio/thermax_gpt"
        element={<ProtectedRoute element={<Thermax_GPT />} />}
      />
      <Route
        path="/ai-studio/doctor_conbot"
        element={<ProtectedRoute element={<Doctor_ConBot />} />}
      />
      <Route
        path="/ai-studio/doctor_conbot/settings"
        element={<ProtectedRoute element={<Doctor_ConBot_Settings />} />}
      />
      <Route
        path="/ai-studio/thermax_gpt/settings"
        element={<ProtectedRoute element={<Thermax_GPT_Settings />} />}
      />
      <Route
        path="/ai-studio/troubleshooting"
        element={<ProtectedRoute element={<TroubleshootingMain />} />}
      />
      <Route
        path="/ai-studio/troubleshooting/settings"
        element={<ProtectedRoute element={<TroubleshootingSettings />} />}
      />
      <Route
        path="/ai-studio/cyberbuddy"
        element={<ProtectedRoute element={<CyberBuddyMain />} />}
      />
      <Route
        path="/ai-studio/cyberbuddy/settings"
        element={<ProtectedRoute element={<CyberBuddySettings />} />}
      />
      <Route
        path="/ai-studio/heating_ocr"
        element={<ProtectedRoute element={<HeatingOCRMain />} />}
      />
      <Route
        path="/ai-studio/legal_checker"
        element={<ProtectedRoute element={<LegalCheckerMain />} />}
      />
      <Route
        path="/ai-studio/pricing-analytics"
        element={<ProtectedRoute element={<PricingAnalyticsService />} />}
      />
      <Route
        path="/ai-studio/pricing-analytics/settings"
        element={<ProtectedRoute element={<SettingsLayout />} />}
      >
        <Route path="members" element={<MembersTab />} />
      </Route>
      <Route
        path="/ai-studio/pricing-analytics/workspace"
        element={<ProtectedRoute element={<PricingAnalyticsServiceWorkspace />} />}
      />
      <Route
        path="/ai-studio/pricing-analytics/workspace/dashboard"
        element={<ProtectedRoute element={<PricingAnalyticsServiceWorkspaceDashboard />} />}
      >
        <Route index element={<PricingAnalyticsServiceWorkspaceAnalytics />} />
        <Route path="ceo" element={<CeoBriefing />}>
          <Route path="overall-margin" element={<OverallMargin />} />
          <Route path="select-bu" element={<SelectBu />} />
          <Route path=":bu/classification" element={<Classification />} />
          <Route path=":bu/revenue-gm-ladder" element={<Skycraper />} />
          <Route path=":bu/dispersion-view" element={<DispersionView />} />
        </Route>
        <Route path="analyst" element={<PricingAnalyst />}>
          <Route index element={<Navigate to="select-bu" replace />} />
          <Route path="select-bu" element={<AnalystSelectBu />} />
          <Route path=":bu/upload" element={<AnalystUpload />} />
          <Route path=":bu/overall-margin" element={<OverallMarginTab />} />
          <Route path=":bu/revenue-gm-ladder" element={<SkyscraperTab />} />
          <Route path=":bu/qoq-matrix" element={<QoqMatrixTab />} />
          <Route path=":bu/sku-drill-down" element={<SkuDrillDownTab />} />
        </Route>
      </Route>
      <Route path="*" element={<ProtectedRoute element={<PageNotFound />} />} />
    </Routes>
  </Suspense>
);

export default App;
