import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import Text from "../../components/Text.tsx";
import Input from "../../components/Input.tsx";
import Button from "../../components/Button.tsx";
import Toast from "../../components/Toast.tsx";
import NoData from "../../assets/no_data.tsx";

import Search from "../../assets/search_icon.svg";
import {
  TransmitterGetChildActivityDetails
} from "../../services/transmitter_ocr.ts";

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
  title: string;
  master_title: string;
  data: PageData[];
};

const ActivitySummaryDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const searchParams = new URLSearchParams(location.search);
  const activityIdFromQuery = searchParams.get("summary_detail_id");
  const activityId = activityIdFromQuery || location.state?.activity?.id;
  const listRef = useRef<HTMLDivElement>(null);

  const [activityDetails, setActivityDetails] = useState<BackendResponse | null>(null);
  const [pageDataList, setPageDataList] = useState<PageData[]>([]);
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

        // Check if response.data is an array of pages (new format)
        if (Array.isArray(response.data)) {
          setPageDataList(response.data);
        }
        // Handle old format where data has a 'field' array
        else if (response.data && Array.isArray(response.data.field)) {
          // Convert old format to new format
          const convertedData: PageData[] = [{
            page_number: 1,
            pdf_url: "",
            fields: response.data.field,
            is_valid: response.data.field.every((f: Item) => f.is_valid)
          }];
          setPageDataList(convertedData);
        }
        // Fallback to empty array
        else {
          setPageDataList([]);
        }
      }
    } catch (err) {
      console.error("Error fetching activity details", err);
      setPageError(true);
      dispatch.toast.showToast({
        message: "Failed to fetch activity details",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (!activityDetails) return;

    // Get the original data array
    let originalData: PageData[] = [];
    if (Array.isArray(activityDetails.data)) {
      originalData = activityDetails.data;
    } else if (activityDetails.data && Array.isArray(activityDetails.data.field)) {
      originalData = [{
        page_number: 1,
        pdf_url: "",
        fields: activityDetails.data.field,
        is_valid: activityDetails.data.field.every((f: Item) => f.is_valid)
      }];
    }

    if (!val.trim()) {
      setPageDataList(originalData);
      return;
    }

    const filtered = originalData.map(pageData => ({
      ...pageData,
      fields: Array.isArray(pageData.fields) ? pageData.fields.filter(field =>
        field.title.toLowerCase().includes(val.toLowerCase()) ||
        (field.value?.toLowerCase().includes(val.toLowerCase()))
      ) : []
    })).filter(pageData => pageData.fields.length > 0);

    setPageDataList(filtered);
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
          <div className="flex flex-col">
            <Text className="text-3xl font-bold text-gray-900" type="header2">
              Activity Summary / {masterTitle} / {childTitle}
            </Text>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                prefixIcon={<img src={Search} alt="search" loading="lazy" className="w-5 h-5" />}
                placeholder="Search"
                className="w-64"
                onChange={onSearchChange}
                value={searchValue}
              />
            </div>
            <Button custom_type="secondary" className="px-6 py-2.5 rounded-lg border border-gray-300 flex items-center gap-2" size="custom">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.66675 6.66667L8.00008 10L11.3334 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <Text type="body" className="font-semibold text-gray-700">Export</Text>
            </Button>
            <Button
              custom_type="primary"
              className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
              size="custom"
              onClick={() => navigate(-1)}
            >
              <Text type="body" className="font-semibold text-white">Back</Text>
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
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider w-16">
                    Serial No
                  </th>
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider">
                    Tag No
                  </th>
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider">
                    Model No
                  </th>
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider">
                    Lower Calibration Range
                  </th>
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider">
                    Upper Calibration Range
                  </th>
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider">
                    Calibration Range Unit
                  </th>
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider text-center w-32">
                    Status
                  </th>
                  <th className="px-6 py-4 font-bold text-[11px] text-[#5E6C84] uppercase tracking-wider w-96">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageDataList.map((pageData, pageIndex) => {
                    const fieldMap = new Map<string, Item>();
                    if (Array.isArray(pageData.fields)) {
                      pageData.fields.forEach(field => {
                        fieldMap.set(field.title, field);
                      });
                    }

                    const invalidFields = Array.isArray(pageData.fields)
                      ? pageData.fields.filter(f => !f.is_valid)
                      : [];

                    return (
                      <tr key={pageIndex} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-[#172B4D] font-bold">
                          {pageData.page_number}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#172B4D]">
                          {fieldMap.get("TAGNUM")?.value || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#172B4D]">
                          {fieldMap.get("MODELNUM")?.value || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#172B4D]">
                          {fieldMap.get("LOWERCALIBRATIONRANGE")?.value || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#172B4D]">
                          {fieldMap.get("UPPERCALIBRATIONRANGE")?.value || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#172B4D]">
                          {fieldMap.get("CALIBRATIONRANGEUNIT")?.value || "—"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${pageData.is_valid
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}>
                            {pageData.is_valid ? "Passed" : "Failed"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {pageData.is_valid ? (
                            <div className="text-xs text-green-600 font-medium">
                              All fields valid
                            </div>
                          ) : (
                            <ul className="list-disc list-inside space-y-1">
                              {invalidFields.map((f, idx) => (
                                <li key={idx} className="text-[11px] text-[#5E6C84] leading-relaxed">
                                  <span className="font-bold text-red-600 uppercase">{f.title}</span>: {f.invalid_reason}
                                </li>
                              ))}
                            </ul>
                          )}
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