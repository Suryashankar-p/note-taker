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
  TransmitterGetMasterDocumentUrl,
  TransmitterGetMasterActivityDetails,
  TransmitterSentMasterMultipartMessage,
  TransmitterUpdateMasterActivityDetails,
  TransmitterGetMasterAckData,
  TransmitterCheckMasterHasChildActivities
} from "../../services/transmitter_ocr.ts";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import ConfirmationModal from "../../components/Modals/ConfirmationModal.tsx";
import iButton from "../../assets/info.svg";
import Toast from "../../components/Toast.tsx";
import { capitalizeWords, statusMapper } from "../../utils/functions.ts";
GlobalWorkerOptions.workerSrc = url;
// Component for editable table cells
const EditableExtractedTables: React.FC<{ 
  tables: any[]; 
  onCellUpdate: (tableIndex: number, rowIndex: number, colIndex: number, value: string) => void;
  disabled: boolean;
}> = ({ tables, onCellUpdate, disabled }) => {
  if (!tables || tables.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No extracted tables found
      </div>
    );
  }
  const renderTable = (table: any, tableIndex: number) => {
    const { rowCount, columnCount, cells } = table;
    
    // Create a grid to track which cells are already rendered
    const renderedGrid = Array(rowCount).fill(null).map(() => Array(columnCount).fill(false));
    
    // Sort cells by row and column index to ensure proper rendering order
    const sortedCells = [...cells].sort((a, b) => {
      if (a.rowIndex !== b.rowIndex) return a.rowIndex - b.rowIndex;
      return a.columnIndex - b.columnIndex;
    });
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <tbody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, colIndex) => {
                  // Skip if this cell is already covered by a rowspan or colspan
                  if (renderedGrid[rowIndex][colIndex]) {
                    return null;
                  }
                  
                  // Find the cell that corresponds to this position
                  const cell = sortedCells.find(
                    (c: any) => c.rowIndex === rowIndex && c.columnIndex === colIndex
                  );
                  
                  if (!cell) {
                    // Empty cell
                    return (
                      <td
                        key={`${rowIndex}-${colIndex}`}
                        className="border border-gray-200 p-2 text-sm"
                      />
                    );
                  }
                  
                  // Mark cells covered by rowspan and colspan as rendered
                  const rowSpan = cell.rowSpan || 1;
                  const colSpan = cell.columnSpan || 1;
                  
                  for (let r = rowIndex; r < rowIndex + rowSpan; r++) {
                    for (let c = colIndex; c < colIndex + colSpan; c++) {
                      if (r < rowCount && c < columnCount) {
                        renderedGrid[r][c] = true;
                      }
                    }
                  }
                  
                  return (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className="border border-gray-200 p-2 text-sm"
                      rowSpan={rowSpan}
                      colSpan={colSpan}
                    >
                      {disabled ? (
                        <span className="block w-full text-sm">{cell.content || ""}</span>
                      ) : (
                        <input
                          type="text"
                          defaultValue={cell.content || ""}
                          onBlur={(e) => onCellUpdate(tableIndex, rowIndex, colIndex, e.target.value)}
                          className="focus:outline-none w-[-webkit-fill-available]"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  return (
    <div className="space-y-6">
      {tables.map((table, tableIndex) => (
        <div key={tableIndex} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <Text type="header3" className="font-medium">
              Table {tableIndex + 1}
            </Text>
            <span className="text-sm text-gray-500">
              {table.rowCount} rows × {table.columnCount} columns
            </span>
          </div>
          {renderTable(table, tableIndex)}
        </div>
      ))}
    </div>
  );
};
interface Item {
  title: string;
  type: string;
  value: string | null;
  is_valid: boolean;
  invalid_reason: string | null;
}
const MasterActivityDetailPage: React.FC = () => {
  const location = useLocation();
  const activity = location?.state?.activity;
  const [reason, setReason] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
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
  const [pageError, setPageError] = useState<boolean>(false);
  const toast = useSelector((state: RootState) => state.toast);
  
  // Resizable panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(60); // Initial width as percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for editable tables
  const [editableTables, setEditableTables] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  useEffect(() => {
    getActivityDetails(activity?.id);
    getDocumentLink(activity?.id);
  }, []);
  useEffect(() => {
    getack()
  }, []);
  
  // Initialize editable tables when activity details are loaded
  useEffect(() => {
    if (activityDetails?.data?.tables) {
      setEditableTables(activityDetails.data.tables);
    }
  }, [activityDetails]);
  
  // Mouse event handlers for resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const newLeftWidth = ((e.clientX - containerRect.left) / containerWidth) * 100;
    
    // Set boundaries (min 30%, max 70%)
    if (newLeftWidth >= 30 && newLeftWidth <= 70) {
      setLeftPanelWidth(newLeftWidth);
    }
  };
  const handleMouseUp = () => {
    setIsResizing(false);
  };
  // Effect to handle mouse events
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);
  const getDocumentLink = async (activity_id: number) => {
    try {
      const response = await TransmitterGetMasterDocumentUrl(activity_id);
      setPdfUrl(response?.link);
    } catch (error) {
      console.error("Error reading document link:", error);
    }
  };
  const getActivityDetails = async (activity_id: number) => {
    try {
      const response = await TransmitterGetMasterActivityDetails(activity_id);
      if (response?.id) {
        setActivityDetails(response);
        setFieldData(response?.data?.field);
      } else {
        console.log("ere");
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
      const response = await TransmitterGetMasterAckData(activity?.id);
      if (response?.reason) {
        console.log("Response received:", response);
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
      const response = await TransmitterGetMasterAckData(activity?.id);
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
    
    // For master activities, check if there are child activities
    if (activityDetails?.id) {
      try {
        const hasChildActivities = await TransmitterCheckMasterHasChildActivities(activityDetails.id);
        if (hasChildActivities) {
          setPageError(true);
          dispatch.toast.openToast({
            status: true,
            message: "Cant reject this master activity, child activities are present under it",
            type: "error",
          });
          return;
        }
      } catch (error) {
        console.error("Error checking child activities:", error);
        setPageError(true);
        dispatch.toast.openToast({
          status: true,
          message: "Failed to check child activities",
          type: "error",
        });
        return;
      }
    }
    
    // Proceed with rejection if no child activities
    const updatedType = statusMapper(type);    
    try {
      setLoading(true);
      const response = await TransmitterSentMasterMultipartMessage(activityDetails?.id, updatedType);
      if (response) {
        setReason(null);
        getActivityDetails(activityDetails?.id);
        getack();
        pollAckData();
        setLoading(false);
        dispatch.toast.openToast({
          status: true,
          message: "Rejected successfully",
          type: "success",
        });
      } else {
        setPageError(true);
        dispatch.toast.openToast({
          status: true,
          message: "Failed to reject",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error sending form data:", error);
      setPageError(true);
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
        updateActivityDetails(activity?.id, { field: updatedFieldData });
        return updatedFieldData;
      });
    }, 4000);
  };
  
  // Function to handle cell updates in tables
  const handleCellUpdate = (tableIndex: number, rowIndex: number, colIndex: number, value: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setEditableTables((prevTables) => {
      const newTables = [...prevTables];
      const table = { ...newTables[tableIndex] };
      const newCells = [...table.cells];
      
      // Find the cell at the given position and update its content
      const cellIndex = newCells.findIndex(cell => cell.rowIndex === rowIndex && cell.columnIndex === colIndex);
      if (cellIndex !== -1) {
        newCells[cellIndex] = { ...newCells[cellIndex], content: value };
      }
      
      table.cells = newCells;
      newTables[tableIndex] = table;
      
      // Debounce the update to the backend using the updated tables
      timeoutId = setTimeout(() => {
        updateActivityDetails(activity?.id, { tables: newTables });
      }, 4000);
      
      return newTables;
    });
  };
  
  const updateActivityDetails = async (activity_id: number, data: any) => {
    setIsSaving(true);
    let payload = {
      title: activity?.title,
      data: data,
    };
    try {
      const response = await TransmitterUpdateMasterActivityDetails(activity_id, payload);
      if (response?.data) {
        // Update both field data and tables if they exist in the response
        if (response.data.field) {
          setFieldData(response.data.field);
        }
        if (response.data.tables) {
          setEditableTables(response.data.tables);
        }
        getActivityDetails(activity_id);
      }
    } catch (err) {
      console.error("Error updating activity details:", err);
      dispatch.toast.openToast({
        status: true,
        message: "Failed to update activity details",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };
  const hasValidItem = () => {
    return (
      fieldData?.length > 0 && fieldData.some((item: Item) => !item.is_valid)
    );
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
            {(activityDetails?.status === "SUBMITTED_SUCCESS" || activityDetails?.status === "SUBMITTED_FAILED" || activityDetails?.status === "SUBMITTED_WAITING" ) &&          
              <Text className=" text-primary_text" type="body">
                Submit Status:
              </Text>
            }
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
          
          {(activityDetails?.status !== "SUBMITTED" && activityDetails?.status !== "SUBMITTED_SUCCESS") && (
            <Button
              disabled={loading || activityDetails?.status === "REJECTED"}
              className={`w-15 h-10 p-4 gap-2 rounded-lg ${
                loading || activityDetails?.status === "REJECTED"
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
      
      {/* Main content area with PDF viewer and extracted data */}
      <div 
        ref={containerRef}
        className="flex flex-row pb-36 h-screen"
      >
        {/* Left side - PDF Viewer */}
        <div 
          className="pr-4 pb-2 h-full overflow-y-auto"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="mt-1">
            {pdfUrl && (
              <Viewer
                fileUrl={pdfUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            )}
          </div>
        </div>
        
        {/* Resizable divider */}
        <div
          className="w-2 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex items-center justify-center"
          onMouseDown={handleMouseDown}
        >
          <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
        </div>
        
        {/* Right side - Extracted Data */}
        <div 
          className="pl-2 pb-2 h-full overflow-y-auto pr-4"
          style={{ width: `${100 - leftPanelWidth}%` }}
          ref={scrollRef}
        >
          {/* Extracted Tables Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <Text type="header3" className="text-lg font-medium">
                Extracted Data
              </Text>
              {isSaving && (
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="animate-spin h-4 w-4 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Saving...
                </div>
              )}
            </div>
            {editableTables.length > 0 ? (
              <EditableExtractedTables
                tables={editableTables}
                onCellUpdate={handleCellUpdate}
                disabled={
                  activityDetails?.status === "SUBMITTED_SUCCESS" ||
                  activityDetails?.status === "REJECTED" ||
                  activityDetails?.status === "SUBMITTED" ||
                  activityDetails?.status === "SUBMITTED_WAITING"
                }
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No extracted data available
              </div>
            )}
          </div>
          
          {/* Form Fields Section (if needed) */}
          {fieldData?.length > 0 && (
            <div className="mt-8">
              <Text type="header3" className="text-lg font-medium mb-4">
                Editable Fields
              </Text>
              {fieldData.map((item: any, index: number) => (
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
                      borderColor: item?.is_valid ? "#D1D5DB" : "#FCD34D",
                      outline: "none",
                      boxShadow: item?.is_valid
                        ? "0 0 0 1px rgba(209, 213, 219, 0.5)"
                        : "0 0 0 1px rgba(252, 211, 77, 0.5)",
                    }}
                    defaultValue={item?.value}
                    onFocus={(e) => {
                      e.target.style.borderColor = item?.is_valid
                        ? "#A7AAB1"
                        : "#E4B106";
                      e.target.style.boxShadow = item?.is_valid
                        ? "0 0 0 1px rgba(167, 170, 177, 0.7)"
                        : "0 0 0 1px rgba(228, 177, 6, 0.7)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = item?.is_valid
                        ? "#D1D5DB"
                        : "#FCD34D";
                      e.target.style.boxShadow = item?.is_valid
                        ? "0 0 0 1px rgba(209, 213, 219, 0.5)"
                        : "0 0 0 1px rgba(252, 211, 77, 0.5)";
                    }}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
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
export default MasterActivityDetailPage;