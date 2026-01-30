import React, { useState, useEffect, useRef } from "react";
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

export type Activity = {
  id: number;
  title: string;
  createdOn: string;
  updatedOn: string;
  status: string;
  username: string;
  fileUrl: string;
  user_id: string;
  master_title: string;
  master_id: number;
};
interface ChildActivityPageProps {
  onSelectActivity: (activity: Activity) => void;
}
const MenuItems = [
  {
    title: "Edit",
    component: <img src={Edit} alt="edit" loading="lazy" />,
  },
  {
    title: "Delete",
    component: <img src={Trash} alt="trash" loading="lazy" />,
  },
  {
    title: "Tranfer",
    component: <img src={Tranfer} alt="Tranfer" loading="lazy" />,
  },
];
const MenuItemsWithoutEdit = [
  {
    title: "Delete",
    component: <img src={Trash} alt="trash" loading="lazy" />,
  },
  {
    title: "Tranfer",
    component: <img src={Tranfer} alt="Tranfer" loading="lazy" />,
  },
];
const ChildActivityPage: React.FC<ChildActivityPageProps> = ({ onSelectActivity }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const check = searchParams.get("activity_id");
  const activityListRef = useRef<HTMLDivElement>(null);
  const [usernameFilter, setUsernameFilter] = useState<{
    value: string;
    name: string;
  }>({ value: "all", name: "All" });
  const [statusFilter, setStatusFilter] = useState<{
    value: string;
    name: string;
  }>({ value: "all", name: "All" });
  const [masterFilter, setMasterFilter] = useState<{
    value: string;
    name: string;
  }>({ value: "all", name: "All" });
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [masterActivities, setMasterActivities] = useState<any[]>([]);
  const [masterSheetsForModal, setMasterSheetsForModal] = useState<Array<{ id: string; name: string }>>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [user, setUser] = useState<any>(null);
  const member = useSelector((state: RootState) => state.memberRole);
  const ocrMemberDetails = member.service === "transmitter_ocr" ? member?.details : {};
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 50 });
  const [defaultActivity, setDefaultActivity] = useState<any>();
  const dispatch = useDispatch<Dispatch>();
  const [activityTotal, setActivityTotal] = useState<number>(0);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [pageError, setPageError] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [pollingSkip, setPollingSkip] = useState(pageSize.skip);
  let isPolling = false;
  const tranferModal = useSelector(
    (state: RootState) => state.modal.tranferModal
  );
  const confirmationStatus = useSelector(
    (state: RootState) => state.modal.confirmation
  );
  const [filter, setFilter] = useState<{ user: string; status: string; master: string }>({
    user: "All",
    status: "All",
    master: "All",
  });
  let timeoutId: NodeJS.Timeout | null = null;
  let intervalId: NodeJS.Timeout | null = null;
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

  // new state for loading
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to fetch master activity titles
  const getMasterActivityTitles = async () => {
    try {
      console.log("Fetching master activities...");
      const response = await TransmitterGetMasterActivities(0, 1000, "", null, null);
      
      console.log("Master activities response:", response);
      
      if (response && response.result) {
        console.log("Master activities result:", response.result);
        
        // Format for dropdown filter: { value: id, name: title }
        const mastersForFilter = response.result.map((master: any) => ({
          value: master.id.toString(),
          name: master.title
        }));
        
        // Format for modal: { id: string, name: string }
        const mastersForModal = response.result.map((master: any) => ({
          id: master.id.toString(),
          name: master.title
        }));
        
        console.log("Formatted masters for filter:", mastersForFilter);
        console.log("Formatted masters for modal:", mastersForModal);
        
        setMasterActivities([{ value: "all", name: "All" }, ...mastersForFilter]);
        setMasterSheetsForModal(mastersForModal);
      } else {
        console.log("Unexpected response structure:", response);
        setMasterActivities([{ value: "all", name: "All" }]);
        setMasterSheetsForModal([]);
      }
    } catch (err) {
      console.error("Error fetching master activity titles", err);
      // Fallback to empty array with "All" option
      setMasterActivities([{ value: "all", name: "All" }]);
      setMasterSheetsForModal([]);
      
      // Show error toast
      dispatch.toast.openToast({
        status: true,
        message: "Failed to load master activities",
        type: "error",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const { current } = activityListRef;
      if (!current) return;
      // Save the scroll position before making an API call
      const scrollPosition = current.scrollTop;
      // Check if user has scrolled to the bottom and if more activities need to be fetched
      if (current.scrollHeight - current.scrollTop === current.clientHeight && !isFetching && activities.length < activityTotal) {
        loadMoreActivities(scrollPosition);
      }
    };
    const div = activityListRef.current;
    if (div) {
      div.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (div) {
        div.removeEventListener('scroll', handleScroll);
      }
    };
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
      if (response.result) {
        // Update the activities only if there are new activities
        const newActivities = response.result;
        if (newActivities && newActivities.length > 0) {
          setActivities((prevActivities) => [...prevActivities, ...newActivities]);
          setActivityTotal(response.total);
          setPageSize((prevPageSize) => ({
            ...prevPageSize,
            skip: prevPageSize.skip + prevPageSize.limit,
          }));
          setPollingSkip(pageSize.skip + pageSize.limit);
          // Restore the scroll position
          activityListRef.current.scrollTo(0, scrollPosition);
        }
      }
    } catch (err) {
      console.error("Error loading more activities", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (check && activities?.length > 0) {
      onSelectActivity(findItemById(activities, check));
    }
  }, [check, activities]);

  useEffect(() => {
    getAllActivitiesList(pageSize?.skip, pageSize?.limit, "");
    getAllMembers(0, 100, "");
    getMasterActivityTitles(); // Fetch master titles on component mount
  }, []);

  const getAllMembers = async (
    skip: number,
    limit: number,
    search_term?: string
  ) => {
    try {
      const response = await TransmitterReadOCRMembers(skip, limit, search_term);
      if (response?.result) {
        setMembers(response?.result);
      } else {
        setPageError(true);
        if (response?.detail)
          dispatch.toast.openToast({
            status: true,
            message: response?.detail,
            type: "error",
          });
      }
    } catch (err) {
      console.log(err);
    }
  };

  function findItemById(dataArray: any, id: any) {
    return dataArray.filter((item: any) => item.id == id)[0];
  }

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
        skip,
        limit,
        search_term,
        user_status !== "All" && user_status,
        status !== "All" && status,
        master_id
      );
      if (response.result) {
        setActivities(response.result);
        setActivityTotal(response?.total);
      } else {
        console.error("Error fetching activities", response.error);
      }
    } catch (err) {
      console.error("Error fetching activities", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (type: string, value: any) => {
    if (type === "status") {
      setFilter({ ...filter, status: value?.value });
      if (value?.name === "All") {
        getAllActivitiesList(
          pageSize?.skip,
          pageSize?.limit,
          searchValue,
          userStatusMapper(filter?.user),
          undefined,
          masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined
        );
      } else {
        getAllActivitiesList(
          pageSize?.skip,
          pageSize?.limit,
          searchValue,
          userStatusMapper(filter?.user),
          statusMapper(value?.value),
          masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined
        );
      }
    }
    if (type === "user") {
      setFilter({ ...filter, user: value?.value });
      if (value?.name === "All") {
        getAllActivitiesList(
          pageSize?.skip,
          pageSize?.limit,
          searchValue,
          null,
          statusMapper(filter?.status),
          masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined
        );
      } else {
        getAllActivitiesList(
          pageSize?.skip,
          pageSize?.limit,
          searchValue,
          userStatusMapper(value?.value),
          statusMapper(filter?.status),
          masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined
        );
      }
    }
    if (type === "master") {
      setFilter({ ...filter, master: value?.value });
      getAllActivitiesList(
        pageSize?.skip,
        pageSize?.limit,
        searchValue,
        userStatusMapper(filter?.user),
        statusMapper(filter?.status),
        value?.value !== "all" ? parseInt(value?.value) : undefined
      );
    }
  };

  const handleCreate = async (title: string, file: File, pagesToTrim?: string, masterSheetId?: string) => {
    setIsLoading(true);
    try {
      const masterId = masterSheetId ? parseInt(masterSheetId) : 
                       (masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined);
      
      if (!masterId) {
        dispatch.toast.openToast({
          status: true,
          message: "Please select a master sheet",
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      const response = await TransmitterCreateChildActivity(title, file, masterId);
      if (response) {
        setCreateModalVisible(false);
        getAllActivitiesList(pageSize?.skip, pageSize?.limit, "");
        dispatch.toast.openToast({
          status: true,
          message: "Child activity created successfully",
          type: "success",
        });
      } else {
        console.error("Error creating activity");
      }
    } catch (err) {
      setCreateModalVisible(false);
      setPageError(true);
      console.log(err);
      if (err?.response?.data?.detail) {
        dispatch.toast.openToast({
          status: true,
          message: err?.response?.data?.detail,
          type: "error",
        });
      } else {
        dispatch.toast.openToast({
          status: true,
          message: err?.response?.data ?? "Error creating activity",
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onChange = (item: string, activity: Activity) => {
    setDefaultActivity(activity);
    if (item === "Edit") {
      setCreateModalVisible(true);
    } else if (item === "Delete") {
      dispatch.modal.openConfirmation();
    } else if (item === "Tranfer") {
      dispatch.modal.openTranferModal();
    } else {
      console.log("error");
    }
  };

  const onUpdate = async (title: string, pagesToTrim?: string, masterSheetId?: string) => {
    setIsLoading(true);
    try {
      let payload = {
        title: title,
        master_title: defaultActivity?.master_title,
      };
      const response = await TransmitterUpdateChildActivityDetails(
        defaultActivity?.id,
        payload
      );
      if (response?.id) {
        getAllActivitiesList(pageSize?.skip, pageSize?.limit, "");
        setCreateModalVisible(false);
        dispatch.toast.openToast({
          status: true,
          message: "Child activity updated successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error updating activity", err);
      dispatch.toast.openToast({
        status: true,
        message: "Error updating activity",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteSubmit = async (activity: any) => {
    setIsLoading(true);
    try {
      await TransmitterDeleteChildActivity(activity?.id);
      getAllActivitiesList(pageSize?.skip, pageSize?.limit, "");
      dispatch.toast.openToast({
        status: true,
        message: "Activity deleted successfully",
        type: "success",
      });
    } catch (err) {
      console.error("Error deleting activity", err);
      dispatch.toast.openToast({
        status: true,
        message: "Error deleting activity",
        type: "error",
      });
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
      getAllActivitiesList(pageSize?.skip, pageSize?.limit, searchTerm, userStatusMapper(usernameFilter.value),
        statusMapper(statusFilter.value), masterFilter.value !== "all" ? parseInt(masterFilter.value) : undefined);
    }, 500);
  };

  const onActivityCardClick = (activity: Activity) => {
    if (activity?.user_id === ocrMemberDetails?.user_id) {
      onSelectActivity(activity);
    } else if (
      activity?.status === "SUBMITTED" ||
      activity?.status === "REJECTED"
    ) {
      onSelectActivity(activity);
    } else {
      setPageError(true);
      dispatch.toast.openToast({
        status: true,
        message: "Sorry you are not the creator",
      });
    }
  };

  const onTranferSubmit = async (value: any) => {
    setIsLoading(true);
    try {
      const response = await TransmitterTransferChildActivity(
        defaultActivity?.id,
        value?.user_id
      );
      if (response?.id) {
        getAllActivitiesList(pageSize?.skip, pageSize?.limit, "");
        dispatch.modal.closeTranferModal();
        dispatch.toast.openToast({
          status: true,
          message: "Activity transferred successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error transferring activity", err);
      dispatch.toast.openToast({
        status: true,
        message: "Error transferring activity",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Debug: Log master activities state
  console.log("Master activities state:", masterActivities);
  console.log("Master sheets for modal:", masterSheetsForModal);

  return (
    <div className="flex flex-1 h-screen">
      {toastStatus.status && pageError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      {/* Main content */}
      <div className="flex-1 p-6 h-full">
        <div className="flex justify-between items-center mt-1.5 mb-4 w-full">
          <div className="flex flex-col">
            <Text className="text-2xl -mt-1 font-bold" type="header2">
              Child Activity
            </Text>
            {activities && (
              <Text type="small" className="text-faint_text ml-1">{`(${
                activities?.length > 1
                  ? activities?.length + " Results"
                  : activities?.length + " Result"
              } of ${activityTotal})`}</Text>
            )}
          </div>
          <div className="items-center space-y-2">
          <div className="flex space-x-6 pr-2">
            <div className="relative flex items-center">
              <Text className="mr-2" type="small">
                User:
              </Text>
              <DropDownButton
                className={`w-36`}
                listValues={userOptions}
                value={usernameFilter}
                onChange={(value) => {
                  setUsernameFilter(value);
                  handleFilter("user", value);
                }}
              />
            </div>
            <div className="relative flex items-center">
              <Text className="mr-2" type="small">
                Status:
              </Text>
              <DropDownButton
                className={`w-36`}
                listValues={statusOptions}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  handleFilter("status", value);
                }}
              />
            </div>
            {/* Add Master filter dropdown */}
            <div className="relative flex items-center">
              <Text className="mr-2" type="small">
                Master:
              </Text>
              <DropDownButton
                className={`w-36`}
                listValues={masterActivities.length > 0 ? masterActivities : [{ value: "all", name: "All" }]}
                value={masterFilter}
                onChange={(value) => {
                  setMasterFilter(value);
                  handleFilter("master", value);
                }}
              />
            </div>
          <div className="flex items-center space-x-5">
            <Button
              onClick={() => {
                setCreateModalVisible(true);
                setDefaultActivity(undefined);
              }}
              custom_type="danger"
              className="bg-danger w-20 h-10 p-2 gap-2 rounded-lg"
              size="custom"
            >
              <img src={AddIcon} alt="add" loading="lazy" />
              <Text type="small">Add</Text>
            </Button>
          </div>
          
          </div>
          <div className="pt-4">
          <Input
              prefixIcon={<img src={Search} alt="search" loading="lazy" />}
              placeholder="Search"
              fixed_size={"large"}
              onChange={onSearchChange}
            />
          </div>
          </div>
           
        </div>
        <div ref={activityListRef} className="flex-1 mt-4 h-[calc(100vh-230px)] pr-4 overflow-y-auto">
          {isLoading && activities.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-danger"></div>
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity: any) => (
              <div className="mt-5 " key={activity.id}>
                <div
                  className="border main_card p-4 flex justify-between items-center mb-4 cursor-pointer rounded-lg shadow-lg"
                  onClick={(e: any) =>
                    (e.target.className.includes("main_card") ||
                    e.target.className.includes("title_text")) &&
                    onActivityCardClick(activity)
                  }
                >
                  <div className="flex items-center">
                    <div
                      title={activity?.user?.name}
                      className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center font-small"
                    >
                      {getInitials(activity?.user?.name)}
                    </div>
                    <div className="flex flex-col ml-4">
                      <Text
                        type="header3"
                        title={activity.title}
                        className="truncate title_text max-w-2xl ellipsis"
                      >
                        {activity?.title}
                      </Text>
                      <Text className="text-[#505F79] max-w-full font-small text-[12px]">
                        Master: {activity?.master_title}
                      </Text>
                      <Text className="text-[#505F79] max-w-full font-small text-[12px]">
                        Created on: {new Date(activity.created_on).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                  <div>
                    {/* Placeholder for additional content, such as updated on */}
                  </div>
                  <div className="flex items-center relative">
                    <Text
                      type="body"
                      className={`border rounded-lg w-32 text-center h-12 p-3 text-primary_text ${getBorderColor(
                        activity?.status
                      )} absolute right-24`}
                    >
                      {activity?.status && statusMapper(activity.status)}
                    </Text>
                    {/* Empty placeholder to maintain space for dropdown menu */}
                    <div className="right-12">
                      {ocrMemberDetails &&
                        (ocrMemberDetails?.role === "OWNER" ||
                          ocrMemberDetails?.user_id === activity?.user_id) && (
                          <DropDownMenu
                            onChange={(item: string) => onChange(item, activity)}
                            content={
                              <img
                                className="w-8 h-8"
                                src={Menu}
                                alt="menu"
                                loading="lazy"
                              />
                            }
                            menuItems={
                              activity?.status !== "IN_PROGRESS"
                                ? MenuItemsWithoutEdit
                                : MenuItems
                            }
                          />
                        )}
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
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-danger"></div>
            </div>
          )}
        </div>
      </div>
      {confirmationStatus && (
        <ConfirmationModal
          onSubmit={() => onDeleteSubmit(defaultActivity)}
          title="Remove Activity"
          content="Are you sure you want to remove this activity?"
        />
      )}
      {/* Create Child Activity Modal */}
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