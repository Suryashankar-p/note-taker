// thermax-ai-studio/frontend/src/pages/transmitter_ocr/ActivitySummaryPage.tsx
import React, { useState, useEffect, useRef } from "react";
import Text from "../../components/Text.tsx";
import Button from "../../components/Button.tsx";
import Input from "../../components/Input.tsx";
import Search from "../../assets/search_icon.svg";
import Download from "../../assets/export_icon.svg";
import { useNavigate, useLocation } from "react-router-dom";
import { getBorderColor, getInitials, statusMapper } from "../../utils/functions.ts";
import {
  TransmitterGetMasterActivities,
  TransmitterGetChildActivities,
} from "../../services/transmitter_ocr.ts";
// import iButton from "../../assets/info.svg";
import NoData from "../../assets/no_data.tsx";

interface MasterActivity {
  id: number;
  title: string;
  created_on: string;
  updated_on: string;
  status: string;
  user: {
    id: number;
    name: string;
  };
}

interface ChildActivity {
  id: number;
  title: string;
  created_on: string;
  validation_status: "PASSED" | "FAILED" | "NOT_VALIDATED";
  data: {
    field: Array<{
      title: string;
      value: string;
      is_valid: boolean;
      invalid_reason?: string;
    }>;
  };
  user: {
    id: number;
    name: string;
  };
}

const ActivitySummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [masterActivities, setMasterActivities] = useState<MasterActivity[]>([]);
  const [childActivities, setChildActivities] = useState<ChildActivity[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<MasterActivity | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [childSearchTerm, setChildSearchTerm] = useState<string>("");
  const masterListRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 50 });
  const [isFetching, setIsFetching] = useState(false);
  const [activityTotal, setActivityTotal] = useState<number>(0);

  // Check if we should reset to master view when navigating back to this page
  useEffect(() => {
    // Reset selectedMaster when the component mounts or when the location changes
    setSelectedMaster(null);
  }, [location.key]);

  // Fetch master activities
  useEffect(() => {
    fetchMasterActivities();
  }, [searchTerm]);

  // Fetch child activities when a master is selected or when search term changes
  useEffect(() => {
    if (selectedMaster) {
      fetchChildActivities(selectedMaster.id);
    } else {
      setChildActivities([]);
    }
  }, [selectedMaster, childSearchTerm]);

  const fetchMasterActivities = async (skip = 0, limit = 50) => {
    setLoading(true);
    try {
      const response = await TransmitterGetMasterActivities(
        skip,
        limit,
        searchTerm
      );
      if (response.result) {
        setMasterActivities(response.result);
        setActivityTotal(response.total);
      }
    } catch (error) {
      console.error("Error fetching master activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildActivities = async (masterId: number) => {
    setLoading(true);
    try {
      const response = await TransmitterGetChildActivities(
        0,
        100,
        childSearchTerm,
        "ALL",
        undefined,
        masterId
      );
      if (response.result) {
        setChildActivities(response.result);
      }
    } catch (error) {
      console.error("Error fetching child activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterClick = (activity: MasterActivity) => {
    setSelectedMaster(activity);
    setChildSearchTerm(""); // Reset child search term when selecting a new master
  };

  const handleBackToMasters = () => {
    setSelectedMaster(null);
  };

  const handleActivitySummaryClick = () => {
    setSelectedMaster(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleChildSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChildSearchTerm(e.target.value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getRemarks = (child: ChildActivity): string[] => {
    if (child.validation_status === 'PASSED') {
      return ['All fields valid'];
    }
    if (child.validation_status === 'NOT_VALIDATED') {
      return ['Not validated yet'];
    }
    
    // For FAILED status, get all invalid reasons
    const invalidFields = child.data.field.filter(field => !field.is_valid);
    if (invalidFields.length === 0) {
      return ['Validation failed'];
    }
    
    // Return all invalid reasons as a list
    return invalidFields.map(field => 
      `${field.title}: ${field.invalid_reason || 'Invalid field value'}`
    );
  };

  // Helper function to extract tag number from child activity data
  const getTagNumber = (child: ChildActivity): string => {
    if (!child.data || !child.data.field) {
      return "N/A";
    }
    
    const tagField = child.data.field.find(field => field.title === "TAGNUM");
    return tagField ? tagField.value : "N/A";
  };

  // Helper function to extract model number from child activity data
  const getModelNumber = (child: ChildActivity): string => {
    if (!child.data || !child.data.field) {
      return "N/A";
    }
    
    const modelField = child.data.field.find(field => field.title === "MODELNUM");
    return modelField ? modelField.value : "N/A";
  };

  // Helper function to extract lower calibration range from child activity data
  const getLowerCalibrationRange = (child: ChildActivity): string => {
    if (!child.data || !child.data.field) {
      return "N/A";
    }
    
    const lowerField = child.data.field.find(field => field.title === "LOWERCALIBRATIONRANGE");
    return lowerField ? lowerField.value : "N/A";
  };

  // Helper function to extract upper calibration range from child activity data
  const getUpperCalibrationRange = (child: ChildActivity): string => {
    if (!child.data || !child.data.field) {
      return "N/A";
    }
    
    const upperField = child.data.field.find(field => field.title === "UPPERCALIBRATIONRANGE");
    return upperField ? upperField.value : "N/A";
  };

  // Helper function to extract calibration range unit from child activity data
  const getCalibrationRangeUnit = (child: ChildActivity): string => {
    if (!child.data || !child.data.field) {
      return "N/A";
    }
    
    const unitField = child.data.field.find(field => field.title === "CALIBRATIONRANGEUNIT");
    return unitField ? unitField.value : "N/A";
  };

  // Export child activities data to CSV
  const exportToCSV = () => {
    if (!childActivities.length) return;

    // Prepare CSV headers
    const headers = ["Serial No.", "Tag Number", "Model Number", "Lower Calibration Range", "Upper Calibration Range", "Calibration Range Unit", "Created On", "Status", "Remarks"];
    
    // Prepare CSV data
    const csvData = childActivities.map((child, index) => {
      const tagNumber = getTagNumber(child);
      const modelNumber = getModelNumber(child);
      const lowerCalibrationRange = getLowerCalibrationRange(child);
      const upperCalibrationRange = getUpperCalibrationRange(child);
      const calibrationRangeUnit = getCalibrationRangeUnit(child);
      const createdDate = new Date(child.created_on).toLocaleDateString();
      const remarks = getRemarks(child).join("; ");
      
      return [
        index + 1,
        `"${tagNumber}"`,
        `"${modelNumber}"`,
        `"${lowerCalibrationRange}"`,
        `"${upperCalibrationRange}"`,
        `"${calibrationRangeUnit}"`,
        `"${createdDate}"`,
        `"${child.validation_status}"`,
        `"${remarks}"`
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedMaster?.title || "ChildActivities"}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadMoreActivities = async () => {
    if (isFetching || masterActivities.length >= activityTotal) return;
    
    setIsFetching(true);
    try {
      const newSkip = pageSize.skip + pageSize.limit;
      const response = await TransmitterGetMasterActivities(
        newSkip,
        pageSize.limit,
        searchTerm
      );
      if (response.result) {
        setMasterActivities((prev) => [...prev, ...response.result]);
        setPageSize({ ...pageSize, skip: newSkip });
      }
    } catch (error) {
      console.error("Error loading more activities:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Handle scroll for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!masterListRef.current || selectedMaster) return;
      
      const { scrollTop, scrollHeight, clientHeight } = masterListRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMoreActivities();
      }
    };

    const currentRef = masterListRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isFetching, masterActivities, activityTotal, selectedMaster]);

  return (
    <div className="flex flex-col h-full p-6">
      {selectedMaster ? (
        // Child Activities View
        <div className="flex flex-col h-full">
          {/* Top section with heading, search bar, and export button */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <Text 
                className="text-2xl font-bold cursor-pointer" 
                type="header2"
                onClick={handleActivitySummaryClick}
              >
                Activity Summary / {selectedMaster.title}
              </Text>
            </div>
            <div className="flex flex-row items-end space-y-4">
              <Input
                prefixIcon={<img src={Search} alt="search" loading="lazy" />}
                placeholder="Search"
                value={childSearchTerm}
                onChange={handleChildSearchChange}
                className="w-64"
              />
              <Button
                className="px-4 py-2 my-[0.8vh] mx-3 flex flex-row items-center gap-2 justify-start bg-white border border-gray-300 text-black rounded-full p-2 transition duration-300 ease-in-out hover:bg-gray-100"
                onClick={exportToCSV}
                disabled={childActivities.length === 0}
              >
                <img src={Download} alt="export" loading="lazy" />
                <Text type="body"className="text-black">Export</Text>
              </Button>
              <Button
                className="px-4 py-2 text-white my-[0.8vh] mx-3 flex flex-row items-center gap-4 justify-start border-none bg-danger rounded-full p-2 transition duration-300 ease-in-out"
                onClick={handleBackToMasters}
              >
                <Text type="body">Back</Text>
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: "calc(100vh - 200px)" }}>
            {loading && childActivities.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-danger"></div>
              </div>
            ) : childActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Serial No.
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tag Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Model Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lower Calibration Range
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upper Calibration Range
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calibration Range Unit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {childActivities.map((child, index) => (
                      <tr key={child.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              title={child.user.name}
                              className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium mr-3"
                            >
                              {getInitials(child.user.name)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {/* Display tag number instead of title */}
                                {getTagNumber(child)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(child.created_on).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getModelNumber(child)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getLowerCalibrationRange(child)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getUpperCalibrationRange(child)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getCalibrationRangeUnit(child)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(child.validation_status)}`}>
                            {child.validation_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex flex-col space-y-1 max-h-32 overflow-y-auto pr-2">
                            {getRemarks(child).map((reason, index) => (
                              <div key={index} className="flex items-start">
                                <span className="mr-2 text-red-500">•</span>
                                <Text type="small" className="text-gray-500">
                                  {reason}
                                </Text>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <NoData />
                <Text type="body" className="mt-4">
                  No child activities found for this master
                </Text>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Master Activities View
        <div className="flex flex-col h-full">
          {/* Top section with heading and search bar */}
          <div className="flex justify-between items-center mb-6">
            <Text className="text-2xl font-bold" type="header2">
              Activity Summary
            </Text>
            <Input
              prefixIcon={<img src={Search} alt="search" loading="lazy" />}
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-64"
            />
          </div>
          
          <Text className="text-lg font-semibold mb-3" type="header3">
            Master Activities
          </Text>
          
          <div
            ref={masterListRef}
            className="flex-1 overflow-y-auto pr-2"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {loading && masterActivities.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-danger"></div>
              </div>
            ) : masterActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Master Activity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created On
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {masterActivities.map((activity) => (
                      <tr 
                        key={activity.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleMasterClick(activity)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              title={activity.user.name}
                              className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium mr-3"
                            >
                              {getInitials(activity.user.name)}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(activity.created_on).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <NoData />
                <Text type="body" className="mt-4">
                  No master activities found
                </Text>
              </div>
            )}
            {isFetching && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-danger"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitySummaryPage;