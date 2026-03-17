import React, { useEffect, useRef, useState } from "react";
import Text from "../../../components/Text";
import Input from "../../../components/Input";
import SearchIcon from "../../../assets/search_icon.svg";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import NoData from "../../../assets/no_data";
import { getInitials, statusMapper } from "../../../utils/functions";
import FeedbackReview from "../../../components/Modals/FeedbackReview";
import {
  ReadChatFeedbacks,
  UpdateChatFeedback,
  DownloadFeedbackData,
} from "../../../services/cyberbuddy";
import DownloadFeedbackDetails from "../../../components/Modals/DownloadFeedbackDetails.tsx";
import dislike from "../../../assets/dislike.svg";
import like from "../../../assets/like.svg";
import Toast from "../../../components/Toast";
import { IoMdDownload } from "react-icons/io";

type Count = {
  notReviewed: number;
  inReview: number;
  approved: number;
  rejected: number;
  total: number;
};

const Feedback = () => {
  const [activeTab, setActiveTab] = useState("notReviewed");
  const userDetails = JSON.parse(localStorage.getItem("user") || "{}");
  const member = useSelector((state: RootState) => state.memberRole);
  const feedbackReviewState = useSelector(
    (state: RootState) => state.modal.feedbackReview
  );
  const CyberBuddyMemberDetails = member.service === "cyberbuddy" ? member?.details : {};
  const dispatch = useDispatch<Dispatch>();
  let timeoutId: NodeJS.Timeout | null = null;
  const [feedbackData, setFeedbackData] = useState<any>({
    notReviewed: [],
    inReview: [],
    approved: [],
    rejected: [],
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState<Count>({
    notReviewed: 0,
    inReview: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });
  const [defaultFeedback, setDefaultFeedback] = useState<any>();
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 20 });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pageError, setPageError] = useState(false);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight + 2 >= scrollHeight && !loading) {
        setHasReachedEnd(true);
        setLoading(true);
        setPageSize((prevPageSize) => {
          const newSkip = prevPageSize.limit + prevPageSize.skip;
          loadMore(newSkip, prevPageSize.limit);
          return { ...prevPageSize, skip: newSkip };
        });
      } else {
        setHasReachedEnd(false);
      }
    };
    const refCurrent = scrollRef.current;
    if (refCurrent) {
      refCurrent.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, activeTab, searchTerm]);

  const loadMore = async (skip: number, limit: number) => {
    const updatedStatus = statusMapper(activeTab);
    try {
      const feedbackResponse = await ReadChatFeedbacks(
        skip,
        limit,
        updatedStatus,
        searchTerm
      );
      if (feedbackResponse?.result) {
        setFeedbackData((prevData) => ({
          ...prevData,
          [activeTab]: [...prevData[activeTab], ...feedbackResponse.result],
        }));
        setLoading(false);
      } else {
        setPageError(true);
        if (feedbackResponse?.detail)
          dispatch.toast.openToast({
            status: true,
            message: feedbackResponse?.detail,
          });
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  // Fetch feedbacks on mount and when activeTab or searchTerm changes
  useEffect(() => {
    getAllFeedbacks(0, 20, activeTab, searchTerm);
    // Reset pageSize on tab/search change
    setPageSize({ skip: 0, limit: 20 });
  }, [activeTab, searchTerm]);

  const getAllFeedbacks = async (
    skip: number,
    limit: number,
    status: string,
    search_term: string
  ) => {
    try {
      const updatedStatus = statusMapper(status);
      const feedbackResponse = await ReadChatFeedbacks(
        skip,
        limit,
        updatedStatus,
        search_term
      );
      if (feedbackResponse?.result) {
        setFeedbackData((prev) => ({
          ...prev,
          [activeTab]: feedbackResponse?.result,
        }));
        setCount({
          notReviewed: feedbackResponse?.total_not_reviewed,
          inReview: feedbackResponse?.total_in_review,
          approved: feedbackResponse?.total_approved,
          rejected: feedbackResponse?.total_rejected,
          total: feedbackResponse?.total,
        });
        setPageError(false);
      } else {
        setPageError(true);
        if (feedbackResponse?.detail)
          dispatch.toast.openToast({
            status: true,
            message: feedbackResponse?.detail,
          });
      }
    } catch (err) {
      setPageError(true);
    }
  };

  // Debounced search
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 500);
  };

  const onClick = (item: any) => {
    setDefaultFeedback(item);
    dispatch.modal.openFeedbackReview("edit");
  };


  const feedBackReviewSubmit = async (data) => {
    if (data) {
        dispatch.loadingState.startLoading();
        let body = {
            updated_question: data?.updated_question,
            updated_answer: data?.updated_answer,
            status: data?.status,
        };
        try {
            const response = await UpdateChatFeedback(
                defaultFeedback?.id,
                body
            );
        if (response?.id) {
          dispatch.modal.closeFeedbackReview();
          dispatch.loadingState.endLoading();
          getAllFeedbacks(0, 50, activeTab, "");
        } else {
          if (response?.detail)
            dispatch.toast.openToast({
              status: true,
              message: response?.detail,
            });
          dispatch.loadingState.endLoading();
          setPageError(true);
        }
      } catch (err) {
        dispatch.loadingState.endLoading();
      }
    }
  };

  const renderFeedbackItems = (items: any[]) => {
    return items?.length > 0 ? (
      items.map((item, key) => (
        <div
          onClick={() => onClick(item)}
          key={key}
          className="w-full sm:w-[73vw] h-20 rounded-lg shadow-custom self-center item-center flex flex-row border cursor-pointer"
        >
          <div
            title={item?.created_by_user?.name}
            className="w-9 h-9 bg-gray-200 px-4 m-4 rounded-full flex items-center self-center justify-center"
          >
            <span className="text-gray-600">
              {getInitials(item?.created_by_user?.name)}
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
            {item?.like && <img title="Liked" src={like} />}
            {item?.like === false && <img title="Disliked" src={dislike} />}
          </div>
          {/* {(CyberBuddyMemberDetails?.role === 'OWNER' || CyberBuddyMemberDetails?.role === 'REVIEWER') && <button onClick={() => onClick(item)} className='self-center ml-auto mr-10 bg-[#F3F1FF] p-2 rounded-full'>
          <Text className={`font-medium ${activeTab === 'approved' ? 'text-danger' : 'text-[#00875A]'}`}>
            {activeTab === 'rejected' ? 'Approve' : activeTab === 'approved' ? 'Reject' : 'Review'}
          </Text>
        </button>} */}
        </div>
      ))
    ) : (
      <div className="flex justify-center h-screen items-center">
        <NoData />
      </div>
    );
  };

  const handleModalSubmit = async (fromDate: string, toDate: string) => {
    try {
      const response = await DownloadFeedbackData(fromDate, toDate);      

      if (!response)
        return;

      // Generate filename from toDate
      let filename = "CyberBuddy_Feedback_Data.xlsx";
      if (toDate) {
        const [year, month, day] = toDate.split("-");
        filename = `CyberBuddy_Feedback_Data_${day}_${month}_${year.slice(2)}.xlsx`;
      }

      // Create blob from response data and download
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
          <Text type="small" className="text-faint_text ml-1">{`(${
            count?.total > 1
              ? count?.total + " Results"
              : count?.total + " Result"
          })`}</Text>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-1 mt-1 sm:mt-0">
          {CyberBuddyMemberDetails?.role === 'OWNER' && 
            <button
              className="bg-danger rounded-lg p-2 m-2"
              onClick={() => setIsModalOpen(true)}
              title="Download Feedback Data"
            >
              <IoMdDownload className="text-white w-5 h-5" />
            </button>
          }
          <Input
            onChange={onSearchChange}
            prefixIcon={<img src={SearchIcon} alt="search" loading="lazy" />}
            placeholder="Search"
            fixed_size={"large"}
          />
        </div>
      </div>

      <div className="flex justify-start gap-5 mx-16 pb-12">
        <button
          onClick={() => setActiveTab("notReviewed")}
          className={`p-2 text-primary_text ${
            activeTab === "notReviewed" ? "border-b-2 border-primary" : ""
          }`}
        >
          <Text
            type="body"
            className={`${activeTab === "notReviewed" ? "text-danger" : ""}`}
          >
            Not Reviewed
            <span className="bg-[#F3F1FF] ml-1 rounded-full px-2 py-1 text-primary_text font-bold">
              {count["notReviewed"]}
            </span>
          </Text>
        </button>
        <button
          onClick={() => setActiveTab("inReview")}
          className={`p-2 text-primary_text ${
            activeTab === "inReview" ? "border-b-2 border-primary" : ""
          }`}
        >
          <Text
            type="body"
            className={`${activeTab === "inReview" ? "text-danger" : ""}`}
          >
            In Review
            <span className="bg-[#F3F1FF] ml-1 rounded-full px-2 py-1 text-primary_text font-bold">
              {count["inReview"]}
            </span>
          </Text>
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`p-2 text-primary_text ${
            activeTab === "approved" ? "border-b-2 border-primary" : ""
          }`}
        >
          <Text
            type="body"
            className={`${activeTab === "approved" ? "text-primary" : ""}`}
          >
            Approved
            <span className="bg-[#F3F1FF] ml-1 rounded-full px-2 py-1 text-primary_text font-bold">
              {count["approved"]}
            </span>
          </Text>
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`p-2 text-primary_text ${
            activeTab === "rejected" ? "border-b-2 border-primary" : ""
          }`}
        >
          <Text
            type="body"
            className={`${activeTab === "rejected" ? "text-primary" : ""}`}
          >
            Rejected
            <span className="bg-[#F3F1FF] ml-1 rounded-full px-2 py-1 text-primary_text font-bold">
              {count["rejected"]}
            </span>
          </Text>
        </button>
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
