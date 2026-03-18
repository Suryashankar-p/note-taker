import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import Text from "../../components/Text.tsx";
import Input from "../../components/Input.tsx";
import Button from "../../components/Button.tsx";
import Toast from "../../components/Toast.tsx";
import PageLoading from "../../components/PageLoading.tsx";
import NoData from "../../assets/no_data.tsx";

import Search from "../../assets/search_icon.svg";
import Download from "../../assets/export_icon.svg";
import {
  TransmitterGetChildActivityDetails
} from "../../services/transmitter_ocr.ts";
import { getInitials } from "../../utils/functions.ts";
import { exportToCSV } from "../../utils/exportUtils.ts";

export type Item = {
  title: string;
  value: string | null;
  is_valid: boolean;
  invalid_reason: string | null;
};

export type ChildActivityDetail = {
  title: string;
  master_title: string;
  data: {
    field: Item[];
  };
};

type PageData = {
  page_number: number;
  pdf_url: string;
  fields: Item[];
  is_valid: boolean;
};

type BackendResponse = {
  id?: number | string;
  title: string;
  master_title: string;
  created_on?: string;
  user?: {
    name: string;
  };
  data: PageData[];
};

interface ActivitySummaryDetailProps {
  onBack?: () => void;
}

const ActivitySummaryDetail: React.FC<ActivitySummaryDetailProps> = ({ onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const searchParams = new URLSearchParams(location.search);
  const activityIdFromQuery = searchParams.get("summary_detail_id");
  const activityId = activityIdFromQuery || location.state?.activity?.id;
  const listRef = useRef<HTMLDivElement>(null);

  const [activityDetails, setActivityDetails] = useState<BackendResponse | null>(null);
  const [pageDataList, setPageDataList] = useState<PageData[]>([]);
  const [originalPageDataList, setOriginalPageDataList] = useState<PageData[]>([]);
  const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<boolean>(false);

  const toastStatus = useSelector((state: RootState) => state.toast);

  useEffect(() => {
    if (activityId) {
      getActivityDetails();
    }
  }, [activityId]);

  const getActivityDetails = async () => {
    if (!activityId) return;
    setIsLoading(true);
    setPageError(false);
    try {
      const response = await TransmitterGetChildActivityDetails(
        typeof activityId === 'string' ? parseInt(activityId) : activityId
      );

      if (response) {
        setActivityDetails(response);

        // Try to find the data array in common places within the main response
        let dataArray: any[] = [];

        if (response.data?.documents && Array.isArray(response.data.documents)) {
          // Explicitly handle "documents" key as requested
          dataArray = response.data.documents;
        } else if (response.documents && Array.isArray(response.documents)) {
          dataArray = response.documents;
        } else if (Array.isArray(response.data)) {
          // New multi-page format where response.data is an array of PageData
          dataArray = response.data;
        } else if (response.data && Array.isArray(response.data.field)) {
          // Old format where data has a 'field' array (wrapped in a single page)
          dataArray = [{
            page_number: 1,
            pdf_url: "",
            fields: response.data.field,
            is_valid: response.data.field.every((f: any) => f.is_valid !== false)
          }];
        } else if (response.result && Array.isArray(response.result)) {
          // Result-based array format
          dataArray = response.result;
        } else if (response.data && response.data.result && Array.isArray(response.data.result)) {
          dataArray = response.data.result;
        }

        // Map the data to PageData format
        const mappedData: PageData[] = dataArray.map((item, index) => {
          let fields: Item[] = [];
          let pageNumber = item.page_number || index + 1;
          let pdfUrl = item.pdf_url || "";
          let isValid = item.is_valid;

          // Handle different data structures for fields
          if (item.fields && Array.isArray(item.fields)) {
            fields = item.fields;
          } else if (item.field && Array.isArray(item.field)) {
            fields = item.field;
          } else if (Array.isArray(item)) {
            fields = item;
          } else {
            // Try to extract fields from object properties if they look like field items
            const possibleFields = Object.values(item).filter(
              val => val && typeof val === 'object' && 'title' in val && 'value' in val
            ) as Item[];
            if (possibleFields.length > 0) {
              fields = possibleFields;
            }
          }

          // If isValid is not explicitly provided, calculate it from fields
          if (isValid === undefined || isValid === null) {
            isValid = fields.length > 0 ? fields.every((f: Item) => f.is_valid !== false) : true;
          }

          return {
            page_number: pageNumber,
            pdf_url: pdfUrl,
            fields: fields,
            is_valid: isValid
          };
        }).filter(item => item.fields.length > 0); // Filter out empty items

        // Extract unique column titles from all fields across all pages
        const allColumns = new Set<string>();
        mappedData.forEach(page => {
          page.fields.forEach(field => {
            allColumns.add(field.title);
          });
        });

        const columnArray = Array.from(allColumns);

        setDynamicColumns(columnArray);
        setPageDataList(mappedData);
        setOriginalPageDataList(mappedData);
      }
    } catch (err) {
      console.error("Error fetching activity details", err);
      setPageError(true);
      if (dispatch?.toast?.openToast) {
        dispatch.toast.openToast({
          status: true,
          message: "Failed to fetch activity details",
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);

    if (!val.trim()) {
      setPageDataList(originalPageDataList);
      return;
    }

    const filtered = originalPageDataList.map(pageData => ({
      ...pageData,
      fields: Array.isArray(pageData.fields) ? pageData.fields.filter(field =>
        field.title.toLowerCase().includes(val.toLowerCase()) ||
        (field.value?.toLowerCase().includes(val.toLowerCase()))
      ) : []
    })).filter(pageData => pageData.fields.length > 0);

    setPageDataList(filtered);
  };

  // Helper function to get field value by title
  const getFieldValue = (fields: Item[], fieldTitle: string): string => {
    const field = fields.find(f => f.title === fieldTitle);
    return field?.value || "—";
  };

  // Helper function to get field by title
  const getField = (fields: Item[], fieldTitle: string): Item | undefined => {
    return fields.find(f => f.title === fieldTitle);
  };

  // Format column header text
  const formatColumnHeader = (title: string): string => {
    // Map specialized names like TAGNUM -> TAG NUMBER
    if (title.toUpperCase() === "TAGNUM" || title.toUpperCase() === "TAG-NUMBER") return "TAG NUMBER";
    if (title.toUpperCase() === "MODELNUM" || title.toUpperCase() === "MODEL-NUMBER") return "MODEL NUMBER";
    if (title.toUpperCase() === "LOWERCALIBRATIONRANGE" || title.toUpperCase() === "LOWER-CALIBRATION-RANGE") return "LOWER CALIBRATION RANGE";
    if (title.toUpperCase() === "UPPERCALIBRATIONRANGE" || title.toUpperCase() === "UPPER-CALIBRATION-RANGE") return "UPPER CALIBRATION RANGE";
    if (title.toUpperCase() === "CALIBRATIONRANGEUNIT" || title.toUpperCase() === "CALIBRATION-RANGE-UNIT") return "CALIBRATION RANGE UNIT";

    return title
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(/[\s_]+/)
      .map(word => word.toUpperCase())
      .join(' ');
  };

  // Export data to CSV
  const handleExportCSV = () => {
    if (!pageDataList.length) return;

    // Prepare CSV headers
    const headers = [
      "SERIAL NO.",
      ...dynamicColumns.map(col => formatColumnHeader(col)),
      "STATUS",
      "REMARKS"
    ];

    // Prepare CSV data
    const csvData = pageDataList.map((pageData, index) => {
      const row: (string | number)[] = [index + 1];

      // Add dynamic column values
      dynamicColumns.forEach(column => {
        const field = getField(pageData.fields, column);
        row.push(field?.value || "-");
      });

      // Add status
      row.push(pageData.is_valid ? "PASSED" : "FAILED");

      // Add remarks
      const invalidFields = pageData.fields.filter(f => !f.is_valid);
      const remarks = pageData.is_valid
        ? "All fields valid"
        : invalidFields
          .map(f => `${formatColumnHeader(f.title)}: ${f.invalid_reason || "Invalid field"}`)
          .join("; ");
      row.push(remarks);

      return row;
    });

    // Generate filename with master and child titles
    const filename = `${masterTitle}_${childTitle}_${new Date().toISOString().split('T')[0]}.csv`;

    // Export to CSV
    exportToCSV({ headers, data: csvData, filename });
  };

  // Check if we have actual data to display
  const hasData = pageDataList.length > 0;

  const masterTitle = activityDetails?.master_title || "Loading...";
  const childTitle = activityDetails?.title || "...";

  return (
    <div className="flex flex-1 flex-col h-screen overflow-hidden bg-gray-50">
      {toastStatus.status && pageError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}

      <div className="flex flex-col p-6 h-full overflow-hidden bg-white">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 w-full">
          <div className="flex-1">
            <Text className="text-2xl font-bold text-gray-900" type="header2">
              Activity Summary / {masterTitle} / {childTitle}
            </Text>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                prefixIcon={<img src={Search} alt="search" loading="lazy" className="w-4 h-4" />}
                placeholder="Search"
                className="w-64 rounded-full border-gray-300"
                onChange={onSearchChange}
                value={searchValue}
              />
            </div>
            <Button
              className="px-4 py-2 flex flex-row items-center gap-2 justify-start bg-white border border-gray-300 text-black rounded-full transition duration-300 ease-in-out hover:bg-gray-100"
              onClick={handleExportCSV}
              disabled={!pageDataList.length}
            >
              <img src={Download} alt="export" loading="lazy" />
              <Text type="body" className="text-black">Export</Text>
            </Button>
            <Button
              className="px-4 py-2 text-white flex flex-row items-center gap-4 justify-start border-none bg-danger rounded-full transition duration-300 ease-in-out"
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  navigate(-1);
                }
              }}
            >
              <Text type="body">Back</Text>
            </Button>
          </div>
        </div>

        {/* Table Container */}
        <div ref={listRef} className="flex-1 overflow-auto border border-gray-200 rounded-xl shadow-sm bg-white">
          {!hasData && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <NoData />
              <Text type="body" className="mt-4 text-gray-500">
                No data found
              </Text>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#F4F5F7] z-10 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider w-20">
                    SERIAL NO.
                  </th>
                  {dynamicColumns.map((column, idx) => (
                    <th key={idx} className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider whitespace-nowrap">
                      {formatColumnHeader(column)}
                    </th>
                  ))}
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider text-center w-32">
                    STATUS
                  </th>
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider">
                    REMARKS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={dynamicColumns.length + 3} className="py-20 text-center">
                      <PageLoading />
                    </td>
                  </tr>
                ) : (
                  pageDataList.map((pageData, pageIndex) => {

                    const invalidFields = Array.isArray(pageData.fields)
                      ? pageData.fields.filter(f => !f.is_valid)
                      : [];

                    const createdDate = activityDetails?.created_on
                      ? new Date(activityDetails.created_on).toLocaleDateString("en-US")
                      : "";
                    const userName = activityDetails?.user?.name || "System";

                    return (
                      <tr key={pageIndex} className="hover:bg-gray-50 transition-colors align-top border-b border-gray-100 last:border-0">
                        {/* Serial Number */}
                        <td className="px-6 py-4 text-sm text-[#5E6C84] font-medium">
                          {pageIndex + 1}
                        </td>

                        {/* Dynamic Field Columns */}
                        {dynamicColumns.map((column, colIdx) => {
                          const field = getField(pageData.fields, column);
                          const value = field?.value || "—";
                          const isFieldInvalid = field && !field.is_valid;
                          const isTagColumn = column.toUpperCase() === "TAGNUM";

                          if (isTagColumn) {
                            return (
                              <td key={colIdx} className="px-6 py-4 min-w-[200px]">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#DFE1E6] flex items-center justify-center text-[11px] font-bold text-[#42526E]">
                                    {getInitials(userName)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className={`text-sm font-bold text-[#172B4D]`}>
                                      {value}
                                    </span>
                                    <span className="text-[11px] text-[#5E6C84]">
                                      {createdDate}
                                    </span>
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={colIdx}
                              className={`px-6 py-4 text-sm font-medium min-w-[170px] text-[#42526E]`}
                            >
                              <div className="break-words">
                                {value}
                              </div>
                            </td>
                          );
                        })}

                        {/* Status Column */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${pageData.is_valid
                            ? "bg-[#E3FCEF] text-[#006644]"
                            : "bg-[#FFEBEB] text-[#BF2600]"
                            }`}>
                            {pageData.is_valid ? "PASSED" : "FAILED"}
                          </span>
                        </td>

                        {/* Remarks Column */}
                        <td className="px-6 py-4 min-w-[250px]">
                          <ul className="list-disc list-outside ml-4 space-y-0.5">
                            {pageData.is_valid ? (
                              <li className="text-[11px] text-[#42526E] leading-tight marker:text-[#BF2600]">
                                All fields valid
                              </li>
                            ) : (
                              invalidFields.map((f, idx) => (
                                <li key={idx} className="text-[11px] text-[#42526E] leading-tight marker:text-[#BF2600]">
                                  <span className="font-bold uppercase text-[#BF2600]">{formatColumnHeader(f.title)}</span>: {f.invalid_reason || "Invalid field"}
                                </li>
                              ))
                            )}
                          </ul>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitySummaryDetail;