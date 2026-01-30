import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import Text from "../../components/Text.tsx";
import Input from "../../components/Input.tsx";
import Button from "../../components/Button.tsx";
import DropDownButton from "../../components/DropDownButton.tsx";
import Toast from "../../components/Toast.tsx";
import NoData from "../../assets/no_data.tsx";
// Removed failing SVG imports - using direct public path references instead
import { TransmitterGetTagNumbers } from "../../services/transmitter_ocr.ts";
import { getInitials } from "../../utils/functions.ts";

export type TagNumberStatus = {
  tag_number: string;
  status: "PASSED" | "FAILED";
  pdf_url?: string;
};

export type TagNumberResponse = {
  total: number;
  result: TagNumberStatus[];
  user: {
    user_id: string;
    name: string;
  };
  created_on: string;
};

interface ChildActivityTagsProps {
  activityTitle?: string;
  onBack?: () => void;
}

const ChildActivityTags: React.FC<ChildActivityTagsProps> = ({ activityTitle: propActivityTitle, onBack }) => {
  const { activityTitle: paramActivityTitle } = useParams<{ activityTitle: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const tagListRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

  // Use prop activityTitle if provided, otherwise use URL param
  const activityTitle = propActivityTitle || paramActivityTitle;

  const [tagNumbers, setTagNumbers] = useState<TagNumberStatus[]>([]);
  const [activityUser, setActivityUser] = useState<any>(null);
  const [createdOn, setCreatedOn] = useState<string>("");
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 50 });
  const [tagTotal, setTagTotal] = useState<number>(0);
  const [searchValue, setSearchValue] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<boolean>(false);

  const [statusFilter, setStatusFilter] = useState<{
    value: string;
    name: string;
  }>({ value: "all", name: "All" });

  const [userFilter, setUserFilter] = useState<{
    value: string;
    name: string;
  }>({ value: "all", name: "All" });

  const toastStatus = useSelector((state: RootState) => state.toast);

  let timeoutId: NodeJS.Timeout | null = null;

  const statusOptions = [
    { value: "all", name: "All" },
    { value: "passed", name: "Passed" },
    { value: "failed", name: "Failed" },
  ];

  const userOptions = [
    { value: "all", name: "All" },
    { value: "by me", name: "By me" },
    { value: "by other", name: "By other" },
  ];

  const statusMapper = (status: string): string | undefined => {
    const statusMap: { [key: string]: string } = {
      passed: "PASSED",
      failed: "FAILED",
      all: "ALL",
    };
    return status === "all" ? undefined : statusMap[status.toLowerCase()];
  };

  const userStatusMapper = (userStatus: string): string | undefined => {
    const userStatusMap: { [key: string]: string } = {
      "by me": "BY_ME",
      "by other": "BY_OTHERS",
      all: "ALL",
    };
    return userStatus === "all" ? undefined : userStatusMap[userStatus.toLowerCase()];
  };

  useEffect(() => {
    if (activityTitle) {
      getAllTagNumbers(pageSize.skip, pageSize.limit, "");
    }
  }, [activityTitle]);

  useEffect(() => {
    const handleScroll = () => {
      const { current } = tagListRef;
      if (!current) return;

      const scrollPosition = current.scrollTop;

      if (
        current.scrollHeight - current.scrollTop === current.clientHeight &&
        !isFetching &&
        tagNumbers.length < tagTotal
      ) {
        loadMoreTags(scrollPosition);
      }
    };

    const div = tagListRef.current;
    if (div) {
      div.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (div) {
        div.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isFetching, tagNumbers, tagTotal]);

  const loadMoreTags = async (scrollPosition: number) => {
    setIsFetching(true);
    try {
      const response = await TransmitterGetTagNumbers(
        activityTitle!,
        pageSize.skip + pageSize.limit,
        pageSize.limit,
        searchValue,
        statusMapper(statusFilter.value),
        userStatusMapper(userFilter.value)
      );

      if (response?.result) {
        const newTags = response.result;
        if (newTags && newTags.length > 0) {
          setTagNumbers((prevTags) => [...prevTags, ...newTags]);
          setTagTotal(response.total);
          setPageSize((prevPageSize) => ({
            ...prevPageSize,
            skip: prevPageSize.skip + prevPageSize.limit,
          }));

          tagListRef.current?.scrollTo(0, scrollPosition);
        }
      }
    } catch (err) {
      console.error("Error loading more tags", err);
    } finally {
      setIsFetching(false);
    }
  };

  const getAllTagNumbers = async (
    skip: number,
    limit: number,
    search_term: string,
    status?: string,
    user_status?: string
  ) => {
    setIsLoading(true);
    try {
      const response = await TransmitterGetTagNumbers(
        activityTitle!,
        skip,
        limit,
        search_term,
        status,
        user_status
      );

      if (response?.result) {
        setTagNumbers(response.result);
        setTagTotal(response.total);
        setActivityUser(response.user);
        setCreatedOn(response.created_on);
      } else {
        console.error("Error fetching tag numbers");
      }
    } catch (err) {
      console.error("Error fetching tag numbers", err);
      setPageError(true);
      if (err?.response?.data?.detail) {
        dispatch.toast.openToast({
          status: true,
          message: err?.response?.data?.detail,
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    setSearchValue(searchTerm);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      getAllTagNumbers(
        pageSize.skip,
        pageSize.limit,
        searchTerm,
        statusMapper(statusFilter.value),
        userStatusMapper(userFilter.value)
      );
    }, 500);
  };

  const handleFilter = (type: string, value: any) => {
    if (type === "status") {
      setStatusFilter(value);
      getAllTagNumbers(
        pageSize.skip,
        pageSize.limit,
        searchValue,
        statusMapper(value.value),
        userStatusMapper(userFilter.value)
      );
    } else if (type === "user") {
      setUserFilter(value);
      getAllTagNumbers(
        pageSize.skip,
        pageSize.limit,
        searchValue,
        statusMapper(statusFilter.value),
        userStatusMapper(value.value)
      );
    }
  };

  const handleTagClick = (tag: TagNumberStatus) => {
    if (tag.pdf_url) {
      window.open(tag.pdf_url, "_blank");
    }
  };

  const getStatusColor = (status: string): string => {
    return status === "PASSED"
      ? "border-green-500 text-green-700 bg-green-50"
      : "border-red-500 text-red-700 bg-red-50";
  };

  const handleBack = () => {
    if (onBack) {
      // If onBack callback is provided (from parent component), use it
      onBack();
    } else {
      // Otherwise, use browser navigation
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-1 h-screen">
      {toastStatus.status && pageError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}

      <div className="flex-1 p-6 h-full">
        {/* Header Section */}
        <div className="flex items-center mb-4">
          <Button
            onClick={handleBack}
            custom_type="secondary"
            className="mr-4 p-2 rounded-lg"
            size="custom"
          >
            {/* Fixed: Using public path instead of import */}
            <img src="/assets/back_arrow.svg" alt="back" loading="lazy" className="w-5 h-5" />
          </Button>
          <div className="flex flex-col">
            <Text className="text-2xl font-bold" type="header2">
              Child Activity / {activityTitle}
            </Text>
            {tagNumbers && (
              <Text type="small" className="text-faint_text ml-1">
                {`(${tagNumbers.length} ${
                  tagNumbers.length === 1 ? "Result" : "Results"
                } of ${tagTotal})`}
              </Text>
            )}
          </div>
        </div>

        {/* User Info and Filters */}
        <div className="flex justify-between items-center mb-4">
          {activityUser && (
            <div className="flex items-center">
              <div
                title={activityUser.name}
                className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-medium"
              >
                {getInitials(activityUser.name)}
              </div>
              <div className="ml-3">
                <Text type="body" className="font-semibold">
                  {activityUser.name}
                </Text>
                {createdOn && (
                  <Text type="small" className="text-faint_text">
                    Created on: {new Date(createdOn).toLocaleDateString()}
                  </Text>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-4 items-center">
            <div className="relative flex items-center">
              <Text className="mr-2" type="small">
                Status:
              </Text>
              <DropDownButton
                className="w-36"
                listValues={statusOptions}
                value={statusFilter}
                onChange={(value) => handleFilter("status", value)}
              />
            </div>

            <div className="relative flex items-center">
              <Text className="mr-2" type="small">
                User:
              </Text>
              <DropDownButton
                className="w-36"
                listValues={userOptions}
                value={userFilter}
                onChange={(value) => handleFilter("user", value)}
              />
            </div>

            <Input
              prefixIcon={
                /* Fixed: Using public path instead of import */
                <img src="/assets/search_icon.svg" alt="search" loading="lazy" />
              }
              placeholder="Search tag number"
              fixed_size="large"
              onChange={onSearchChange}
            />
          </div>
        </div>

        {/* Tags List */}
        <div
          ref={tagListRef}
          className="flex-1 mt-4 h-[calc(100vh-280px)] pr-4 overflow-y-auto"
        >
          {isLoading && tagNumbers.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-danger"></div>
            </div>
          ) : tagNumbers.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-2 border-b-2">
                <Text type="body" className="font-semibold text-center">
                  TAG NUMBER
                </Text>
                <Text type="body" className="font-semibold text-center">
                  STATUS
                </Text>
              </div>
              {tagNumbers.map((tag, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleTagClick(tag)}
                >
                  <div className="flex items-center flex-1">
                    <div
                      className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-medium"
                      title={activityUser?.name}
                    >
                      {getInitials(activityUser?.name || "U")}
                    </div>
                    <Text
                      type="body"
                      className="ml-4 font-medium text-center flex-1"
                    >
                      {tag.tag_number}
                    </Text>
                  </div>

                  <div className="flex items-center flex-1 justify-center">
                    <div
                      className={`border-2 rounded-lg px-6 py-2 font-medium ${getStatusColor(
                        tag.status
                      )}`}
                    >
                      {tag.status}
                    </div>
                  </div>

                  <div className="flex-1 flex justify-end">
                    {tag.pdf_url && (
                      <button className="text-gray-600 hover:text-gray-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <NoData />
            </div>
          )}

          {isFetching && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-danger"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildActivityTags;
