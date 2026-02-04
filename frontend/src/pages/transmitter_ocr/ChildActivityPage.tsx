import React, { useState, useEffect, useRef, useCallback } from "react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { GlobalWorkerOptions, version } from "pdfjs-dist";
import Menu from "../../assets/more.svg";
import Edit from "../../assets/edit.svg";
import Trash from "../../assets/trash.svg";
import Search from "../../assets/search_icon.svg";
import Input from "../../components/Input.tsx";
import Text from "../../components/Text.tsx";
import Button from "../../components/Button.tsx";
import AddIcon from "../../assets/circle_plus.svg";
import Tranfer from "../../assets/exchange.svg";
import {
  getBorderColor,
  getInitials,
  statusMapper,
  userStatusMapper,
} from "../../utils/functions.ts";
import CreateChildActivity from "../../components/Modals/CreateChildActivity.tsx";
import { Member, url } from "../../utils/constants.ts";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import {
  TransmitterCreateChildActivity,
  TransmitterDeleteChildActivity,
  TransmitterGetChildActivities,
  TransmitterGetChildActivityStatus, // <-- NEW: add this export in your service file
  TransmitterGetMasterActivities,
  TransmitterReadOCRMembers,
  TransmitterTransferChildActivity,
  TransmitterUpdateChildActivityDetails,
} from "../../services/transmitter_ocr.ts";
import DropDownButton from "../../components/DropDownButton.tsx";
import DropDownMenu from "../../components/DropdownMenu.tsx";
import ConfirmationModal from "../../components/Modals/ConfirmationModal.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import NoData from "../../assets/no_data.tsx";
import Toast from "../../components/Toast.tsx";
import TranferActivityModal from "../../components/Modals/TranferActivityModal.tsx";
import { getOCRRole } from "./Member.tsx";

GlobalWorkerOptions.workerSrc = url;

// ---------------------------------------------------------------------------
// Type — added is_extracted flag that the backend returns
// ---------------------------------------------------------------------------
export type Activity = {
  id: number;
  title: string;
  createdOn?: string;
  updatedOn?: string;
  created_on: string; // Used in render
  updated_on: string;
  status: string;
  username: string;
  fileUrl: string;
  user_id: string;
  master_title: string;
  master_id: number;
  is_extracted: boolean;
  user?: {
    name: string;
    email: string;
    id: string;
  };
};

interface ChildActivityPageProps {
  onSelectActivity: (activity: Activity) => void;
}

// ---------------------------------------------------------------------------
// Helper: is the card still waiting for OCR extraction?
// ---------------------------------------------------------------------------
const isExtracting = (activity: Activity): boolean =>
  activity.status === "IN_PROGRESS" && activity.is_extracted === false;

// ---------------------------------------------------------------------------
// Menu item sets (unchanged)
// ---------------------------------------------------------------------------
const MenuItems = [
  { title: "Edit", component: <img src={Edit} alt="edit" loading="lazy" /> },
  { title: "Delete", component: <img src={Trash} alt="trash" loading="lazy" /> },
  { title: "Tranfer", component: <img src={Tranfer} alt="Tranfer" loading="lazy" /> },
];
const MenuItemsWithoutEdit = [
  { title: "Delete", component: <img src={Trash} alt="trash" loading="lazy" /> },
  { title: "Tranfer", component: <img src={Tranfer} alt="Tranfer" loading="lazy" /> },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ChildActivityPage: React.FC<ChildActivityPageProps> = ({ onSelectActivity }) => {
  // ── URL params ───────────────────────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const check = searchParams.get("activity_id");

  // ── Refs ─────────────────────────────────────────────────────────────────
  const activityListRef = useRef<HTMLDivElement>(null);

  // ── Polling refs (never trigger a re-render) ────────────────────────────
  // Set of activity IDs currently being polled
  const pollingIdsRef = useRef<Set<number>>(new Set());
  // Map of intervalId per activity id so we can clear individually
  const pollTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // ── Filters ──────────────────────────────────────────────────────────────
  const [usernameFilter, setUsernameFilter] = useState<{ value: string; name: string }>({ value: "all", name: "All" });
  const [statusFilter, setStatusFilter] = useState<{ value: string; name: string }>({ value: "all", name: "All" });
  const [masterFilter, setMasterFilter] = useState<{ value: string; name: string }>({ value: "all", name: "All" });

  // ── Modal / list state ───────────────────────────────────────────────────
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [masterActivities, setMasterActivities] = useState<any[]>([]);
  const [masterSheetsForModal, setMasterSheetsForModal] = useState<Array<{ id: string; name: string }>>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [user, setUser] = useState<any>(null);

  // ── Redux ────────────────────────────────────────────────────────────────
  const member = useSelector((state: RootState) => state.memberRole);
  const ocrMemberDetails = member.service === "transmitter_ocr" ? member?.details : {};
  const dispatch = useDispatch<Dispatch>();
  const toastStatus = useSelector((state: RootState) => state.toast);
  const tranferModal = useSelector((state: RootState) => state.modal.tranferModal);
  const confirmationStatus = useSelector((state: RootState) => state.modal.confirmation);

  // ── Pagination / search ──────────────────────────────────────────────────
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 50 });
  const [activityTotal, setActivityTotal] = useState<number>(0);
  const [searchValue, setSearchValue] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  // ── Misc ─────────────────────────────────────────────────────────────────
  const [defaultActivity, setDefaultActivity] = useState<any>();
  const [pageError, setPageError] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [filter, setFilter] = useState<{ user: string; status: string; master: string }>({
    user: "All", status: "All", master: "All",
  });

  let timeoutId: NodeJS.Timeout | null = null;

  const userOptions = [
    { value: "all", name: "All" },
    { value: "by me", name: "By me" },
    { value: "by other", name: "By other" },
  ];
  const statusOptions = [
    { value: "all", name: "All" },
    { value: "inProgress", name: "In progress" },
    { value: "rejected", name: "Rejected" },
  ];

  // ==========================================================================
  // POLLING HELPERS
  // ==========================================================================

  /**
   * Update a single activity in state by id (immutable).
   */
  const updateActivityById = useCallback((id: number, updater: (prev: Activity) => Activity) => {
    setActivities(prev => prev.map(a => (a.id === id ? updater(a) : a)));
  }, []);

  /**
   * Stop polling for a specific activity id.
   */
  const stopPolling = useCallback((id: number) => {
    const timer = pollTimersRef.current.get(id);
    if (timer) {
      clearInterval(timer);
      pollTimersRef.current.delete(id);
    }
    pollingIdsRef.current.delete(id);
  }, []);

  /**
   * Start polling /{id}/status every 3 seconds.
   * Stops automatically when is_extracted becomes true.
   */
  const startPolling = useCallback((id: number) => {
    // Already polling this id — skip
    if (pollingIdsRef.current.has(id)) return;
    pollingIdsRef.current.add(id);

    const timer = setInterval(async () => {
      try {
        const updated: Activity = await TransmitterGetChildActivityStatus(id);

        if (updated.is_extracted) {
          // OCR done → push the fresh data into state and stop polling
          updateActivityById(id, () => updated);
          stopPolling(id);
        }
        // else: still extracting — do nothing, next tick will poll again
      } catch (err) {
        console.error(`Polling error for activity ${id}`, err);
        // Keep polling; transient network errors shouldn't stop it.
      }
    }, 5000); // 3-second interval

    pollTimersRef.current.set(id, timer);
  }, [updateActivityById, stopPolling]);

  /**
   * Given a list of activities, kick off polling for every one that is
   * still in the "extracting" state.  Idempotent — safe to call on every
   * list refresh.
   */
  const syncPolling = useCallback((list: Activity[]) => {
    list.forEach(activity => {
      if (isExtracting(activity)) {
        startPolling(activity.id);
      }
    });
  }, [startPolling]);

  /**
   * Cleanup: stop ALL active polls.  Call on unmount or before a full
   * list replacement that already contains the latest data.
   */
  const stopAllPolling = useCallback(() => {
    pollTimersRef.current.forEach((timer) => clearInterval(timer));
    pollTimersRef.current.clear();
    pollingIdsRef.current.clear();
  }, []);

  // ==========================================================================
  // MASTER ACTIVITIES
  // ==========================================================================
  const getMasterActivityTitles = async () => {
    try {
      const response = await TransmitterGetMasterActivities(0, 1000, "", null, null);
      if (response && response.result) {
        const mastersForFilter = response.result.map((master: any) => ({
          value: master.id.toString(),
          name: master.title,
        }));
        const mastersForModal = response.result.map((master: any) => ({
          id: master.id.toString(),
          name: master.title,
        }));
        setMasterActivities([{ value: "all", name: "All" }, ...mastersForFilter]);
        setMasterSheetsForModal(mastersForModal);
      } else {
        setMasterActivities([{ value: "all", name: "All" }]);
        setMasterSheetsForModal([]);
      }
    } catch (err) {
      console.error("Error fetching master activity titles", err);
      setMasterActivities([{ value: "all", name: "All" }]);
      setMasterSheetsForModal([]);
      dispatch.toast.openToast({ status: true, message: "Failed to load master activities", type: "error" });
    }
  };

  // ==========================================================================
  // INFINITE SCROLL
  // ==========================================================================
  useEffect(() => {
    const handleScroll = () => {
      const { current } = activityListRef;
      if (!current) return;
      const scrollPosition = current.scrollTop;
      if (
        current.scrollHeight - current.scrollTop === current.clientHeight &&
        !isFetching &&
        activities.length < activityTotal
      ) {
        loadMoreActivities(scrollPosition);
      }
    };
    const div = activityListRef.current;
    if (div) div.addEventListener("scroll", handleScroll);
    return () => { if (div) div.removeEventListener("scroll", handleScroll); };
  }, [isFetching, activities]);

  const loadMoreActivities = async (scrollPosition: number) => {
    setIsFetching(true);
    try {
      const response = await TransmitterGetChildActivities(
        pageSize.skip + pageSize.limit,
        pageSize.limit,
        searchValue,
        userStatusMapper(usernameFilter.value),
        statusMapper(statusFilter.value),
        masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined
      );
      if (response.result?.length > 0) {
        setActivities(prev => [...prev, ...response.result]);
        setActivityTotal(response.total);
        setPageSize(prev => ({ ...prev, skip: prev.skip + prev.limit }));
        activityListRef.current?.scrollTo(0, scrollPosition);
        // Start polling any newly-loaded extracting activities
        syncPolling(response.result);
      }
    } catch (err) {
      console.error("Error loading more activities", err);
    } finally {
      setIsFetching(false);
    }
  };

  // ==========================================================================
  // MOUNT / INIT
  // ==========================================================================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (check && activities?.length > 0) {
      const found = findItemById(activities, check);
      // Only allow opening if extraction is done
      if (found && !isExtracting(found)) {
        onSelectActivity(found);
      }
    }
  }, [check, activities]);

  useEffect(() => {
    getAllActivitiesList(pageSize?.skip, pageSize?.limit, "");
    getAllMembers(0, 100, "");
    getMasterActivityTitles();

    // Cleanup all polling timers on unmount
    return () => stopAllPolling();
  }, []);

  // ==========================================================================
  // API CALLS
  // ==========================================================================
  const getAllMembers = async (skip: number, limit: number, search_term?: string) => {
    try {
      const response = await TransmitterReadOCRMembers(skip, limit, search_term);
      if (response?.result) {
        setMembers(response.result);
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({ status: true, message: response.detail, type: "error" });
      }
    } catch (err) {
      console.log(err);
    }
  };

  function findItemById(dataArray: any[], id: any) {
    return dataArray.find((item: any) => item.id == id);
  }

  /**
   * Core list fetcher.  After setting state, kicks off polling for any
   * activities that are still extracting.
   */
  const getAllActivitiesList = async (
    skip: number,
    limit: number,
    search_term: string,
    user_status?: string,
    status?: string,
    master_id?: number
  ) => {
    setIsLoading(true);
    try {
      const response = await TransmitterGetChildActivities(
        skip, limit, search_term,
        user_status !== "All" && user_status,
        status !== "All" && status,
        master_id
      );
      if (response.result) {
        setActivities(response.result);
        setActivityTotal(response.total);
        // Kick off polling for any activity still extracting
        syncPolling(response.result);
      } else {
        console.error("Error fetching activities", response.error);
      }
    } catch (err) {
      console.error("Error fetching activities", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // FILTERS
  // ==========================================================================
  const handleFilter = (type: string, value: any) => {
    if (type === "status") {
      setFilter(prev => ({ ...prev, status: value?.value }));
      getAllActivitiesList(
        pageSize.skip, pageSize.limit, searchValue,
        userStatusMapper(filter.user),
        value?.name === "All" ? undefined : statusMapper(value?.value),
        masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined
      );
    }
    if (type === "user") {
      setFilter(prev => ({ ...prev, user: value?.value }));
      getAllActivitiesList(
        pageSize.skip, pageSize.limit, searchValue,
        value?.name === "All" ? null : userStatusMapper(value?.value),
        statusMapper(filter.status),
        masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined
      );
    }
    if (type === "master") {
      setFilter(prev => ({ ...prev, master: value?.value }));
      getAllActivitiesList(
        pageSize.skip, pageSize.limit, searchValue,
        userStatusMapper(filter.user),
        statusMapper(filter.status),
        value?.value !== "all" ? parseInt(value?.value) : undefined
      );
    }
  };

  // ==========================================================================
  // CREATE
  // ==========================================================================
  const handleCreate = async (title: string, file: File, pagesToTrim?: string, masterSheetId?: string) => {
    setIsLoading(true);
    try {
      const masterId = masterSheetId
        ? parseInt(masterSheetId)
        : masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined;

      if (!masterId) {
        dispatch.toast.openToast({ status: true, message: "Please select a master sheet", type: "error" });
        setIsLoading(false);
        return;
      }

      const response = await TransmitterCreateChildActivity(title, file, masterId);
      if (response) {
        setCreateModalVisible(false);
        dispatch.toast.openToast({ status: true, message: "Child activity created successfully", type: "success" });

        // The freshly created activity comes back with is_extracted=false.
        // Add it to the list immediately and start polling right away so the
        // user sees "Extracting…" without waiting for a full list refresh.
        setActivities(prev => [response, ...prev]);
        setActivityTotal(prev => prev + 1);
        if (isExtracting(response)) {
          startPolling(response.id);
        }
      } else {
        console.error("Error creating activity");
      }
    } catch (err) {
      setCreateModalVisible(false);
      setPageError(true);
      console.log(err);
      dispatch.toast.openToast({
        status: true,
        message: err?.response?.data?.detail ?? err?.response?.data ?? "Error creating activity",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // MENU ACTIONS
  // ==========================================================================
  const onChange = (item: string, activity: Activity) => {
    setDefaultActivity(activity);
    if (item === "Edit") setCreateModalVisible(true);
    else if (item === "Delete") dispatch.modal.openConfirmation();
    else if (item === "Tranfer") dispatch.modal.openTranferModal();
  };

  const onUpdate = async (title: string, pagesToTrim?: string, masterSheetId?: string) => {
    setIsLoading(true);
    try {
      const payload = { title, master_title: defaultActivity?.master_title };
      const response = await TransmitterUpdateChildActivityDetails(defaultActivity?.id, payload);
      if (response?.id) {
        getAllActivitiesList(pageSize.skip, pageSize.limit, "");
        setCreateModalVisible(false);
        dispatch.toast.openToast({ status: true, message: "Child activity updated successfully", type: "success" });
      }
    } catch (err) {
      console.error("Error updating activity", err);
      dispatch.toast.openToast({ status: true, message: "Error updating activity", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteSubmit = async (activity: any) => {
    setIsLoading(true);
    try {
      stopPolling(activity?.id); // stop polling before deleting
      await TransmitterDeleteChildActivity(activity?.id);
      getAllActivitiesList(pageSize.skip, pageSize.limit, "");
      dispatch.toast.openToast({ status: true, message: "Activity deleted successfully", type: "success" });
    } catch (err) {
      console.error("Error deleting activity", err);
      dispatch.toast.openToast({ status: true, message: "Error deleting activity", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // SEARCH
  // ==========================================================================
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchValue(searchTerm);
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      getAllActivitiesList(
        pageSize.skip, pageSize.limit, searchTerm,
        userStatusMapper(usernameFilter.value),
        statusMapper(statusFilter.value),
        masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined
      );
    }, 500);
  };

  // ==========================================================================
  // CARD CLICK  — blocked while extracting
  // ==========================================================================
  const onActivityCardClick = (activity: Activity) => {
    // ── Guard: extraction not finished yet ──────────────────────────────
    if (isExtracting(activity)) return; // silently ignore — card is already visually muted

    if (activity?.user_id === ocrMemberDetails?.user_id) {
      onSelectActivity(activity);
    } else if (activity?.status === "SUBMITTED" || activity?.status === "REJECTED") {
      onSelectActivity(activity);
    } else {
      setPageError(true);
      dispatch.toast.openToast({ status: true, message: "Sorry you are not the creator" });
    }
  };

  // ==========================================================================
  // TRANSFER
  // ==========================================================================
  const onTranferSubmit = async (value: any) => {
    setIsLoading(true);
    try {
      const response = await TransmitterTransferChildActivity(defaultActivity?.id, value?.user_id);
      if (response?.id) {
        getAllActivitiesList(pageSize.skip, pageSize.limit, "");
        dispatch.modal.closeTranferModal();
        dispatch.toast.openToast({ status: true, message: "Activity transferred successfully", type: "success" });
      }
    } catch (err) {
      console.error("Error transferring activity", err);
      dispatch.toast.openToast({ status: true, message: "Error transferring activity", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="flex flex-1 h-screen">
      {toastStatus.status && pageError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex-1 p-6 h-full">
        {/* Header row */}
        <div className="flex justify-between items-center mt-1.5 mb-4 w-full">
          <div className="flex flex-col">
            <Text className="text-2xl -mt-1 font-bold" type="header2">Child Activity</Text>
            {activities && (
              <Text type="small" className="text-faint_text ml-1">
                {`(${activities.length > 1 ? activities.length + " Results" : activities.length + " Result"} of ${activityTotal})`}
              </Text>
            )}
          </div>

          <div className="items-center space-y-2">
            <div className="flex space-x-6 pr-2">
              {/* User filter */}
              <div className="relative flex items-center">
                <Text className="mr-2" type="small">User:</Text>
                <DropDownButton
                  className="w-36"
                  listValues={userOptions}
                  value={usernameFilter}
                  onChange={(value) => { setUsernameFilter(value); handleFilter("user", value); }}
                />
              </div>

              {/* Status filter */}
              <div className="relative flex items-center">
                <Text className="mr-2" type="small">Status:</Text>
                <DropDownButton
                  className="w-36"
                  listValues={statusOptions}
                  value={statusFilter}
                  onChange={(value) => { setStatusFilter(value); handleFilter("status", value); }}
                />
              </div>

              {/* Master filter */}
              <div className="relative flex items-center">
                <Text className="mr-2" type="small">Master:</Text>
                <DropDownButton
                  className="w-36"
                  listValues={masterActivities.length > 0 ? masterActivities : [{ value: "all", name: "All" }]}
                  value={masterFilter}
                  onChange={(value) => { setMasterFilter(value); handleFilter("master", value); }}
                />
              </div>

              {/* Add button */}
              <div className="flex items-center space-x-5">
                <Button
                  onClick={() => { setCreateModalVisible(true); setDefaultActivity(undefined); }}
                  custom_type="danger"
                  className="bg-danger w-20 h-10 p-2 gap-2 rounded-lg"
                  size="custom"
                >
                  <img src={AddIcon} alt="add" loading="lazy" />
                  <Text type="small">Add</Text>
                </Button>
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

        {/* ── Activity list ─────────────────────────────────────────────── */}
        <div ref={activityListRef} className="flex-1 mt-4 h-[calc(100vh-230px)] pr-4 overflow-y-auto">
          {isLoading && activities.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-danger" />
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity: any) => {
              const extracting = isExtracting(activity);

              return (
                <div className="mt-5" key={activity.id}>
                  <div
                    // Mute the entire card while extracting; remove pointer so it feels disabled
                    className={`border main_card p-4 flex justify-between items-center mb-4 rounded-lg shadow-lg transition-opacity duration-300 ${extracting
                      ? "opacity-60 cursor-not-allowed bg-gray-50"  // muted / disabled look
                      : "cursor-pointer"                            // normal clickable
                      }`}
                    onClick={(e: any) => {
                      if (extracting) return; // hard block
                      if (
                        e.target.className.includes("main_card") ||
                        e.target.className.includes("title_text")
                      )
                        onActivityCardClick(activity);
                    }}
                  >
                    {/* Avatar + text */}
                    <div className="flex items-center">
                      <div
                        title={activity?.user?.name}
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-small ${extracting ? "bg-gray-200 text-gray-400" : "bg-gray-300"
                          }`}
                      >
                        {getInitials(activity?.user?.name)}
                      </div>
                      <div className="flex flex-col ml-4">
                        <Text
                          type="header3"
                          title={activity.title}
                          className={`truncate title_text max-w-2xl ellipsis ${extracting ? "text-gray-400" : ""   // lighter title while extracting
                            }`}
                        >
                          {activity?.title}
                        </Text>
                        <Text className={`max-w-full font-small text-[12px] ${extracting ? "text-gray-400" : "text-[#505F79]"}`}>
                          Master: {activity?.master_title}
                        </Text>
                        <Text className={`max-w-full font-small text-[12px] ${extracting ? "text-gray-400" : "text-[#505F79]"}`}>
                          Created on: {new Date(activity.created_on).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>

                    <div />

                    {/* Status badge + menu */}
                    <div className="flex items-center relative">
                      {extracting ? (
                        /*
                         * ── IN PROGRESS (Light + Spinner) ──────────────────
                         */
                        <div className="flex items-center space-x-2 absolute right-24 border border-gray-300 rounded-lg w-32 h-12 justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400" />
                          <Text
                            type="body"
                            className="text-gray-400 text-[12px]"
                          >
                            In Progress
                          </Text>
                        </div>
                      ) : (
                        /*
                         * ── Normal status badge (non-bold) ────────────────
                         */
                        <Text
                          type="body"
                          className={`border rounded-lg w-32 text-center h-12 p-3 text-primary_text ${getBorderColor(activity?.status)} absolute right-24`}
                        >
                          {activity?.status && statusMapper(activity.status)}
                        </Text>
                      )}

                      {/* Context-menu (three-dot) — hidden while extracting */}
                      <div className="right-12">
                        {!extracting &&
                          ocrMemberDetails &&
                          (ocrMemberDetails?.role === "OWNER" ||
                            ocrMemberDetails?.user_id === activity?.user_id) && (
                            <DropDownMenu
                              onChange={(item: string) => onChange(item, activity)}
                              content={<img className="w-8 h-8" src={Menu} alt="menu" loading="lazy" />}
                              menuItems={activity?.status !== "IN_PROGRESS" ? MenuItemsWithoutEdit : MenuItems}
                            />
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
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

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {confirmationStatus && (
        <ConfirmationModal
          onSubmit={() => onDeleteSubmit(defaultActivity)}
          title="Remove Activity"
          content="Are you sure you want to remove this activity?"
        />
      )}

      <CreateChildActivity
        isOpen={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreate}
        defaultValues={defaultActivity}
        onUpdate={onUpdate}
        masterSheets={masterSheetsForModal}
      />

      {tranferModal && (
        <TranferActivityModal
          defaultValue={defaultActivity?.user?.name}
          onSubmit={(value: any) => onTranferSubmit(value)}
          userList={members}
        />
      )}
    </div>
  );
};

export default ChildActivityPage;