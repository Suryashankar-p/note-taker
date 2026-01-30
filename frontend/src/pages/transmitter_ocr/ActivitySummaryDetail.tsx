import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Text from "../../components/Text.tsx";
import Input from "../../components/Input.tsx";
import Button from "../../components/Button.tsx";
import Search from "../../assets/search_icon.svg";
import BackIcon from "../../assets/back_arrow.svg";
import NoData from "../../assets/no_data.tsx";

interface MasterActivity {
  id: number;
  title: string;
  created_on: string;
  user: {
    name: string;
    user_id: string;
  };
}

const ActivitySummaryDetail: React.FC = () => {
  const { masterId } = useParams<{ masterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [masterActivity, setMasterActivity] = useState<MasterActivity | null>(
    location.state?.activity || null
  );

  let timeoutId: NodeJS.Timeout | null = null;

  useEffect(() => {
    // If no activity data in location state, you could fetch it here
    if (!masterActivity && masterId) {
      // TODO: Fetch master activity details by ID if needed
      console.log("Fetch master activity with ID:", masterId);
    }
  }, [masterId, masterActivity]);

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    setSearchValue(searchTerm);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      // TODO: Implement search logic if needed
      console.log("Searching for:", searchTerm);
    }, 500);
  };

  const handleBack = () => {
    navigate("/ai-studio/transmitter_ocr/activity-summary");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export clicked");
  };

  return (
    <div className="flex flex-1 h-screen">
      {/* Main content */}
      <div className="flex-1 p-6 h-full">
        <div className="flex justify-between items-center mt-1.5 mb-4 w-full">
          <div className="flex items-center">
            <Button
              onClick={handleBack}
              custom_type="secondary"
              className="mr-4 p-2 rounded-lg"
              size="custom"
            >
              <img src={BackIcon} alt="back" loading="lazy" className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <Text className="text-2xl font-bold" type="header2">
                Activity Summary / {masterActivity?.title || "Loading..."}
              </Text>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Input
              prefixIcon={<img src={Search} alt="search" loading="lazy" />}
              placeholder="Search"
              fixed_size="large"
              onChange={onSearchChange}
              value={searchValue}
            />

            <Button
              onClick={handleExport}
              custom_type="secondary"
              className="px-6 py-2 rounded-lg border"
              size="custom"
            >
              <Text type="body" className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export
              </Text>
            </Button>

            <Button
              onClick={handleBack}
              custom_type="danger"
              className="bg-danger px-6 py-2 rounded-lg"
              size="custom"
            >
              <Text type="body">Back</Text>
            </Button>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col justify-center items-center h-[calc(100vh-250px)]">
          <NoData />
          <Text type="header3" className="mt-6 text-gray-700 font-semibold text-2xl">
            No Results Found
          </Text>
          <Text type="body" className="mt-2 text-gray-500">
            No child activities found for this master
          </Text>
        </div>
      </div>
    </div>
  );
};

export default ActivitySummaryDetail;