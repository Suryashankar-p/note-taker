import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { GlobalWorkerOptions, version } from "pdfjs-dist";
import Text from "../../components/Text.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { url } from "../../utils/constants.ts";
import Button from "../../components/Button.tsx";
import {
  TransmitterGetChildDocumentUrl,
  TransmitterGetChildActivityDetails,
  TransmitterSentChildMultipartMessage,
  TransmitterGetChildAckData,
  TransmitterGetTagNumberDocumentUrl,
  TransmitterGetTagNumberDetails,
  TransmitterUpdateTagNumberFields
} from "../../services/transmitter_ocr.ts";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import ConfirmationModal from "../../components/Modals/ConfirmationModal.tsx";
import iButton from "../../assets/info.svg";
import Tick from "../../assets/tick.svg";
import DropDownButton from "../../components/DropDownButton.tsx";
import Toast from "../../components/Toast.tsx";
import { capitalizeWords, statusMapper } from "../../utils/functions.ts";

GlobalWorkerOptions.workerSrc = url;

// Define the required fields we want to display
const REQUIRED_FIELDS = ["MODELNUM", "TAGNUM", "LOWERCALIBRATIONRANGE", "UPPERCALIBRATIONRANGE", "CALIBRATIONRANGEUNIT"];

interface Item {
  title: string;
  type: string;
  value: string | null;
  is_valid: boolean;
  invalid_reason: string | null;
}

interface ChildActivityDetailPageProps {
  onBack?: () => void;
}

const ChildActivityDetailPage: React.FC<ChildActivityDetailPageProps> = ({ onBack }) => {
  const location = useLocation();
  const activity = location?.state?.activity;
  const tagData = activity?.tagData;
  const [reason, setReason] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const [enableAnnotation, setEnableAnnotation] = useState<any>({
    name: "Disable",
  });
  const [fieldData, setFieldData] = useState<any[]>([]);
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const toast = useSelector((state: RootState) => state.toast);

  useEffect(() => {
    if (activityDetails && activityDetails?.coordinates?.coordinate?.length > 0) {
      const newCoordinates = activityDetails?.coordinates?.coordinate?.map((item: any) => ({
        coordinates: item.coordinate,
        pageNumber: item.pagenumber,
      }));
      setCoordinates(newCoordinates);
    } else {
      setCoordinates([]);
    }
  }, [activityDetails]);

  useEffect(() => {
    // Always call tag number details API when tag data exists (even for "Unknown")
    if (tagData?.tag_number && activity?.title) {
      getTagDetails(activity?.title, tagData.tag_number);
      getTagDocumentLink(activity?.id, tagData.tag_number);
    } else if (activity?.id) {
      // Only fallback to regular APIs if no tag data exists at all
      getActivityDetails(activity?.id);
      getDocumentLink(activity?.id);
    }
  }, [activity, tagData]);

  useEffect(() => {
    if (!tagData && activity?.id) {
      getack();
    }
  }, [activity, tagData]);

  const getTagDocumentLink = async (activity_id: number, tag_number: string) => {
    try {
      const response = await TransmitterGetTagNumberDocumentUrl(activity_id, tag_number);
      setPdfUrl(response?.link);
    } catch (error) {
      console.error("Error reading tag document link:", error);
    }
  };

  const getTagDetails = async (title: string, tag_number: string) => {
    setLoading(true);
    try {
      const response = await TransmitterGetTagNumberDetails(title, tag_number);
      if (response) {
        setActivityDetails(response);
        setFieldData(response.fields || []);
      }
    } catch (error) {
      console.error("Error fetching tag details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentLink = async (activity_id: number) => {
    try {
      const response = await TransmitterGetChildDocumentUrl(activity_id);
      setPdfUrl(response?.link);
    } catch (error) {
      console.error("Error reading document link:", error);
    }
  };

  const getActivityDetails = async (activity_id: number) => {
    try {
      const response = await TransmitterGetChildActivityDetails(activity_id);
      if (response?.id) {
        setActivityDetails(response);
        setFieldData(response?.data?.field || []);
      } else {
        navigate("/ai-studio/transmitter_ocr", { replace: true });
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
      targetPage.drawRectangle({
        x: box_x,
        y: pdfHeight - box_y - box_height,
        width: box_width,
        height: box_height,
        borderColor: rgb(1, 0, 0),
        borderWidth: 1,
      });
    });
    const pdfBytes = await pdfDoc.save();
    const uint8Array = new Uint8Array(pdfBytes);
    const blob = new Blob([uint8Array], { type: "application/pdf" });
    const newUrl = URL.createObjectURL(blob);
    setPdfUrl(newUrl);
  };

  const getack = async () => {
    try {
      const response = await TransmitterGetChildAckData(activity?.id);
      if (response?.reason) {
        console.log("Response received:", response);
        setReason(response.reason);
      }
      else {
        setReason(null);
      }
    } catch (error) {
      console.error("Error fetching acknowledgment data:", error);
    }
  };

  const pollAckData = async () => {
    const checkAckData = async () => {
      const response = await TransmitterGetChildAckData(activity?.id);
      if (response?.reason) {
        clearInterval(polling);
        clearTimeout(timeout);
        setReason(response.reason);
        getActivityDetails(activity?.id);
      } else {
        console.log("Waiting for response...");
      }
    };

    const polling = setInterval(checkAckData, 10000);
    const timeout = setTimeout(() => {
      clearInterval(polling);
    }, 40000);
  };

  const handleSubmit = async (type: string) => {
    if (type !== "reject") return;

    const updatedType = statusMapper(type)
    try {
      setLoading(true);
      const response = await TransmitterSentChildMultipartMessage(activity?.id, updatedType);
      if (response) {
        setReason(null)
        getActivityDetails(activity?.id)
        getack()
        pollAckData()
        setLoading(false);
        dispatch.toast.openToast({
          status: true,
          message: "Rejected successfully",
          type: "success",
        });
      }
      else {
        dispatch.toast.openToast({
          status: true,
          message: "Failed to reject",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error sending form data:", error);
      dispatch.toast.openToast({
        status: true,
        message: "Failed to reject",
        type: "error",
      });
    }
  };

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [fieldData]);

  const handleInputChange = async (title: string, value: string | number) => {
    scrollPositionRef.current = scrollRef.current?.scrollTop || 0;
    
    // Update the field data immediately for UI responsiveness
    setFieldData((prevFieldData: any) => {
      const updatedFieldData = [...prevFieldData];
      const index = updatedFieldData.findIndex(field => field.title === title);
      if (index !== -1) {
        updatedFieldData[index] = {
          ...updatedFieldData[index],
          value: value,
        };
      }
      return updatedFieldData;
    });

    // Set unsaved changes flag
    setHasUnsavedChanges(true);
    
    // Clear any existing timeout (removed the 4-second timeout)
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const handleInputBlur = async (title: string) => {
    // Trigger API call immediately when user moves out of the field
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Get the current field data and update immediately
    setFieldData((prevFieldData: any) => {
      updateActivityDetails(activity?.id, prevFieldData);
      return prevFieldData;
    });
  };

  const updateActivityDetails = async (activity_id: number, body: any) => {
    // Check if we have valid tag data, otherwise show error and prevent API call
    if (!tagData?.tag_number || tagData.tag_number.trim() === '' || tagData.tag_number === 'Unknown') {
      console.error('❌ Invalid or missing tag number:', tagData?.tag_number);
      dispatch.toast.openToast({
        status: true,
        message: "Valid tag number not found. Cannot update fields.",
        type: "error",
      });
      return;
    }

    // Use the new tag number update API
    const payload = {
      activity_id: activity_id,
      tag_number: tagData.tag_number,
      fields: body.map(field => ({
        title: field.title,
        value: field.value
      }))
    };
    
    console.log('=== BEFORE TAG UPDATE ===');
    console.log('Activity ID:', activity_id);
    console.log('Tag Number:', tagData.tag_number);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await TransmitterUpdateTagNumberFields(payload);
      console.log('=== AFTER TAG UPDATE ===');
      console.log('Response:', response);
      
      if (response) {
        console.log('✅ Tag update API successful');
        
        // Update activity details with the response
        setActivityDetails(prev => ({
          ...prev,
          ...response,
          fields: response.fields || prev.fields,
        }));
        
        // Update field data with the response
        if (response.fields) {
          setFieldData(response.fields);
        }
        
        // Clear unsaved changes flag
        setHasUnsavedChanges(false);
        
        console.log('✅ Tag updated successfully');
        
        // Show success message
        dispatch.toast.openToast({
          status: true,
          message: "Tag data updated successfully",
          type: "success",
        });
      } else {
        console.warn('⚠️ No data in tag update response:', response);
      }
    } catch (err: any) {
      console.error("❌ Error updating tag number fields:", err);
      console.error("Error details:", {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        config: err?.config
      });
      
      dispatch.toast.openToast({
        status: true,
        message: err?.response?.data?.detail || "Failed to update tag data",
        type: "error",
      });
    }
  };

  const hasValidItem = () => {
    if (!fieldData || fieldData.length === 0) return false;
    const requiredFields = fieldData.filter((item: Item) =>
      REQUIRED_FIELDS.includes(item.title)
    );
    return requiredFields.some((item: Item) => !item.is_valid);
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
      if (tagData?.tag_number) {
        getTagDocumentLink(activity?.id, tagData.tag_number);
      } else {
        getDocumentLink(activity?.id);
      }
    }
  };

  const renderWarning = () => {
    const isInvalid = hasValidItem();
    return (
      <div className={`flex bg-white border items-center px-4 py-1.5 rounded-md gap-2 ${isInvalid ? "border-gray-200" : "border-green-200"}`}>
        <img src={isInvalid ? iButton : Tick} alt="status" className="w-4 h-4" />
        <Text type="body" className={`font-bold text-sm flex-grow text-center ${isInvalid ? "text-[#E4B106]" : "text-green-600"}`}>
          {isInvalid ? "Invalid" : "Valid"}
        </Text>
      </div>
    );
  };

  const renderResponseStatus = () => {
    const status = activityDetails?.status;
    const isValid = status === "PASSED";
    const isFailed = status === "FAILED";
    
    // Only show if status is PASSED or FAILED
    if (!isValid && !isFailed) {
      return null;
    }
    
    return (
      <div className={`flex bg-white border items-center px-4 py-1.5 rounded-md gap-2 ${isFailed ? "border-gray-200" : "border-green-200"}`}>
        <img src={isFailed ? iButton : Tick} alt="status" className="w-4 h-4" />
        <Text type="body" className={`font-bold text-sm flex-grow text-center ${isFailed ? "text-[#E4B106]" : "text-green-600"}`}>
          {isFailed ? "Invalid" : "Valid"}
        </Text>
      </div>
    );
  };


  return (
    <div className="flex flex-col py-6 h-full mt-2 gap-3 flex-1 relative">
      <div className="flex px-4 flex-row gap-4">
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2 mb-4">

            <Text
              type="header3"
              title={activityDetails?.title}
              className="text-2xl truncate ellipsis max-w-[400px] font-bold"
            >
              {tagData ? `Tag Number / ${tagData.tag_number}` : activityDetails?.title}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-6 ml-auto">
          {/* Annotation Section */}
          <div className="flex items-center gap-3">
            <Text className="text-[#5E6C84] font-bold text-sm" type="body">
              Annotation:
            </Text>
            <DropDownButton
              className="w-32"
              value={enableAnnotation}
              listValues={[{ name: "Enable" }, { name: "Disable" }]}
              onChange={(value: any) => onAnnotationChange(value)}
            />
          </div>

          {/* Status Section - between Annotation and Reject */}
          <div className="flex items-center gap-4">
            {/* Existing Status Section */}
            {(activityDetails?.status === "IN_PROGRESS" || activityDetails?.status === "SUBMITTED_FAILED" || activityDetails?.status === "SUBMITTED_SUCCESS") && (
              <div className="inline-flex gap-3 items-center">
                <Text className="text-[#5E6C84] font-bold text-sm" type="body">
                  Status:
                </Text>
                {renderWarning()}
              </div>
            )}

            {/* Response Status Section - shows Valid/Invalid based on API response status */}
            {renderResponseStatus() && (
              <div className="inline-flex gap-3 items-center">
                <Text className="text-[#5E6C84] font-bold text-sm" type="body">
                  Status:
                </Text>
                {renderResponseStatus()}
              </div>
            )}
          </div>
          {/* Reject Button Section */}
          <Button
            disabled={loading || activityDetails?.status === "REJECTED"}
            className={`min-w-[100px] h-10 flex justify-center items-center rounded-lg font-bold text-white transition-all ${loading || activityDetails?.status === "REJECTED"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#EF4444] hover:bg-red-600 shadow-sm"
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
            <Text type="body" className="font-bold">
              {activityDetails?.status === "REJECTED" ? "Rejected" : "Reject"}
            </Text>
          </Button>
        </div>

      </div>
      <div className="flex flex-row h-[calc(100vh-140px)] border-t border-gray-200 overflow-hidden">
        <div className="md:w-[70%] pr-4 pb-2 h-full  border-r border-gray-300">
          <div className="mt-1 h-full">
            {pdfUrl ? (
              <Viewer
                fileUrl={pdfUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            ) : (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#172B4D]" />
              </div>
            )}
          </div>
        </div>
        <div className="md:w-[30%] pl-2 pb-2 h-full overflow-y-auto pr-4" ref={scrollRef}>
          <div className="pb-20">
            {fieldData && fieldData.length > 0 ? (
              (tagData ? fieldData : fieldData.filter((item: any) => REQUIRED_FIELDS.includes(item?.title)))
                .sort((a: any, b: any) => {
                  const indexA = REQUIRED_FIELDS.indexOf(a.title);
                  const indexB = REQUIRED_FIELDS.indexOf(b.title);
                  if (indexA === -1 && indexB === -1) return 0;
                  if (indexA === -1) return 1;
                  if (indexB === -1) return -1;
                  return indexA - indexB;
                })
                .map((item: any) => (
                  <div key={item.title} className="mb-6 mt-4">
                    <Text
                      type="body"
                      className="block text-lg font-medium text-gray-700 flex flex-row gap-3"
                    >
                      {item?.title}
                      {item?.is_valid === false && (
                        <img
                          src={iButton}
                          title={item?.invalid_reason}
                          loading="lazy"
                          className="cursor-pointer"
                        />
                      )}
                    </Text>
                    <div className="w-full">
                      <input
                        type={item?.type === "string" ? "text" : "number"}
                        disabled={
                          activityDetails?.status === "SUBMITTED_SUCCESS" ||
                          activityDetails?.status === "REJECTED" ||
                          activityDetails?.status === "SUBMITTED" ||
                          activityDetails?.status === "SUBMITTED_WAITING"
                        }
                        className={`mt-2 block w-full px-4 py-3 border rounded-md shadow-sm text-lg transition-all ${!item?.is_valid ? 'bg-yellow-50' : 'bg-white'} ${
                          activityDetails?.status === "SUBMITTED_SUCCESS" ||
                          activityDetails?.status === "REJECTED" ||
                          activityDetails?.status === "SUBMITTED" ||
                          activityDetails?.status === "SUBMITTED_WAITING"
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-text'
                        }`}
                        style={{
                          borderColor: item?.is_valid ? "#D1D5DB" : "#FCD34D",
                          outline: "none",
                          boxShadow: item?.is_valid
                            ? "0 0 0 1px rgba(209, 213, 219, 0.5)"
                            : "0 0 0 1px rgba(252, 211, 77, 0.5)",
                        }}
                        value={item?.value || ""}
                        onFocus={(e) => {
                          console.log('Input focused:', item.title, 'Current value:', item?.value);
                          e.target.style.borderColor = item?.is_valid
                            ? "#A7AAB1"
                            : "#E4B106";
                          e.target.style.boxShadow = item?.is_valid
                            ? "0 0 0 1px rgba(167, 170, 177, 0.7)"
                            : "0 0 0 1px rgba(228, 177, 6, 0.7)";
                        }}
                        onBlur={(e) => {
                          console.log('Input blurred:', item.title, 'Final value:', e.target.value);
                          e.target.style.borderColor = item?.is_valid
                            ? "#D1D5DB"
                            : "#FCD34D";
                          e.target.style.boxShadow = item?.is_valid
                            ? "0 0 0 1px rgba(209, 213, 219, 0.5)"
                            : "0 0 0 1px rgba(252, 211, 77, 0.5)";
                          // Trigger API call immediately on blur
                          handleInputBlur(item.title);
                        }}
                        onChange={(e) => {
                          console.log('Input changing:', item.title, 'New value:', e.target.value);
                          handleInputChange(item.title, e.target.value);
                        }}
                        placeholder={`Enter ${item.title.toLowerCase()}`}
                      />
                    </div>
                    {!item?.is_valid && item?.invalid_reason && (
                      <div className="mt-1 text-sm text-yellow-600 flex items-start">
                        <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {item?.title === "TAGNUM"
                            ? "Tag Number does not exist in master data"
                            : item.invalid_reason}
                        </span>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-700 mx-auto mb-4" />
                  <Text type="body" className="text-gray-500">Loading fields...</Text>
                </div>
              </div>
            )}
          </div>

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
                  (window.location.href = "/ai-studio/transmitter_ocr")
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

export default ChildActivityDetailPage;