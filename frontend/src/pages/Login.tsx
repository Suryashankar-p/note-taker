import React, { useEffect } from "react";
import "./styles.css";
import logo from "../assets/logo.png";
import hand from "../assets/hand.png";
import microsoft from "../assets/microsoft.png";
import thumbs from "../assets/thumbs-up.svg";
import Button from "../components/Button";
import Text from "../components/Text";
import { LoginBody, getAuthUrl, getToken, loginApi } from "../services/auth.ts";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Toast from "../components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../redux/store";

// const ENABLE_SSO = import.meta.env.VITE_ENABLE_SSO;
// const USEREMAIL = import.meta.env.VITE_FIRST_USER_EMAIL;
const ENABLE_SSO = window.env?.ENABLE_SSO;
const USEREMAIL = window.env?.ADMIN_USER_EMAIL;

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toastStatus = useSelector((state: RootState) => state.toast);
  const dispatch = useDispatch<Dispatch>();

  useEffect(() => {
    if (searchParams.toString() !== "" && ENABLE_SSO === "true") {
      onAuth(searchParams.toString());
      dispatch.toast.openToast({
        status: true,
        message: "Logging you in...",
        type: "success",
      });
    }
  }, [searchParams]);

  const onAuth = async (params: string) => {
    try {
      const response = await getToken(params);
      if (response?.access_token) {
        localStorage.setItem("access_token", response?.access_token);
        localStorage.removeItem("chat_id");
        navigate("/ai-studio");
      } else {
        dispatch.toast.openToast({
          status: true,
          message: "Login Failed",
          type: "error",
        });
        navigate("/");
      }
    } catch (err) {
      console.log(err);
      dispatch.toast.openToast({
        status: true,
        message: "Login Failed",
        type: "error",
      });
    }
  };

  const onLoginClick = async () => {
    if (ENABLE_SSO === "true") {
      try {
        const response = await getAuthUrl();
        if (response) {
          window.location.href = response;
        }
      } catch (error: any) {
        if (error.response) {
          if (error.response.status === 502) {
            throw new Error(
              "CORS Error: The server responded with a 502 Bad Gateway error."
            );
          } else {
            throw new Error(`Server Error: ${error.response.status}`);
          }
        } else if (error.request) {
          dispatch.toast.openToast({ message: error?.message, status: true });
          throw new Error(
            "Network Error: No response received from the server."
          );
        } else {
          throw new Error("Request Error: Failed to make the request.");
        }
      }
    } else {
      const body: LoginBody = {
        username: USEREMAIL,
        password: "password",
        grant_type: "password",
        scope: "",
        client_id: "",
        client_secret: "",
      };
      try {
        const response = await loginApi(body);
        if (response) {
          localStorage.setItem("access_token", response?.access_token);
          localStorage.removeItem("chat_id");
          navigate("/ai-studio");
        } else {
          dispatch.toast.openToast({
            status: true,
            message: "Failed to login",
            type: "error",
          });
        }
      } catch (err) {
        dispatch.toast.openToast({
          status: true,
          message: "Failed to login",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {toastStatus.status && toastStatus?.type === "error" ? (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      ) : (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="success" />
        </div>
      )}

      <div className="flex-1 flex flex-col space-y-5 mt-32 md:mt-6 mx-4 md:mx-12">
        {/* Logo Section */}
        <div className="mt-6 flex justify-center md:justify-start md:ml-36">
          <img
            loading="lazy"
            srcSet={logo}
            alt="logo"
            className="w-40 md:w-44 h-auto"
          />
        </div>

        {/* Welcome Text & Button */}
        <div className="relative">
          <div className="flex flex-col md:flex-row items-center md:space-x-4 md:ml-20">
            <img
              loading="lazy"
              srcSet={hand}
              alt="hand"
              className="w-10 md:w-12 h-auto mb-6 md:mb-16"
            />
            <div className="flex flex-col text-center md:text-left">
              <div className="text-3xl md:text-5xl mt-6 md:mt-12 font-bold leading-tight tracking-tighter text-blue-950 font-work">
                Hello! <br className="hidden md:block" /> Welcome back!
              </div>
              <div className="mt-4 self-center">
                <Button
                  onClick={onLoginClick}
                  size="large"
                  custom_type="primary"
                >
                  <img
                    loading="lazy"
                    srcSet={microsoft}
                    alt="Icon"
                    className="w-5 md:w-6 h-5 md:h-6 mr-3 md:mr-4"
                  />
                  <Text type="body">Sign in with Microsoft</Text>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Privacy */}
        <div className="flex flex-col items-center md:flex-row md:ml-52 gap-2 text-input_text text-sm md:text-base">
          <Text type="body">
            <a
              href="https://edge.thermaxglobal.com/legal-document/terms-of-service.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mr-1 md:mr-2"
            >
              Terms of Use
            </a>
            |
            <a
              href="https://edge.thermaxglobal.com/legal-document/privacy-policy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 md:ml-2"
            >
              Privacy
            </a>
          </Text>
        </div>
      </div>

      {/** Render only on non-mobile screens */}
      <div className="hidden md:flex flex-1 background_image flex-col justify-center items-center p-16">
        <div className="relative text-4xl font-bold tracking-tighter text-white text-center">
          WE HEAT, COOL, POWER, CLEAN AND RECYCLE
          <br />
        </div>
        <div className="relative flex flex-col w-full p-6 mt-48 rounded-xl backdrop-blur-[50px] bg-red-50 bg-opacity-10">
          <Button disabled size="small" custom_type="primary">
            <img
              loading="lazy"
              srcSet={thumbs}
              alt="Icon"
              className="thumbs_up"
            />
            Thermax
          </Button>
          <div className="mt-6 text-2xl font-medium text-white text-center">
            Welcome to Thermax - an engineering company providing sustainable
            solutions in energy and environment.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;