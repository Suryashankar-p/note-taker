import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AddMembersModal from "../../components/Modals/AddMembers";
import { Member } from "../../utils/constants";
import { getInitials } from "../../utils/functions";
import Text from "../../components/Text";
import Button from "../../components/Button";
import AddIcon from "../../assets/circle_plus.svg";
import { useDispatch, useSelector } from "react-redux";
import store, { Dispatch, RootState } from "../../redux/store";
import SearchIcon from "../../assets/search_icon.svg";
import Input from "../../components/Input";
import UserTable from "../../components/Table";
import {
  CreateOCRMember,
  DeleteOCRMember,
  GetHeatingOCRRole,
  ReadOCRMembers,
  UpdateOCRMember,
} from "../../services/heating_ocr.ts";
import NoData from "../../assets/no_data.tsx";

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const dispatch = useDispatch<Dispatch>();
  const [memberTotal, setMemberTotal] = useState<number>(0);
  const [pageError, setPageError] = useState<boolean>(false);
  const [loading, setLoading] = useState(false); // Track loading state
  const [hasMore, setHasMore] = useState(true); // Track if more members are available
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref for scroll container
  let timeoutId: NodeJS.Timeout | null = null;
  const [searchValue, setSearchValue] = useState("");
  const memberType = useSelector(
    (state: RootState) => state.modal.addMember.type
  );
  const member = useSelector((state: RootState) => state.memberRole);
  const ocrMemberDetails =
    member.service === "heating_ocr" ? member?.details : {};

  useEffect(() => {
    getAllMembers(0, 50, "");
  }, []);

  const getAllMembers = async (
    skip: number,
    limit: number,
    search_term?: string
  ) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await ReadOCRMembers(skip, limit, search_term);
      if (response?.result) {
        setMembers((prevData) =>
          skip === 0 ? response?.result : [...prevData, ...response?.result]
        );
        setMemberTotal(response?.total);
        setHasMore(response?.result.length >= limit); // Determine if more data is available
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
      dispatch.toast.openToast({
        status: true,
        message: "Error fetching data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !loading && hasMore) {
      getAllMembers(members.length, 50, searchValue); // Load next set of members
    }
  };

  const handleAddMember = async (member: Member) => {
    let response: any;
    if (memberType === "edit") {
      response = await UpdateOCRMember(
        member?.role,
        member?.name,
        member?.memberId
      );
    } else if (memberType === "add") {
      response = await CreateOCRMember(
        member?.role,
        member?.email,
        member?.name
      );
    }
    if (response?.id) {
      dispatch.modal.closeAddMember(); // Close the modal after adding a member
      getAllMembers(0, 50, "");
      getOCRRole();
    } else if (response?.detail) {
      dispatch.toast.openToast({
        status: true,
        message: response?.detail,
        type: "error",
      });
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setSearchValue(searchTerm);
      getAllMembers(0, 50, searchTerm);
    }, 500); // Adjust the delay time (in milliseconds) as needed
  };

  const onDeleteSubmit = async (user: any) => {
    await DeleteOCRMember(user?.id);
    getAllMembers(0, 50, "");
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-row justify-between items-center p-6">
          <div>
            <Text className="text-2xl font-bold ml-1" type="header2">
              Members
            </Text>
            {members && (
              <Text type="small" className="text-faint_text ml-1">
                {`(${
                  members.length > 1
                    ? members.length + " Results"
                    : members.length + " Result"
                } of ${memberTotal})`}
              </Text>
            )}
          </div>
          <div className="flex items-center space-x-5">
            {ocrMemberDetails && ocrMemberDetails.role === "OWNER" && (
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
        <div
          className="mx-16 mt-2 overflow-y-scroll"
          ref={scrollContainerRef}
        >
          {members.length > 0 ? (
            <UserTable
              data={members}
              onSubmit={handleAddMember}
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
    </div>
  );
};

export default MembersPage;

export const getOCRRole = async () => {
  const response = await GetHeatingOCRRole();
  if (response?.id) {
    (store.dispatch as Dispatch).memberRole.setRole({
      service: "heating_ocr",
      details: response,
    });
  }
};
