import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import Toast from "../../components/Toast.tsx";
import NoData from "../../assets/no_data.tsx";
import Search from "../../assets/search_icon.svg";
import Input from "../../components/Input.tsx";
import Text from "../../components/Text.tsx";
import { TransmitterGetTagNumbers } from "../../services/transmitter_ocr.ts";
import { getInitials, getBorderColor } from "../../utils/functions.ts";
import DropDownButton from "../../components/DropDownButton.tsx";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  onSelectTag?: (tag: TagNumberStatus) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusOptions = [
  { value: "all", name: "All" },
  { value: "passed", name: "Passed" },
  { value: "failed", name: "Failed" },
];

const statusMapper = (status: string): string | undefined => {
  const map: Record<string, string> = { passed: "PASSED", failed: "FAILED" };
  return status === "all" ? undefined : map[status];
};

// ─── Component ────────────────────────────────────────────────────────────────

const ChildActivityTags: React.FC<ChildActivityTagsProps> = ({
  activityTitle: propActivityTitle,
  onSelectTag,
}) => {
  const { activityTitle: paramActivityTitle } = useParams<{ activityTitle: string }>();
  const dispatch = useDispatch<Dispatch>();
  const tagListRef = useRef<HTMLDivElement>(null);

  const activityTitle = propActivityTitle || paramActivityTitle;

  // ── State ───────────────────────────────────────────────────────────────────
  const [tagNumbers, setTagNumbers] = useState<TagNumberStatus[]>([]);
  const [activityUser, setActivityUser] = useState<any>(null);
  const [createdOn, setCreatedOn] = useState<string>("");
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 50 });
  const [tagTotal, setTagTotal] = useState<number>(0);
  const [searchValue, setSearchValue] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState({ value: "all", name: "All" });

  const toastStatus = useSelector((state: RootState) => state.toast);
  let timeoutId: NodeJS.Timeout | null = null;

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (activityTitle) {
      getAllTagNumbers(0, pageSize.limit, "");
    }
  }, [activityTitle]);

  // ── Infinite scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const { current } = tagListRef;
      if (!current) return;
      if (
        current.scrollHeight - current.scrollTop === current.clientHeight &&
        !isFetching &&
        tagNumbers.length < tagTotal
      ) {
        loadMoreTags(current.scrollTop);
      }
    };
    const div = tagListRef.current;
    if (div) div.addEventListener("scroll", handleScroll);
    return () => {
      if (div) div.removeEventListener("scroll", handleScroll);
    };
  }, [isFetching, tagNumbers, tagTotal]);

  // ── API calls ───────────────────────────────────────────────────────────────
  const loadMoreTags = async (scrollPosition: number) => {
    setIsFetching(true);
    try {
      const response = await TransmitterGetTagNumbers(
        activityTitle!,
        pageSize.skip + pageSize.limit,
        pageSize.limit,
        searchValue,
        statusMapper(statusFilter.value)
      );
      if (response?.result?.length) {
        setTagNumbers((prev) => [...prev, ...response.result]);
        setTagTotal(response.total);
        setPageSize((prev) => ({ ...prev, skip: prev.skip + prev.limit }));
        tagListRef.current?.scrollTo(0, scrollPosition);
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
    status?: string
  ) => {
    setIsLoading(true);
    try {
      const response = await TransmitterGetTagNumbers(
        activityTitle!,
        skip,
        limit,
        search_term,
        status
      );
      if (response?.result) {
        setTagNumbers(response.result);
        setTagTotal(response.total);
        setActivityUser(response.user);
        setCreatedOn(response.created_on);
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

  // ── Handlers ────────────────────────────────────────────────────────────────
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchValue(searchTerm);
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      getAllTagNumbers(0, pageSize.limit, searchTerm, statusMapper(statusFilter.value));
    }, 500);
  };

  const handleStatusChange = (value: any) => {
    setStatusFilter(value);
    getAllTagNumbers(0, pageSize.limit, searchValue, statusMapper(value.value));
  };

  const handleTagClick = (tag: TagNumberStatus) => {
    if (onSelectTag) {
      onSelectTag(tag);
    } else if (tag.pdf_url) {
      window.open(tag.pdf_url, "_blank");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 h-screen">
      {/* Toast */}
      {toastStatus.status && pageError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}

      <div className="flex-1 p-6 h-full">
        {/* Header row */}
        <div className="flex justify-between items-center mt-1.5 mb-4 w-full">
          <div className="flex flex-col">
            <div className="flex items-center">
              <Text className="text-2xl -mt-1 font-bold" type="header2">
                Child Activity / {activityTitle}
              </Text>
            </div>
            {tagNumbers && (
              <Text type="small" className="text-faint_text ml-1">
                {`(${tagNumbers.length > 1 ? tagNumbers.length + " Results" : tagNumbers.length + " Result"} of ${tagTotal})`}
              </Text>
            )}
          </div>

          <div className="items-center space-y-2">
            <div className="flex justify-end space-x-6 pr-2">
              {/* Status filter */}
              <div className="relative flex items-center">
                <Text className="mr-2" type="small">Status:</Text>
                <DropDownButton
                  className="w-36"
                  listValues={statusOptions}
                  value={statusFilter}
                  onChange={handleStatusChange}
                />
              </div>
            </div>

            {/* Search */}
            <div className="pt-4">
              <Input
                prefixIcon={<img src={Search} alt="search" loading="lazy" />}
                placeholder="Search"
                fixed_size="large"
                onChange={onSearchChange}
              />
            </div>
          </div>
        </div>

        {/* ── Tag list ───────────────────────────────────────────────────── */}
        <div ref={tagListRef} className="flex-1 mt-4 h-[calc(100vh-230px)] pr-4 overflow-y-auto">
          {isLoading && tagNumbers.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-danger" />
            </div>
          ) : tagNumbers.length > 0 ? (
            tagNumbers.map((tag: any, index: number) => (
              <div className="mt-5" key={index}>
                <div
                  className="border main_card p-4 flex justify-between items-center mb-4 rounded-lg shadow-lg cursor-pointer transition-opacity duration-300"
                  onClick={() => handleTagClick(tag)}
                >
                  {/* Avatar + text */}
                  <div className="flex items-center">
                    <div
                      title={activityUser?.name}
                      className="w-9 h-9 rounded-full flex items-center justify-center font-small bg-gray-300"
                    >
                      {getInitials(activityUser?.name || "RK")}
                    </div>
                    <div className="flex flex-col ml-4">
                      <Text
                        type="header3"
                        title={tag.tag_number}
                        className="truncate title_text max-w-2xl ellipsis"
                      >
                        {tag.tag_number}
                      </Text>
                      {createdOn && (
                        <Text className="max-w-full font-small text-[12px] text-[#505F79]">
                          Created on: {new Date(createdOn).toLocaleDateString()}
                        </Text>
                      )}
                    </div>
                  </div>

                  <div />

                  {/* Status badge + view icon */}
                  <div className="flex items-center relative">
                    <Text
                      type="body"
                      className={`border rounded-lg w-28 text-center h-10 px-3 py-2 text-sm text-primary_text ${getBorderColor(tag.status)} absolute right-14`}
                    >
                      {tag.status === "PASSED"
                        ? "Passed"
                        : tag.status === "FAILED"
                        ? "Failed"
                        : tag.status}
                    </Text>

                    {/* Eye Icon */}
                    <div className="right-0">
                      <button
                        className="text-black hover:opacity-60 transition-opacity p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagClick(tag);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center item-center">
              <NoData />
            </div>
          )}

          {isFetching && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-danger" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildActivityTags;
