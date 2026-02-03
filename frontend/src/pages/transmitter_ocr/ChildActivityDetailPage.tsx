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
  TransmitterUpdateChildActivityDetails,
  TransmitterGetChildAckData,
  TransmitterGetTagNumberDocumentUrl,
  TransmitterGetTagNumberDetails
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
const REQUIRED_FIELDS = ["TAGNUM", "CALIBRATIONRANGEUNIT", "UPPERCALIBRATIONRANGE", "LOWERCALIBRATIONRANGE", "MODELNUM"];

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
  const tagData = activity?.tagData; // Data from ChildActivityTags navigation
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
    if (tagData?.tag_number) {
      getTagDocumentLink(activity?.id, tagData.tag_number);
      getTagDetails(activity?.title, tagData.tag_number);
    } else if (activity?.id) {
      getActivityDetails(activity?.id);
      getDocumentLink(activity?.id);
    }
  }, [activity, tagData]);

  useEffect(() => {
    if (!tagData) {
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
        setFieldData(response?.data?.field);
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
    // Create a regular Uint8Array from the pdfBytes
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
    // Only handle reject now
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
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setFieldData((prevFieldData: any) => {
        const updatedFieldData = [...prevFieldData];
        const index = updatedFieldData.findIndex(field => field.title === title);
        if (index !== -1) {
          updatedFieldData[index] = {
            ...updatedFieldData[index],
            value: value,
          };
        }
        // Return the updated field data
        updateActivityDetails(activity?.id, updatedFieldData);
        return updatedFieldData;
      });
    }, 4000);
  };

  const updateActivityDetails = async (activity_id: number, body: any) => {
    let payload = {
      title: activity?.title,
      master_title: activityDetails?.master_title,
      data: {
        field: body,
      },
    };
    try {
      const response = await TransmitterUpdateChildActivityDetails(activity_id, payload);
      if (response?.data) {
        // Update fieldData with the response data
        setFieldData(response?.data?.field || []);
        // Update activityDetails with the response to maintain consistency
        setActivityDetails(prev => ({
          ...prev,
          data: response?.data,
          // Preserve other properties that shouldn't change
          title: response?.title || prev?.title,
          status: response?.status || prev?.status,
          coordinates: response?.coordinates || prev?.coordinates,
        }));
      }
    } catch (err) {
      console.error("Error updating activity details:", err);
      // Show error message to user
      dispatch.toast.openToast({
        status: true,
        message: "Failed to update activity details",
        type: "error",
      });
    }
  };

  const hasValidItem = () => {
    if (!fieldData || fieldData.length === 0) return false;

    // Only check the required fields
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
    return (
      <div
        title={
          hasValidItem()
            ? "Some of the values are Invalid"
            : "All values are valid"
        }
        className="flex flex-row p-2 gap-1 items-center border cursor-default rounded-lg"
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
          className={`${hasValidItem() ? "text-yellow-400" : "text-green-600"
            } items-center`}
        >
          {hasValidItem() ? "Invalid" : "Valid"}
        </Text>
      </div>
    );
  };

  const getFieldValueByTitle = (title: string) => {
    const field = fieldData.find(f => f.title === title);
    return field ? field.value : "N/A";
  };

  return (
    <div className="flex flex-col py-6 h-full mt-2 gap-3 flex-1 relative">
      <div className="flex px-4 flex-row gap-4">
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-2 mb-4">
            {tagData && (
              <button onClick={onBack} className="mr-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 10H5M5 10L10 15M5 10L10 5" stroke="#172B4D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <Text
              type="header3"
              className="text-2xl font-bold"
            >
              {tagData ? `Tag Number / ${tagData.tag_number}` : activityDetails?.title}
            </Text>
          </div>
        </div>
        <div className="absolute flex gap-8 top-4 items-center right-6">
          <div className="inline-flex items-center gap-2">
            {!tagData && (
              <>
                <label className="inline-flex">
                  <Text className=" text-primary_text" type="body">
                    Annotation:
                  </Text>
                </label>
                <DropDownButton
                  className="w-32"
                  value={enableAnnotation}
                  listValues={[{ name: "Enable" }, { name: "Disable" }]}
                  onChange={(value: any) => onAnnotationChange(value)}
                />
              </>
            )}
            {!tagData && (activityDetails?.status === "SUBMITTED_SUCCESS" || activityDetails?.status === "SUBMITTED_FAILED" || activityDetails?.status === "SUBMITTED_WAITING") &&
              <Text className=" text-primary_text ml-4" type="body">
                Submit Status:
              </Text>
            }
            {!tagData && reason !== null && (
              <div
                className={`inline-flex ml-1 items-center gap-2 px-4 py-2 rounded-lg ${reason === "Success"
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
            {!tagData && (activityDetails?.status === "SUBMITTED_WAITING") && reason === null && (
              <div className="inline-flex items-center ml-1 gap-2 px-4 py-2 rounded-lg bg-white-100 border text-gray-500">
                <Text type="body">Waiting</Text>
              </div>
            )}
          </div>
          {!tagData && (activityDetails?.status === "IN_PROGRESS" || activityDetails?.status === "SUBMITTED_FAILED") && (
            <div className="inline-flex gap-2 items-center self-center">
              <Text className="text-primary_text" type="body">
                Status:{" "}
              </Text>
              {renderWarning()}
            </div>
          )}
          {!tagData && (activityDetails?.status !== "SUBMITTED" && activityDetails?.status !== "SUBMITTED_SUCCESS") && (
            <Button
              disabled={loading || activityDetails?.status === "REJECTED"}
              className={`w-15 h-10 p-4 gap-2 rounded-lg ${loading || activityDetails?.status === "REJECTED"
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
      <div className="flex flex-row pb-36 h-screen">
        <div className="md:w-3/5 pr-4 pb-2 h-full">
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
        <div className="md:w-2/5 pl-2 pb-2 h-full overflow-y-auto pr-4" ref={scrollRef}>
          {tagData ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-[#F8F9FA]">
                <h2 className="text-xl font-bold text-[#172B4D]">
                  Tag Details
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <th className="px-6 py-4 text-xs font-semibold text-[#5E6C84] w-1/2">Tag Number</th>
                      <td className="px-6 py-4 text-sm font-medium text-[#172B4D]">{tagData.tag_number}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <th className="px-6 py-4 text-xs font-semibold text-[#5E6C84]">Status</th>
                      <td className="px-6 py-4 text-sm font-semibold">
                        <span className={`px-2 py-1 rounded text-[10px] px-3 py-1 ${tagData.status === 'PASSED' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                          {tagData.status}
                        </span>
                      </td>
                    </tr>
                    {fieldData.map((field: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <th className="px-6 py-4 text-xs font-semibold text-[#5E6C84]">
                          <div className="flex items-center gap-2">
                            <span className="capitalize">{field.title.toLowerCase().replace(/([A-Z])/g, ' $1').trim()}</span>
                            {field.is_valid === false && (
                              <img
                                src={iButton}
                                title={field.invalid_reason}
                                loading="lazy"
                                className="cursor-pointer w-3 h-3"
                              />
                            )}
                          </div>
                        </th>
                        <td className={`px-6 py-4 text-sm font-medium ${field.is_valid === false ? 'text-danger' : 'text-[#172B4D]'}`}>
                          {field.value || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              {fieldData?.length > 0 && (
                <div className="space-y-6 mt-4">
                  {fieldData
                    .filter((item: any) => REQUIRED_FIELDS.includes(item?.title))
                    .map((item: any) => (
                      <div key={item.title} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <Text
                          type="body"
                          className="block text-sm font-bold text-[#5E6C84] mb-2 flex items-center gap-2"
                        >
                          {item?.title.replace(/([A-Z])/g, ' $1').trim()}
                          {item?.is_valid === false && (
                            <img
                              src={iButton}
                              title={item?.invalid_reason}
                              loading="lazy"
                              className="cursor-pointer w-4 h-4"
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
                          className={`block w-full px-4 py-2 border rounded-md shadow-sm text-base transition-all ${!item?.is_valid ? 'bg-yellow-50 border-yellow-400 focus:ring-yellow-400' : 'bg-white border-gray-300 focus:ring-primary focus:border-primary'
                            }`}
                          defaultValue={item?.value}
                          onChange={(e) => handleInputChange(item.title, e.target.value)}
                        />
                        {!item?.is_valid && item?.invalid_reason && (
                          <div className="mt-2 text-xs text-yellow-600 flex items-start gap-1">
                            <svg className="w-4 h-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{item.invalid_reason}</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
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