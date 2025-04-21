import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/Login";
import PageNotFound from "./assets/PageNotFound";
import PageLoading from "./components/PageLoading";

const isAuthenticated = () => {
  const Token = localStorage.getItem("access_token");
  return !!Token;
};

const ProtectedRoute = ({ element }: any) => {
  const navigate = useNavigate();

  if (isAuthenticated()) {
    return element;
  } else {
    navigate("/", { replace: true });
    return <Navigate to="/" replace />;
  }
};

const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChatPage = lazy(() => import("./pages/sales/ChatPageMain"));
const Settings = lazy(() => import("./pages/sales/settings/Settings"));
// const Translator = lazy(() => import("./pages/doc_translator/TranslationMain"));
// const TrainingQA = lazy(() => import("./pages/training_qa/TrainingQAMain"));
const TBWES_OCR = lazy(() => import("./pages/tbwes_ocr/OcrMain.tsx"));
const Thermax_GPT = lazy(() => import("./pages/thermax_gpt/GPTMain.tsx"));
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
        path="/ai-studio/sales"
        element={<ProtectedRoute element={<ChatPage />} />}
      />
      <Route
        path="/ai-studio/sales/settings"
        element={<ProtectedRoute element={<Settings />} />}
      />
      {/* <Route
        path="/ai-studio/doc_translator"
        element={<ProtectedRoute element={<Translator />} />}
      />
      <Route
        path="/ai-studio/training_qa"
        element={<ProtectedRoute element={<TrainingQA />} />}
      /> */}
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
      <Route path="*" element={<ProtectedRoute element={<PageNotFound />} />} />
    </Routes>
  </Suspense>
);

export default App;
