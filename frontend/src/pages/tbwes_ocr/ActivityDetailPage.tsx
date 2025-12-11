import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { GlobalWorkerOptions, version } from "pdfjs-dist";
import Text from "../../components/Text";
import { useLocation, useNavigate } from "react-router-dom";
import { url } from "../../utils/constants";
import Button from "../../components/Button";
import {
  GetDocumentUrl,
  GetOCRActivitiesDetails,
  SentMultipartMessage,
  UpdateOCRActivitiesDetails,
  GetAckData
} from "../../services/tbwes_ocr.ts";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import ConfirmationModal from "../../components/Modals/ConfirmationModal.tsx";
import iButton from "../../assets/info.svg";
import Tick from "../../assets/tick.svg";
import DropDownButton from "../../components/DropDownButton.tsx";
import Toast from "../../components/Toast.tsx";
import { capitalizeWords, statusMapper } from "../../utils/functions.ts";

GlobalWorkerOptions.workerSrc = url;

interface Item {
  title: string;
  type: string;
  value: string | null;
  is_valid: boolean;
  invalid_reason: string | null;
}

const ActivityDetailPage: React.FC = () => {
  const location = useLocation();
  const activity = location?.state?.activity;
  const [reason, setReason] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const [enableAnnotation, setEnableAnnotation] = useState<any>({
    name: "Disable",
  });
  const [fieldData, setFieldData] = useState<any>([]);
  const [activityDetails, setActivityDetails] = useState<any>();
  let timeoutId: NodeJS.Timeout | null = null;
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch<Dispatch>();
  const [confirmationData, setConfirmationData] = useState<{
    title: string;
    content: string;
    type: "submit" | "reject";
  }>({ title: "", content: "", type: "submit" });
  const confirmationStatus = useSelector(
    (state: RootState) => state.modal.confirmation
  );
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState<
    { coordinates: any; pageNumber: number }[]
  >([]);
  const [pageError, setPageError] = useState<boolean>(false);
  const toast = useSelector((state: RootState) => state.toast);

  useEffect(() => {
    if (activityDetails && activityDetails?.coordinates?.coordinate?.length > 0) {
      const newCoordinates = activityDetails?.coordinates?.coordinate?.map((item: any) => ({
        coordinates: item.coordinate,
        pageNumber: item.pagenumber,
      }));
      setCoordinates(newCoordinates);
    } else {
      setCoordinates([]); // Handle the case where there are no activity details
    }
  }, [activityDetails]);

  useEffect(() => {
    getActivityDetails(activity?.id);
    getDocumentLink(activity?.id);
  }, []);

  useEffect(() => {
    getack()
   
  }, []);

  const getDocumentLink = async (activity_id: number) => {
    try {
      const response = await GetDocumentUrl(activity_id);
      setPdfUrl(response?.link);
    } catch (error) {
      console.error("Error reading document link:", error);
    }
  };

  const getActivityDetails = async (activity_id: number) => {
    // Implement your logic to fetch and display activity details
    try {
      const response = await GetOCRActivitiesDetails(activity_id);
      if (response?.id) {
        setActivityDetails(response);
        setFieldData(response?.data?.field);
      } else {
        console.log("ere");
        navigate("/ai-studio/tbwes_ocr", { replace: true });
      }
    } catch (error) {
      console.log(error?.message);
    }
  };

  const highlightFields = async (fieldsToHighlight: any) => {
    const existingPdfBytes = await fetch(pdfUrl).then((res) =>
      res.arrayBuffer()
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();

    fieldsToHighlight.forEach((field) => {
      const { pageNumber, coordinates } = field;

      if (pageNumber < 1 || pageNumber > pages.length) {
        console.error(
          `Invalid page number: ${pageNumber}. PDF has ${pages.length} pages.`
        );
        return;
      }
      const targetPage = pages[pageNumber - 1];
      const { width: pdfWidth, height: pdfHeight } = targetPage.getSize();
      const { current_min_x, current_max_x, current_min_y, current_max_y } =
        coordinates;
      const box_x = current_min_x * pdfWidth;
      const box_y = current_min_y * pdfHeight;
      const box_width = (current_max_x - current_min_x) * pdfWidth;
      const box_height = (current_max_y - current_min_y) * pdfHeight;

      // Example rectangles to highlight fields
      targetPage.drawRectangle({
        x: box_x,
        y: pdfHeight - box_y - box_height, // Flipping the y-coordinate
        width: box_width,
        height: box_height,
        borderColor: rgb(1, 0, 0), // red color
        borderWidth: 1, // thin border
      });
    });
    const pdfBytes = await pdfDoc.save();
   const blob = new Blob([pdfBytes.slice().buffer], { type: "application/pdf" });
    const newUrl = URL.createObjectURL(blob);
    setPdfUrl(newUrl);
  };

  const getack = async () => {
    try {
      const response = await GetAckData(activity?.id); // Await the async function
  
      // Check if the response meets your condition to stop polling
      if (response?.reason) {
        setReason(response.reason);
      }
      else{
        setReason(null);
      }


    } catch (error) {
      console.error("Error fetching acknowledgment data:", error);
    }
  };
  

  const pollAckData = async () => {
    const checkAckData = async () => {
      const response = await GetAckData(activity?.id);
      
      // Check if the response meets your condition to stop polling
      if (response?.reason) {
        clearInterval(polling);
        clearTimeout(timeout);
        setReason(response.reason);
        
        getActivityDetails(activity?.id); 
         // Stop polling when the condition is met
      } else {
        console.log("Waiting for response...");
      }
    };
  
  
    const polling = setInterval(checkAckData, 10000);
    const timeout = setTimeout(() => {
      clearInterval(polling); // Stop polling after 30 seconds
    }, 40000);
  };
  const handleSubmit = async (type: string) => {
    // Handle the form submission here
    const updatedType = statusMapper(type)    
    try {
      setLoading(true);
      const response = await SentMultipartMessage(activity?.id, updatedType);
      if (response) {
        setReason(null)
        getActivityDetails(activity?.id)
        getack()
        pollAckData()
        setLoading(false);
        dispatch.toast.openToast({
          status: true,
          message: `${capitalizeWords(type)}ed successfully`,
          type: "success",
        });

      }
      else {
        dispatch.toast.openToast({
          status: true,
          message: `Failed to ${capitalizeWords(type)}`,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error sending form data:", error);
      dispatch.toast.openToast({
        status: true,
        message: `Failed to ${capitalizeWords(type)}`,
        type: "error",
      });
    }
  };
  
  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [fieldData]);

  const handleInputChange = async (index: number, value: string | number) => {
    scrollPositionRef.current = scrollRef.current?.scrollTop || 0;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setFieldData((prevFieldData: any) => {
        const updatedFieldData = [...prevFieldData];
        updatedFieldData[index] = {
          ...updatedFieldData[index],
          value: value,
        };
        updateActivityDetails(activity?.id, updatedFieldData);
      });
    }, 4000); //
  };

  const updateActivityDetails = async (activity_id: number, body: any) => {
    let payload = {
      title: activity?.title,
      data: {
        field: body,
      },
    };
    try {
      const response = await UpdateOCRActivitiesDetails(activity_id, payload);
      if (response?.data) {
        setFieldData(response?.data);
        getActivityDetails(activity?.id);
      }
    } catch (err) {
      console.error("Error updating activity details:", err);
    }
  };

  const hasValidItem = () => {
    return (
      fieldData?.length > 0 && fieldData.some((item: Item) => !item.is_valid)
    );
  };

  const handleHighlighting = () => {
    if (coordinates?.length > 0) {
      highlightFields(coordinates);
    }
  };

  const onAnnotationChange = (value: any) => {
    setEnableAnnotation(value);    
    if (enableAnnotation.name === value.name) {
      return;
    } else if (value.name === "Enable") {
      handleHighlighting();
    } else {
      getDocumentLink(activity?.id);
    }
  };

  const renderWarning = () => {
    return (
      <div
        title={
          hasValidItem()
            ? "Some of the values are Invalid"
            : "All values are valid"
        }
        className="flex flex-row p-2 gap-1 items-center border cursor-default	 rounded-lg "
      >
        {hasValidItem() ? (
          <svg
            className="w-5 h-5 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 50 50"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z" />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 mb-1 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2l4-4m5 5a9 9 0 11-18 0a9 9 0 0118 0z"
            />
          </svg>
        )}{" "}
        <Text
          type="small"
          className={`${
            hasValidItem() ? "text-yellow-400" : "text-green-600"
          } items-center`}
        >
          {hasValidItem() ? "Invalid" : "Valid"}
        </Text>
      </div>
    );
  };

  return (
    <div className="flex flex-col py-6 h-full mt-2 gap-3 flex-1 relative">
      {/* Top-right Submit Button */}
      <div className="flex px-4 flex-row gap-4">
        <div className="flex flex-col w-full">
          <Text
            type="header3"
            title={activityDetails?.title}
            className="text-2xl truncate ellipsis max-w-[100px] font-bold mb-4"
          >
            {activityDetails?.title}
          </Text>
        </div>
        <div className="absolute flex gap-8 top-4 items-center right-6">
          <div className="inline-flex items-center gap-2">
            <label className="inline-flex">
              <Text className=" text-primary_text" type="body">
                Annotation:
              </Text>

              
              {/* {reason && (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-lg">
      <Text className="text-yellow-500" type="body">
        {reason}
      </Text>
    </div>
  )} */}
            </label>
            <DropDownButton
              className="w-32"
              value={enableAnnotation}
              listValues={[{ name: "Enable" }, { name: "Disable" }]}
              onChange={(value: any) => onAnnotationChange(value)}
            />
{   (activityDetails?.status === "SUBMITTED_SUCCESS" || activityDetails?.status === "SUBMITTED_FAILED" || activityDetails?.status === "SUBMITTED_WAITING" )   &&           <Text className=" text-primary_text ml-4" type="body">
                Submit Status:
              </Text>}
  {reason !== null && (
  <div
    className={`inline-flex ml-1 items-center gap-2 px-4 py-2 rounded-lg ${
      reason === "Success"
        ? "bg-white-100 text-green-500 border rounded-lg p-4"
        : "bg-white-100 text-yellow-500 border rounded-lg p-4"
    }`}
  >

    <Text type="body">
      {reason === "Success" ? "Success" : "Failed"}
    </Text>
    {reason !== "Success" && reason !== null && (
      <img
        src={iButton}
        title={reason}
        loading="lazy"
        className="cursor-pointer"
      />
    )}
  </div>
)}

{(activityDetails?.status === "SUBMITTED_WAITING") && reason === null && (
  <div className="inline-flex items-center ml-1 gap-2 px-4 py-2 rounded-lg bg-white-100 border text-gray-500">
    <Text type="body">Waiting</Text>
  </div>
)}



          </div>
          {(activityDetails?.status === "IN_PROGRESS" || activityDetails?.status === "SUBMITTED_FAILED") && (
            <div className="inline-flex gap-2 items-center self-center">
              <Text className="text-primary_text" type="body">
                Status:{" "}
              </Text>
              {renderWarning()}
            </div>
          )}
          {activityDetails?.status !== "REJECTED" && (
            <Button
              onClick={() => {
                dispatch.modal.openConfirmation();
                setConfirmationData({
                  title: "Submit Confirmation",
                  content: "Are you sure you want to submit?",
                  type: "submit",
                });
              }}
              className={`${
                loading ||
                hasValidItem() ||
                activityDetails?.status === "SUBMITTED_SUCCESS" ||
                activityDetails?.status === "SUBMITTED_WAITING"||
                activityDetails?.status === "SUBMITTED" 
                  ? "bg-black bg-opacity-30"
                  : "bg-danger"
              } w-15 h-10  p-4 gap-2 rounded-lg`}
              size="custom"
              disabled={
                loading ||
                hasValidItem() ||
                activityDetails?.status === "SUBMITTED_SUCCESS" ||
                activityDetails?.status === "REJECTED" ||
                activityDetails?.status === "SUBMITTED" ||
                activityDetails?.status === "SUBMITTED_WAITING"
              }
            >
              {loading && confirmationData?.type === "submit" ? (
                <div className="flex items-center">
                  <div className="mr-2">Submitting...</div>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                </div>
              ) : (
                <Text type="small" className="inline-flex gap-2">
                  {activityDetails?.status === "SUBMITTED" || activityDetails?.status === "SUBMITTED_SUCCESS"
                    ? "Submitted"
                    : "Submit"}
                  {(activityDetails?.status === "SUBMITTED" || activityDetails?.status === "SUBMITTED_SUCCESS") && (
                    <svg
                      className="w-5 h-5 text-white-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 26 26"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2l4-4m5 5a9 9 0 11-18 0a9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </Text>
              )}
            </Button>

          )}

          {(activityDetails?.status !== "SUBMITTED" && activityDetails?.status !== "SUBMITTED_SUCCESS") && (
            <Button
              disabled={loading || activityDetails?.status === "REJECTED" ||   activityDetails?.status === "SUBMITTED_SUCCESS" || activityDetails?.status === "SUBMITTED_WAITING" || activityDetails?.status === "SUBMITTED" }
              className={`w-15 h-10 p-4 gap-2 rounded-lg ${
                loading ||
                activityDetails?.status === "SUBMITTED_SUCCESS" ||
                activityDetails?.status === "REJECTED" ||
                activityDetails?.status === "SUBMITTED" ||
                activityDetails?.status === "SUBMITTED_WAITING"
                  ? "bg-black bg-opacity-30"
                  : "bg-danger"
              }`}
              onClick={() => {
                dispatch.modal.openConfirmation();
                setConfirmationData({
                  title: "Reject Confirmation",
                  content: "Are you sure you want to reject?",
                  type: "reject",
                });
              }}
            >
              <Text type="small" className="inline-flex gap-2">
                {activityDetails?.status === "REJECTED" ? "Rejected" : "Reject"}
                {activityDetails?.status === "REJECTED" && (
                  <svg
                    className="w-5 h-5 text-white-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 26 26"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2l4-4m5 5a9 9 0 11-18 0a9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </Text>
            </Button>
          )}
        </div>
      </div>
      {/* Left side - PDF Viewer */}
      <div className="flex flex-row pb-36 h-screen ">
        <div className="md:w-3/4 pr-4 pb-2 h-full overflow-y-auto">
          <div className="mt-1">
            {pdfUrl && (
              <Viewer
                fileUrl={pdfUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            )}
          </div>
        </div>

        {/* Right side - Input fields */}
        <div className="md:w-1/3 pl-2 pb-2 h-full overflow-y-auto pr-4" ref={scrollRef}>
          <>
            {fieldData?.length > 0 &&
              fieldData.map((item: any, index: number) => (
                <div className="mb-6 mt-4" key={index}>
                  <Text
                    type="body"
                    className="block text-lg font-medium text-gray-700 flex flex-row gap-3"
                  >
                    {item?.title}
                    {item?.is_valid === false && (
                      <img
                        src={iButton}
                        title={item?.is_valid === false && item?.invalid_reason}
                        loading="lazy"
                        className="cursor-pointer"
                      />
                    )}
                  </Text>
                  <input
                    type={item?.type === "string" ? "text" : "number"}
                    disabled={
                      activityDetails?.status === "SUBMITTED_SUCCESS" ||
                      activityDetails?.status === "REJECTED" ||
                      activityDetails?.status === "SUBMITTED" ||
                      activityDetails?.status === "SUBMITTED_WAITING"
                    }
                    className={`mt-2 block w-full px-4 py-3 border rounded-md shadow-sm text-lg`}
                    style={{
                      borderColor: item?.is_valid ? "#D1D5DB" : "#FCD34D", // Tailwind's gray-300 and yellow-300 colors
                      outline: "none",
                      boxShadow: item?.is_valid
                        ? "0 0 0 1px rgba(209, 213, 219, 0.5)" // slightly bolder gray-300
                        : "0 0 0 1px rgba(252, 211, 77, 0.5)", // slightly bolder yellow-300
                    }}
                    defaultValue={item?.value}
                    onFocus={(e) => {
                      e.target.style.borderColor = item?.is_valid
                        ? "#A7AAB1"
                        : "#E4B106"; // darker shade on focus
                      e.target.style.boxShadow = item?.is_valid
                        ? "0 0 0 1px rgba(167, 170, 177, 0.7)" // slightly darker gray
                        : "0 0 0 1px rgba(228, 177, 6, 0.7)"; // slightly darker yellow
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = item?.is_valid
                        ? "#D1D5DB"
                        : "#FCD34D"; // revert to original
                      e.target.style.boxShadow = item?.is_valid
                        ? "0 0 0 1px rgba(209, 213, 219, 0.5)" // revert to original
                        : "0 0 0 1px rgba(252, 211, 77, 0.5)"; // revert to original
                    }}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                </div>
              ))}
          </>
          {confirmationStatus && (
            <ConfirmationModal
              onSubmit={() => handleSubmit(confirmationData?.type)}
              title={confirmationData?.title}
              content={confirmationData?.content}
            />
          )}
          {toast?.status && toast?.type === "error" && pageError && (
            <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
              <Toast type="error" />
            </div>
          )}
          {toast?.status && toast?.type === "success" && (
            <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
              <Toast
                onClose={() =>
                  (window.location.href = "/ai-studio/tbwes_ocr")
                }
                type="success"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailPage;
