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
import { TransmitterUpdateMasterActivityDetails, TransmitterGetMasterActivityDetails, TransmitterGetMasterDocumentUrl } from "../../services/transmitter_ocr.ts";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import Toast from "../../components/Toast.tsx";

GlobalWorkerOptions.workerSrc = url;

// Component for displaying master data table (NOW EDITABLE)
const MasterDataTable: React.FC<{
  masterData: any[];
  onDataUpdate: (updatedData: any[]) => void;
  disabled: boolean;
}> = ({ masterData, onDataUpdate, disabled }) => {
  if (!masterData || masterData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No master data found
      </div>
    );
  }

  const handleCellChange = (rowIndex: number, field: string, value: string) => {
    const updatedData = [...masterData];
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [field]: value === "" || value === "-" ? null : value
    };
    onDataUpdate(updatedData);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
              S.No
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Tag Number
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Model Number
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Lower Calibration Range
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Upper Calibration Range
            </th>
            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">
              Calibration Range Unit
            </th>
          </tr>
        </thead>
        <tbody>
          {masterData.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-3 text-sm">
                {index + 1}
              </td>
              <td className="border border-gray-200 px-4 py-3 text-sm">
                {disabled ? (
                  <span title={item["Tag number"] || ""}>{item["Tag number"] || "-"}</span>
                ) : (
                  <input
                    type="text"
                    title={item["Tag number"] || ""}
                    defaultValue={item["Tag number"] || ""}
                    onBlur={(e) => handleCellChange(index, "Tag number", e.target.value)}
                    className="w-full focus:outline-none focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                  />
                )}
              </td>
              <td className="border border-gray-200 px-4 py-3 text-sm">
                {disabled ? (
                  <span title={item["Model number"] || ""}>{item["Model number"] || "-"}</span>
                ) : (
                  <input
                    type="text"
                    title={item["Model number"] || ""}
                    defaultValue={item["Model number"] || ""}
                    onBlur={(e) => handleCellChange(index, "Model number", e.target.value)}
                    className="w-full focus:outline-none focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                  />
                )}
              </td>
              <td className="border border-gray-200 px-4 py-3 text-sm">
                {disabled ? (
                  <span title={item["Lower Calibration Range"] !== null ? String(item["Lower Calibration Range"]) : ""}>
                    {item["Lower Calibration Range"] !== null ? item["Lower Calibration Range"] : "-"}
                  </span>
                ) : (
                  <input
                    type="text"
                    title={item["Lower Calibration Range"] !== null ? String(item["Lower Calibration Range"]) : ""}
                    defaultValue={item["Lower Calibration Range"] !== null ? item["Lower Calibration Range"] : ""}
                    onBlur={(e) => handleCellChange(index, "Lower Calibration Range", e.target.value)}
                    className="w-full focus:outline-none focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                  />
                )}
              </td>
              <td className="border border-gray-200 px-4 py-3 text-sm">
                {disabled ? (
                  <span title={item["Upper Calibration Range"] !== null ? String(item["Upper Calibration Range"]) : ""}>
                    {item["Upper Calibration Range"] !== null ? item["Upper Calibration Range"] : "-"}
                  </span>
                ) : (
                  <input
                    type="text"
                    title={item["Upper Calibration Range"] !== null ? String(item["Upper Calibration Range"]) : ""}
                    defaultValue={item["Upper Calibration Range"] !== null ? item["Upper Calibration Range"] : ""}
                    onBlur={(e) => handleCellChange(index, "Upper Calibration Range", e.target.value)}
                    className="w-full focus:outline-none focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                  />
                )}
              </td>
              <td className="border border-gray-200 px-4 py-3 text-sm">
                {disabled ? (
                  <span title={item["Calibration Range Unit"] || ""}>{item["Calibration Range Unit"] || "-"}</span>
                ) : (
                  <input
                    type="text"
                    title={item["Calibration Range Unit"] || ""}
                    defaultValue={item["Calibration Range Unit"] || ""}
                    onBlur={(e) => handleCellChange(index, "Calibration Range Unit", e.target.value)}
                    className="w-full focus:outline-none focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
        <table className="min-w-full border-collapse">
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
                        <span title={cell.content || ""} className="block w-full text-sm">{cell.content || ""}</span>
                      ) : (
                        <input
                          type="text"
                          title={cell.content || ""}
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
        <div key={tableIndex} className="rounded-lg p-4 bg-white shadow-sm">
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
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const [fieldData, setFieldData] = useState<any>([]);
  const [activityDetails, setActivityDetails] = useState<any>();
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const [pageError, setPageError] = useState<boolean>(false);
  const toast = useSelector((state: RootState) => state.toast);
  // Resizable panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(60); // Initial width as percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for editable tables and master data
  const [editableTables, setEditableTables] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [masterData, setMasterData] = useState<any[]>([]);

  // Use useRef for timeout to avoid closure issues
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getActivityDetails(activity?.id);
    getDocumentLink(activity?.id);
  }, []);

  // Initialize editable tables and master data when activity details are loaded
  useEffect(() => {
    console.log("Activity Details:", activityDetails);
    console.log("Activity Data:", activityDetails?.data);

    if (activityDetails?.data?.tables) {
      setEditableTables(activityDetails.data.tables);
    }

    // Check both locations for master_data
    if (activityDetails?.master_data) {
      console.log("Master Data found on activityDetails:", activityDetails.master_data);
      setMasterData(activityDetails.master_data);
    } else if (activityDetails?.data?.master_data) {
      console.log("Master Data found in data:", activityDetails.data.master_data);
      setMasterData(activityDetails.data.master_data);
    } else {
      console.log("No master_data found in response");
      setMasterData([]);
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

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [fieldData]);

  const handleInputChange = async (index: number, value: string | number) => {
    scrollPositionRef.current = scrollRef.current?.scrollTop || 0;

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Update field data immediately in state
    setFieldData((prevFieldData: any) => {
      const updatedFieldData = [...prevFieldData];
      updatedFieldData[index] = {
        ...updatedFieldData[index],
        value: value,
      };
      return updatedFieldData;
    });

    // Debounce the API call
    updateTimeoutRef.current = setTimeout(() => {
      setFieldData((currentFieldData) => {
        updateActivityDetails(activity?.id, { field: currentFieldData });
        return currentFieldData;
      });
    }, 2000);
  };

  // Function to handle cell updates in tables
  const handleCellUpdate = (tableIndex: number, rowIndex: number, colIndex: number, value: string) => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Update tables immediately in state
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

      return newTables;
    });

    // Debounce the API call
    updateTimeoutRef.current = setTimeout(() => {
      setEditableTables((currentTables) => {
        updateActivityDetails(activity?.id, { tables: currentTables });
        return currentTables;
      });
    }, 2000);
  };

  // Function to handle master data updates
  const handleMasterDataUpdate = (updatedMasterData: any[]) => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Update master data immediately in state
    setMasterData(updatedMasterData);

    // Debounce the API call
    updateTimeoutRef.current = setTimeout(() => {
      updateActivityDetails(activity?.id, { master_data: updatedMasterData });
    }, 2000);
  };

  /**
   * Update activity details by calling the PATCH API
   * @param activity_id - The ID of the activity to update
   * @param data - The data to update (can contain field, tables, or master_data)
   */
  const updateActivityDetails = async (activity_id: number, data: any) => {
    setIsSaving(true);

    // Construct payload matching the API schema
    const payload = {
      title: activityDetails?.title || activity?.title,
      data: data.field || data.tables ? data : null, // Only include data if it has field or tables
      master_data: data.master_data || null, // Include master_data separately
      is_extracted: activityDetails?.is_extracted !== undefined ? activityDetails.is_extracted : true
    };

    console.log("Updating activity with payload:", payload);

    try {
      const response = await TransmitterUpdateMasterActivityDetails(activity_id, payload);

      console.log("Update response:", response);

      if (response) {
        // Update local state with the response
        if (response.data) {
          if (response.data.field) {
            setFieldData(response.data.field);
          }
          if (response.data.tables) {
            setEditableTables(response.data.tables);
          }
        }

        // Update master_data if it exists in the response
        if (response.master_data) {
          setMasterData(response.master_data);
        } else if (response.data?.master_data) {
          setMasterData(response.data.master_data);
        }

        // Optionally refresh the full activity details
        // getActivityDetails(activity_id);

        dispatch.toast.openToast({
          status: true,
          message: "Changes saved successfully",
          type: "success",
        });
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

  // Determine if editing should be disabled
  const isEditingDisabled =
    activityDetails?.status === "SUBMITTED" ||
    activityDetails?.status === "SUBMITTED_SUCCESS" ||
    activityDetails?.status === "REJECTED";

  return (
    <div className="flex flex-col py-6 h-full mt-2 gap-3 flex-1 relative">
      <div className="flex px-4 flex-row gap-4">
        <div className="flex flex-col w-full">
          <Text
            type="header3"
            title={activityDetails?.title}
            className="text-2xl truncate max-w-[400px] font-bold mb-4 cursor-default"
          >
            {activityDetails?.title}
          </Text>
        </div>
        <div className="absolute flex gap-8 top-4 items-center right-6">
          <div className="flex bg-yellow-50 border border-yellow-200 rounded-lg p-2 items-center gap-2">
            <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.219-1.458-1.515-2.625l6.28-10.875zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <Text type="small" className="text-yellow-700 font-medium">
              Verify data accuracy before creating child activity.
            </Text>
          </div>

          {isSaving && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <Text type="small">Saving...</Text>
            </div>
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
          {/* Master Data Section - Only Section Displayed */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <Text type="header3" className="text-lg font-medium">
                Master Data {!isEditingDisabled && <span className="text-sm text-gray-500">(Editable)</span>}
              </Text>
              <span className="text-sm text-gray-500">
                {masterData.length} records found
              </span>
            </div>
            {masterData.length > 0 ? (
              <div className="rounded-lg p-4 bg-white shadow-sm">
                <MasterDataTable
                  masterData={masterData}
                  onDataUpdate={handleMasterDataUpdate}
                  disabled={isEditingDisabled}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No master data available
                <div className="text-xs mt-2">
                  Check console for data structure
                </div>
              </div>
            )}
          </div>

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