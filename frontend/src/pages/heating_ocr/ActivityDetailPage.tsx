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
  GetProcessCodes,
  GetMakerCodes,
  GetGroupActivityData,  // Add this import
} from "../../services/heating_ocr.ts";
import SearchDropdown from "../../components/Combobox.tsx"; 
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import ConfirmationModal from "../../components/Modals/ConfirmationModal.tsx";
import iButton from "../../assets/info.svg";
import Tick from "../../assets/tick.svg";
import DropDownButton from "../../components/DropDownButton.tsx";
import Toast from "../../components/Toast.tsx";
import { capitalizeWords, heatingOcrStatusMapper } from "../../utils/functions.ts";

GlobalWorkerOptions.workerSrc = url;

interface Item {
  title: string;
  type: string;
  value: string | null;
  is_valid: boolean;
  invalid_reason: string | null;
  confidence: number | null;
  // Set by the backend when it changed a value after extraction, e.g.
  // "chem_correction" when a chemistry value was read from the product
  // column and repointed at the mill column. Absent on untouched fields.
  source?: string | null;
}

const LOW_CONFIDENCE_THRESHOLD = 0.7;

// Backend marker for a chemistry value corrected from the product column to
// the mill column. Such values are plausible but worth a human check.
const CHEM_CORRECTION_SOURCE = "chem_correction";

const ActivityDetailPage: React.FC = () => {
  const location = useLocation();
  const activity = location?.state?.activity;
  const group = location?.state?.group;
  const isGroupView = location?.state?.isGroupView;
  
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  const codeValuesMaker = ["TE_INSP_AGEN", "TE_STEELMAK_CD"];
  const codeValuesProcess = ["TE_HEAT_TREAT", "TE_STEELMAK_PRCS", "TE_DEOXID"];

  // Fields that show a "verify before submitting" warning under the input
  const warningFields = [
    "TE_TENSILE_STRN_UC",
    "TE_BEND_TEST",
    "TE_GAUGE_LNTH",
    "TE_MI_NO",
    "TE_YIELD_STRN_UC",
    "TE_STEELMAK_PRCS",
  ];

  const [makerOptions, setMakerOptions] = useState<any[]>([]);
  const [processOptions, setProcessOptions] = useState<any[]>([]);
  const [makerLoading, setMakerLoading] = useState(false);
  const [processLoading, setProcessLoading] = useState(false);

  const fetchMakerOptions = async (query: string) => {
    setMakerLoading(true);
    try {
      const res = await GetMakerCodes(query);
      setMakerOptions(res || []);
    } finally {
      setMakerLoading(false);
    }
  };

  const fetchProcessOptions = async (query: string) => {
    setProcessLoading(true);
    try {
      const res = await GetProcessCodes(query);
      setProcessOptions(res || []);
    } finally {
      setProcessLoading(false);
    }
  };

  useEffect(() => {
    fetchMakerOptions("");
    fetchProcessOptions("");
  }, []);

  useEffect(() => {
    if (
      activityDetails &&
      activityDetails?.coordinates?.coordinate?.length > 0
    ) {
      const newCoordinates = activityDetails?.coordinates?.coordinate?.map(
        (item: any) => ({
          coordinates: item.coordinate,
          pageNumber: item.pagenumber,
        })
      );
      setCoordinates(newCoordinates);
    } else {
      setCoordinates([]);
    }
  }, [activityDetails]);

  useEffect(() => {
    if (isGroupView && group && activity?.id) {
      // Fetch group-specific data
      getGroupActivityData(activity.id, group);
      getDocumentLink(activity.id);
    } else if (activity?.id) {
      // Fetch regular activity data
      getActivityDetails(activity.id);
      getDocumentLink(activity.id);
    }
  }, [activity?.id, group, isGroupView]);

  const getDocumentLink = async (activity_id: number) => {
    try {
      const response = await GetDocumentUrl(activity_id);
      setPdfUrl(response?.link);
    } catch (error) {
      console.error("Error reading document link:", error);
    }
  };

  // Fetch only activity metadata (without replacing field data) when in group mode
  const getActivityDetailsForMeta = async (activity_id: number) => {
    try {
      const response = await GetOCRActivitiesDetails(activity_id);
      if (response?.id) {
        setActivityDetails(response);
      }
    } catch (error) {
      console.error("Error reading activity details:", error);
    }
  };

  // Fetch group-specific field data
  const getGroupActivityData = async (activity_id: number, groupData: string[]) => {
    try {
      const response = await GetGroupActivityData(activity_id, groupData);
      if (response && Array.isArray(response)) {
        setFieldData(response);
        setActivityDetails({
          ...activity,
          data: { field: response }
        });
      } else {
        console.error("Invalid response format");
        navigate("/ai-studio/heating_ocr", { replace: true });
      }
    } catch (error: any) {
      console.error("Error fetching group data:", error);
      dispatch.toast.openToast({
        status: true,
        message: error?.response?.data?.detail || "Failed to fetch group data",
        type: "error",
      });
    }
  };

  const getActivityDetails = async (activity_id: number) => {
    try {
      const response = await GetOCRActivitiesDetails(activity_id);
      if (response?.id) {
        setActivityDetails(response);
        setFieldData(response?.data?.field);
      } else {
        navigate("/ai-studio/heating_ocr", { replace: true });
      }
    } catch (error) {
      console.error("Error fetching activity details:", error);
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
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    const newUrl = URL.createObjectURL(blob);
    setPdfUrl(newUrl);
  };

  
  


  const handleSubmit = async (type: string) => {
    // Handle the form submission here
    const updatedType = heatingOcrStatusMapper(type)    
    try {
      setLoading(true);
      const response = await SentMultipartMessage(activity?.id, updatedType);
      if (response) {
        setReason(null)
        getActivityDetails(activity?.id)
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

  const handleFieldChange = (index: number, newValue: string) => {
    if (scrollRef.current) {
      scrollPositionRef.current = scrollRef.current.scrollTop;
    }
    const updatedFieldData = [...fieldData];
    updatedFieldData[index] = {
      ...updatedFieldData[index],
      value: newValue,
    };
    setFieldData(updatedFieldData);
  };

  const handleFieldBlur = (index: number) => {
    if (scrollRef.current) {
      scrollPositionRef.current = scrollRef.current.scrollTop;
    }
    updateDocument(activity?.id, { field: fieldData });
  };

  const updateDocument = async (activity_id: number, data: any) => {
    try {
      // Include group in the update payload if in group mode
      const payload = isGroupView 
        ? { title: activityDetails?.title || activity?.title, data, group } 
        : { title: activityDetails?.title || activity?.title, data };
      
      const response = await UpdateOCRActivitiesDetails(activity_id, payload);
      if (response?.id) {
        if (isGroupView && group && response?.data?.field && response?.group) {
          // Find the group index from the PATCH response directly (no extra GET call)
          const groupIndex = response.group.findIndex(
            (g: string[]) => JSON.stringify(g) === JSON.stringify(group)
          );
          if (groupIndex !== -1 && response.data.field[groupIndex]) {
            setFieldData(response.data.field[groupIndex]);
            setActivityDetails(response);
          }
        } else {
          setActivityDetails(response);
          setFieldData(response?.data?.field);
        }
      } else {
        setPageError(true);
        dispatch.toast.openToast({
          status: true,
          message: response?.detail || "Failed to update",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("[DEBUG] PATCH error:", error);
      setPageError(true);
      dispatch.toast.openToast({
        status: true,
        message: error?.response?.data?.detail || "Failed to update",
        type: "error",
      });
    }
  };

  const handleConfirmation = (type: "submit" | "reject") => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dispatch.modal.closeConfirmation();
      if (type === "submit") {
        handleSubmit("submit");
      } else {
        handleSubmit("reject");
      }
    }, 1000);
  };

  const handleBack = () => {
    if (isGroupView) {
      // Go back to groups list - don't submit
      navigate(`/ai-studio/heating_ocr?activity_id=${activity?.id}`, {
        state: { activity },
      });
    } else {
      navigate("/ai-studio/heating_ocr", { replace: true });
    }
  };

  const getDisplayValue = (options: any[], value: string) => {
    const found = options.find(opt => opt.mapping_label === value);
    return found
      ? { value: found.mapping_label, name: found.mapping_value }
      : { value, name: value };
  };

  const renderFieldInput = (item, index) => {
    const disabled =
      activityDetails?.status === "SUBMITTED_SUCCESS" ||
      activityDetails?.status === "REJECTED" ||
      activityDetails?.status === "SUBMITTED" ||
      activityDetails?.status === "SUBMITTED_WAITING";
    const inputClassName = `mt-2 block w-full px-4 py-3 border rounded-md shadow-sm text-lg ${
      item?.is_valid ? "border-gray-300" : "border-yellow-300"
    }`;
    const inputStyle = {
      outline: "none",
      boxShadow: item?.is_valid
        ? "0 0 0 1px rgba(209, 213, 219, 0.5)"
        : "0 0 0 1px rgba(252, 211, 77, 0.5)",
    };

    if (codeValuesMaker.includes(item.title)) {
      return (
        <SearchDropdown
          className={inputClassName}
          listValues={makerOptions.map(opt => ({
            value: opt.mapping_label,
            name: opt.mapping_value
          }))}
          initialValue={getDisplayValue(makerOptions, item.value)}
          onChange={val => {
            handleFieldChange(index, val.value);
            // Dropdown selection is a single action, trigger PATCH immediately
            const updated = [...fieldData];
            updated[index] = { ...updated[index], value: val.value };
            updateDocument(activity?.id, { field: updated });
          }}
          placeholder="Type to search..."
          disabled={disabled}
        />
      );
    }
    if (codeValuesProcess.includes(item.title)) {
      return (
        <SearchDropdown
          className={inputClassName}
          listValues={processOptions.map(opt => ({
            value: opt.mapping_label,
            name: opt.mapping_value
          }))}
          initialValue={getDisplayValue(processOptions, item.value)}
          onChange={val => {
            handleFieldChange(index, val.value);
            // Dropdown selection is a single action, trigger PATCH immediately
            const updated = [...fieldData];
            updated[index] = { ...updated[index], value: val.value };
            updateDocument(activity?.id, { field: updated });
          }}
          placeholder="Type to search..."
          disabled={disabled}
        />
      );
    }
    if (item.title === "TE_TENSILE_STRN_UC") {
      const unitOptions = [
        { value: "0", name: "kg/mm²" },
        { value: "1", name: "N/mm²" },
        { value: "2", name: "ksi" },
        { value: "3", name: "psi" },
      ];
      return (
        <SearchDropdown
          className={inputClassName}
          listValues={unitOptions}
          initialValue={unitOptions.find(o => o.value === item.value)}
          onChange={val => {
            handleFieldChange(index, val.value);
            // Dropdown selection is a single action, trigger PATCH immediately
            const updated = [...fieldData];
            updated[index] = { ...updated[index], value: val.value };
            updateDocument(activity?.id, { field: updated });
          }}
          placeholder="Select unit..."
          disabled={disabled}
        />
      );
    }
    if (item.title === "TE_BEND_TEST") {
      const bendOptions = [
        { value: "OK", name: "OK" },
        { value: "N.A", name: "N.A" },
      ];
      return (
        <SearchDropdown
          className={inputClassName}
          listValues={bendOptions}
          initialValue={bendOptions.find(o => o.value === item.value)}
          onChange={val => {
            handleFieldChange(index, val.value);
            // Dropdown selection is a single action, trigger PATCH immediately
            const updated = [...fieldData];
            updated[index] = { ...updated[index], value: val.value };
            updateDocument(activity?.id, { field: updated });
          }}
          placeholder="Select..."
          disabled={disabled}
        />
      );
    }
    // Default input for other fields
    return (
      <input
        type={item?.type === "string" ? "text" : "number"}
        disabled={disabled}
        className={inputClassName}
        style={inputStyle}
        value={item?.value ?? ""}
        onFocus={e => {
          e.target.style.borderColor = item?.is_valid ? "#A7AAB1" : "#E4B106";
          e.target.style.boxShadow = item?.is_valid
            ? "0 0 0 1px rgba(167, 170, 177, 0.7)"
            : "0 0 0 1px rgba(228, 177, 6, 0.7)";
        }}
        onBlur={e => {
          e.target.style.borderColor = item?.is_valid ? "#D1D5DB" : "#FCD34D";
          e.target.style.boxShadow = item?.is_valid
            ? "0 0 0 1px rgba(209, 213, 219, 0.5)"
            : "0 0 0 1px rgba(252, 211, 77, 0.5)";
          handleFieldBlur(index);
        }}
        onChange={e => handleFieldChange(index, e.target.value)}
      />
    );
  };

  const hasValidItem = () => {
    if (!fieldData || !Array.isArray(fieldData)) return false;
    return fieldData.some((item: Item) => !item.is_valid);
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
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
        )}
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

  // Check if activity is already submitted or rejected
  const isActivityFinalized = () => {
    return activityDetails?.status === "SUBMITTED" || 
           activityDetails?.status === "REJECTED" ||
           activityDetails?.status === "SUBMITTED_SUCCESS" ||
           activityDetails?.status === "SUBMITTED_WAITING" ||
           activityDetails?.status === "SUBMITTED_FAILED";
  };

  // Check if this is a plate/group activity where individual submit/reject should be hidden
  const isPlateActivity = () => {
    return isGroupView || activity?.template === "Plate";
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
          {/* Show group info if in group mode */}
          {isGroupView && group && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
              <span>Heat No: <strong>{group[0]}</strong></span>
              <span>|</span>
              <span>Plate No: <strong>{group[1]}</strong></span>
            </div>
          )}
        </div>
        <div className="absolute flex gap-8 top-4 items-center right-6">
          <div className="inline-flex items-center gap-2">
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
            
            {(activityDetails?.status === "SUBMITTED_SUCCESS" || 
              activityDetails?.status === "SUBMITTED_FAILED" || 
              activityDetails?.status === "SUBMITTED_WAITING") && (
              <Text className=" text-primary_text ml-4" type="body">
                Submit Status:
              </Text>
            )}
            
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

          <div className="flex gap-2">
            {/* Submit Button - Hidden in group view or plate template, disabled if activity finalized */}
            {!isPlateActivity() && !isActivityFinalized() && (
              <Button
                onClick={() => {
                  dispatch.modal.openConfirmation();
                  setConfirmationData({
                    title: "Submit Confirmation",
                    content: "Are you sure you want to submit?",
                    type: "submit",
                  });
                }}
                className={`w-15 h-10 p-4 gap-2 rounded-lg ${
                  loading ||
                  hasValidItem()
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-danger text-white hover:bg-red-700"
                }`}
                size="custom"
                disabled={loading || hasValidItem()}
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
                    {activityDetails?.status === "SUBMITTED" || 
                     activityDetails?.status === "SUBMITTED_SUCCESS"
                      ? "Submitted"
                      : "Submit"}
                    {(activityDetails?.status === "SUBMITTED" || 
                      activityDetails?.status === "SUBMITTED_SUCCESS") && (
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

            {/* Reject Button - Hidden in group view or plate template, disabled if activity finalized */}
            {!isPlateActivity() && !isActivityFinalized() && (
              <Button
                disabled={loading}
                className={`w-15 h-10 p-4 gap-2 rounded-lg ${
                  loading
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
                size="custom"
                onClick={() => {
                  dispatch.modal.openConfirmation();
                  setConfirmationData({
                    title: "Reject Confirmation",
                    content: "Are you sure you want to reject?",
                    type: "reject",
                  });
                }}
              >
                {loading && confirmationData?.type === "reject" ? (
                  <div className="flex items-center">
                    <div className="mr-2">Rejecting...</div>
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
                )}
              </Button>
            )}

            {/* Show disabled state message when activity is finalized */}
            {!isPlateActivity() && isActivityFinalized() && (
              <div className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg">
                <Text type="small">
                  Activity is {activityDetails?.status === "REJECTED" ? "rejected" : "submitted"}
                </Text>
              </div>
            )}

            {/* Show message for plate activities that submit/reject is done from groups page */}
            {isPlateActivity() && (
              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200">
                <Text type="small">
                  Submit/Reject from Groups List
                </Text>
              </div>
            )}
          </div>
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
                    {/* Updated: Conditionally append format hint for TE_SMAK_TCDATE */}
                    {item?.title === "TE_SMAK_TCDATE" ? `${item.title} (DD-MON-YY)` : item?.title}
                    {item?.is_valid === false && (
                      <img
                        src={iButton}
                        title={item?.is_valid === false && item?.invalid_reason}
                        loading="lazy"
                        className="cursor-pointer"
                      />
                    )}
                  </Text>
                  {renderFieldInput(item, index)}
                  {warningFields.includes(item?.title) && (
                    <p className="mt-1 text-xs text-yellow-400">⚠ Always verify {item?.title} result before submitting.</p>
                  )}
                  {typeof item?.confidence === "number" && item.confidence < LOW_CONFIDENCE_THRESHOLD && (
                    <p className="mt-1 text-xs text-orange-500">
                      ⚠ Low OCR confidence ({Math.round(item.confidence * 100)}%) — please verify.
                    </p>
                  )}
                  {item?.source === CHEM_CORRECTION_SOURCE && (
                    <p className="mt-1 text-xs text-orange-500">
                      ⚠ Chemistry read from the product column and corrected to the mill column — please verify.
                    </p>
                  )}
                </div>
              ))}
          </>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmationStatus && (
        <ConfirmationModal
          onSubmit={() => handleConfirmation(confirmationData?.type)}
          title={confirmationData?.title}
          content={confirmationData?.content}
        />
      )}

      {/* Toast Messages */}
      {toast?.status && toast?.type === "error" && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      {toast?.status && toast?.type === "success" && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast
            onClose={() =>
              (window.location.href = "/genaistudio/ai-studio/heating_ocr")
            }
            type="success"
          />
        </div>
      )}
    </div>
  );
};

export default ActivityDetailPage;