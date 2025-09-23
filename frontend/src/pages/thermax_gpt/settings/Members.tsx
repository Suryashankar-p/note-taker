import React, { useEffect, useState, useRef } from "react";
import Text from "../../../components/Text";
import Button from "../../../components/Button";
import AddIcon from "../../../assets/circle_plus.svg";
import Input from "../../../components/Input";
import SearchIcon from "../../../assets/search_icon.svg";
import UserTable from "../../../components/Table";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import {
  CreateMember,
  DeleteMember,
  ReadMembers,
  UpdateMember,
} from "../../../services/thermax_gpt";
import NoData from "../../../assets/no_data";
import Toast from "../../../components/Toast";

export const getKeyByValue = (object: any, value: any) => {
  return Object.entries(object).find(([key, val]) => val === value)?.[0];
};

const Members = () => {


  useEffect(() => {
    getAllMembers(0, 30, "");
  }, []);

  const [data, setData] = useState<any[]>([]);
  const [memberTotal, setMemberTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false); // Track loading state
  const [hasMore, setHasMore] = useState(true); // Track if more members are available to load
  let timeoutId: NodeJS.Timeout | null = null;
  const member = useSelector((state: RootState) => state.memberRole);
  const MemberDetails = member?.details ?? {};
  const dispatch = useDispatch<Dispatch>();
  const memberType = useSelector(
    (state: RootState) => state.modal.addMember.type
  );
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [pageError, setPageError] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [skip, setSkip] = useState(0);

  // ✅ fetch members
  const getAllMembers = async (
    newSkip: number,
    limit: number,
    search_term = ""
  ) => {
    if (loading || (newSkip !== 0 && !hasMore)) return;

    try {
      setLoading(true);
      const response = await ReadMembers(newSkip, limit, search_term);

      if (response?.result) {
        setData((prev) =>
          newSkip === 0 ? response.result : [...prev, ...response.result]
        );
        setSkip((prev) =>
          newSkip === 0 ? response.result.length : prev + response.result.length
        );
        setMemberTotal(response.total);

        // ✅ correct hasMore check (use total, not just page size)
        setHasMore(newSkip + response.result.length < response.total);
      } else {
        setPageError(true);
        if (response?.detail) {
          dispatch.toast.openToast({
            status: true,
            message: response.detail,
            type: "error",
          });
        }
      }
    } catch (err) {
      console.error(err);
      setPageError(true);
    } finally {
      setLoading(false);
    }
  };


  // ✅ create
  const onMemberCreate = async (data: any) => {
    if (!data) return;

    try {
      const response = await CreateMember(data);
      if (response?.id) {
        dispatch.modal.closeAddMember();
        getAllMembers(0, 30, "");
      } else {
        setPageError(true);
        if (response?.detail) {
          dispatch.toast.openToast({
            status: true,
            message: response.detail,
            type: "error",
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ edit
  const onMemberEdit = async (data: any) => {
    if (!data) return;

    const body = {
      name: data.name,
      role: data.role,
      thrmx_gpt_user_service_mapping: data.thrmx_gpt_user_service_mapping,
    };

    try {
      const response = await UpdateMember(body, data?.memberId);
      if (response?.id) {
        dispatch.modal.closeAddMember();
        getAllMembers(0, 30, "");
      } else {
        setPageError(true);
        if (response?.detail) {
          dispatch.toast.openToast({
            status: true,
            message: response.detail,
            type: "error",
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ submit
  const onSubmit = (data: any) => {
    if (memberType === "edit") {
      onMemberEdit(data);
    } else if (memberType === "add") {
      onMemberCreate(data);
    }
  };

  // ✅ delete
  const onDeleteSubmit = async (user: any) => {
    try {
      await DeleteMember(user?.id);
      getAllMembers(0, 30, "");
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ debounced search
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setSearchValue(searchTerm)
      setSkip(0);
      getAllMembers(0, 30, searchTerm);
    }, 500);
  };

  // ✅ scroll handler
  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10 && hasMore && !loading) {
      getAllMembers(skip, 30, searchValue);
    }
  };
  return (
    <div className="flex flex-col h-full gap-30 overflow-y-hidden">
      {toastStatus.status && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      <div className="mx-16 mt-1 flex flex-row justify-between">
        <div className="flex flex-col">
          <Text className="text-[#091E42]" type="header2">
            Owners
          </Text>
          {data && (
            <Text type="small" className="text-faint_text ml-1">
              {`(${
                data?.length > 1
                  ? data?.length + " Results"
                  : data?.length + " Result"
              } of ${memberTotal})`}
            </Text>
          )}
        </div>
        <div className="flex flex-row items-center gap-5">
          {MemberDetails?.role === "OWNER" && (
            <Button
              onClick={() => dispatch.modal.openAddMember("add")}
              custom_type="danger"
              className="bg-danger w-20 h-10 p-2 gap-2 rounded-lg"
              size="custom"
            >
              <img src={AddIcon} alt="add" loading="lazy" />
              <Text type="small">Add</Text>
            </Button>
          )}
          <Input
            onChange={onSearchChange}
            prefixIcon={<img src={SearchIcon} alt="search" loading="lazy" />}
            placeholder="Search"
            fixed_size="large"
          />
        </div>
      </div>
      <div className="mx-16 mt-8 overflow-y-scroll" ref={scrollContainerRef}>
        {data?.length > 0 ? (
          <UserTable
            data={data}
            type="thermax_gpt"
            onSubmit={onSubmit}
            onDeleteSubmit={onDeleteSubmit}
            handleScroll={handleScroll}
          />
        ) : (
          <div className="flex justify-center items-center">
            <NoData />
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
