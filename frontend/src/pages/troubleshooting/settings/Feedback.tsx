import React, { useEffect, useRef, useState } from "react";
import { IoMdDownload } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";

import SearchIcon from "../../../assets/search_icon.svg";
import dislike from "../../../assets/dislike.svg";
import like from "../../../assets/like.svg";
import NoData from "../../../assets/no_data";
import DownloadFeedbackDetails from "../../../components/Modals/DownloadFeedbackDetails.tsx";
import FeedbackReview from "../../../components/Modals/FeedbackReview";
import Input from "../../../components/Input";
import Text from "../../../components/Text";
import Toast from "../../../components/Toast";
import { Dispatch, RootState } from "../../../redux/store";
import {
  DownloadFeedbackData,
  ReadChatFeedbacks,
  UpdateChatFeedback,
} from "../../../services/troubleshooting";
import { getInitials, statusMapper } from "../../../utils/functions";

type Count = {
  notReviewed: number;
  inReview: number;
  approved: number;
  rejected: number;
  total: number;
};

type TabKey = "notReviewed" | "inReview" | "approved" | "rejected";
type FeedbackByTab = Record<TabKey, any[]>;

const PAGE_SIZE = 20;

const Feedback = () => {
  const dispatch = useDispatch<Dispatch>();
  const member = useSelector((state: RootState) => state.memberRole);
  const troubleshootingMemberDetails =
    member.service === "troubleshooting" ? member?.details : {};
  const feedbackReviewState = useSelector(
    (state: RootState) => state.modal.feedbackReview
  );
  const toastStatus = useSelector((state: RootState) => state.toast);

  const [activeTab, setActiveTab] = useState<TabKey>("notReviewed");
  const [feedbackData, setFeedbackData] = useState<FeedbackByTab>({
    notReviewed: [],
    inReview: [],
    approved: [],
    rejected: [],
  });
  const [count, setCount] = useState<Count>({
    notReviewed: 0,
    inReview: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [defaultFeedback, setDefaultFeedback] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: PAGE_SIZE });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pageError, setPageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Infinite scroll — appends the next page to the active tab on bottom hit.
  useEffect(() => {
    const handleScroll = () => {
      const node = scrollRef.current;
      if (!node || loading) return;
      const { scrollTop, scrollHeight, clientHeight } = node;
      if (scrollTop + clientHeight + 2 >= scrollHeight) {
        setLoading(true);
        setPageSize((prev) => {
          const newSkip = prev.skip + prev.limit;
          loadMore(newSkip, prev.limit);
          return { ...prev, skip: newSkip };
        });
      }
    };
    const node = scrollRef.current;
    if (node) node.addEventListener("scroll", handleScroll);
    return () => {
      if (node) node.removeEventListener("scroll", handleScroll);
    };
  }, [loading, activeTab, searchTerm]);

  const loadMore = async (skip: number, limit: number) => {
    const status = statusMapper(activeTab);
    try {
      const res = await ReadChatFeedbacks(skip, limit, status, searchTerm);
      if (res?.result) {
        setFeedbackData((prev) => ({
          ...prev,
          [activeTab]: [...prev[activeTab], ...res.result],
        }));
      } else if (res?.detail) {
        dispatch.toast.openToast({ status: true, message: res.detail });
      }
    } finally {
      setLoading(false);
    }
  };

  // Refetch from the top on tab/search change.
  useEffect(() => {
    getAllFeedbacks(0, PAGE_SIZE, activeTab, searchTerm);
    setPageSize({ skip: 0, limit: PAGE_SIZE });
  }, [activeTab, searchTerm]);

  const getAllFeedbacks = async (
    skip: number,
    limit: number,
    tab: TabKey,
    search: string
  ) => {
    try {
      const status = statusMapper(tab);
      const res = await ReadChatFeedbacks(skip, limit, status, search);
      if (res?.result) {
        setFeedbackData((prev) => ({ ...prev, [tab]: res.result }));
        setCount({
          notReviewed: res.total_not_reviewed,
          inReview: res.total_in_review,
          approved: res.total_approved,
          rejected: res.total_rejected,
          total: res.total,
        });
        setPageError(false);
      } else {
        setPageError(true);
        if (res?.detail)
          dispatch.toast.openToast({ status: true, message: res.detail });
      }
    } catch {
      setPageError(true);
    }
  };

  // Debounced search — wait until the user pauses typing to avoid a request
  // per keystroke.
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchTerm(value), 500);
  };

  const onClick = (item: any) => {
    setDefaultFeedback(item);
    dispatch.modal.openFeedbackReview("edit");
  };

  const feedBackReviewSubmit = async (data: any) => {
    if (!data) return;
    dispatch.loadingState.startLoading();
    const body = {
      updated_question: data?.updated_question,
      updated_answer: data?.updated_answer,
      status: data?.status,
    };
    try {
      const res = await UpdateChatFeedback(defaultFeedback?.id, body);
      if (res?.id) {
        dispatch.modal.closeFeedbackReview();
        getAllFeedbacks(0, PAGE_SIZE, activeTab, "");
      } else if (res?.detail) {
        dispatch.toast.openToast({ status: true, message: res.detail });
        setPageError(true);
      }
    } finally {
      dispatch.loadingState.endLoading();
    }
  };

  const renderFeedbackItems = (items: any[]) => {
    if (!items?.length) {
      return (
        <div className="flex justify-center h-screen items-center">
          <NoData />
        </div>
      );
    }
    return items.map((item, idx) => (
      <div
        key={idx}
        onClick={() => onClick(item)}
        className="w-full sm:w-[73vw] h-20 rounded-lg shadow-custom self-center item-center flex flex-row border cursor-pointer"
      >
        <div
          title={item?.created_by_user?.name}
          className="w-9 h-9 bg-gray-200 px-4 m-4 rounded-full flex items-center self-center justify-center"
        >
          <span className="text-gray-600">
            {getInitials(item?.created_by_user?.name || "")}
          </span>
        </div>
        <Text
          title={item?.updated_question}
          type="body"
          className="self-center text-primary_text flex-grow overflow-hidden text-ellipsis whitespace-nowrap mr-2"
        >
          {item?.updated_question}
        </Text>
        <div className="self-center mx-4 min-w-10">
          {item?.like === true && <img title="Liked" src={like} />}
          {item?.like === false && <img title="Disliked" src={dislike} />}
        </div>
      </div>
    ));
  };

  // The download endpoint returns an Excel blob; we wrap and trigger a
  // browser download with a date-stamped filename.
  const handleModalSubmit = async (fromDate: string, toDate: string) => {
    try {
      const response: any = await DownloadFeedbackData(fromDate, toDate);
      if (!response) return;

      let filename = "Troubleshooting_Feedback_Data.xlsx";
      if (toDate) {
        const [year, month, day] = toDate.split("-");
        filename = `Troubleshooting_Feedback_Data_${day}_${month}_${year.slice(2)}.xlsx`;
      }
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download Excel:", err);
    }
  };

  const tabs: { key: TabKey; label: string; accent: string }[] = [
    { key: "notReviewed", label: "Not Reviewed", accent: "text-danger" },
    { key: "inReview", label: "In Review", accent: "text-danger" },
    { key: "approved", label: "Approved", accent: "text-primary" },
    { key: "rejected", label: "Rejected", accent: "text-primary" },
  ];

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-hidden">
      {feedbackReviewState.status && (
        <FeedbackReview
          defaultValue={defaultFeedback}
          formSubmit={feedBackReviewSubmit}
        />
      )}
      {toastStatus.status && pageError && (
        <div className="fixed top-15 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}

      <div className="mx-16 mt-1 flex flex-col sm:flex-row sm:justify-between">
        <div className="flex flex-col">
          <Text className="text-[#091E42]" type="header2">
            Feedback
          </Text>
          <Text type="small" className="text-faint_text ml-1">
            {`(${count.total > 1 ? count.total + " Results" : count.total + " Result"})`}
          </Text>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-1 mt-1 sm:mt-0">
          {troubleshootingMemberDetails?.role === "OWNER" && (
            <button
              className="bg-danger rounded-lg p-2 m-2"
              onClick={() => setIsModalOpen(true)}
              title="Download Feedback Data"
            >
              <IoMdDownload className="text-white w-5 h-5" />
            </button>
          )}
          <Input
            onChange={onSearchChange}
            prefixIcon={<img src={SearchIcon} alt="search" loading="lazy" />}
            placeholder="Search"
            fixed_size={"large"}
          />
        </div>
      </div>

      <div className="flex justify-start gap-5 mx-16 pb-12">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`p-2 text-primary_text ${
              activeTab === tab.key ? "border-b-2 border-primary" : ""
            }`}
          >
            <Text
              type="body"
              className={activeTab === tab.key ? tab.accent : ""}
            >
              {tab.label}
              <span className="bg-[#F3F1FF] ml-1 rounded-full px-2 py-1 text-primary_text font-bold">
                {count[tab.key]}
              </span>
            </Text>
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="self-center h-full overflow-y-scroll w-full flex flex-col gap-4 mb-10"
      >
        {renderFeedbackItems(feedbackData[activeTab])}
      </div>

      <DownloadFeedbackDetails
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default Feedback;
