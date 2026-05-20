import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AddMembersModal from "../../components/Modals/AddMembers.tsx";
import { Member } from "../../utils/constants.ts";
import { getInitials } from "../../utils/functions.ts";
import Text from "../../components/Text.tsx";
import Button from "../../components/Button.tsx";
import AddIcon from "../../assets/circle_plus.svg";
import { useDispatch, useSelector } from "react-redux";
import store, { Dispatch, RootState } from "../../redux/store.ts";
import SearchIcon from "../../assets/search_icon.svg";
import Input from "../../components/Input.tsx";
import UserTable from "../../components/Table.tsx";

import {
  TransmitterCreateOCRMember,
  TransmitterDeleteOCRMember,
  TransmitterGetMemberOCRRole,
  TransmitterReadOCRMembers,
  TransmitterUpdateOCRMember,
} from "../../services/transmitter_ocr.ts";
import NoData from "../../assets/no_data.tsx";

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const dispatch = useDispatch<Dispatch>();
  const [memberTotal, setMemberTotal] = useState<number>(0);
  const [pageError, setPageError] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  let timeoutId: NodeJS.Timeout | null = null;
  const [searchValue, setSearchValue] = useState("");
  const memberType = useSelector(
    (state: RootState) => state.modal.addMember.type
  );
  const member = useSelector((state: RootState) => state.memberRole);
  const ocrMemberDetails =
    member.service === "transmitter_ocr" ? member?.details : {};
  
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
      const response = await TransmitterReadOCRMembers(skip, limit, search_term);
      if (response?.result) {
        setMembers((prevData) =>
          skip === 0 ? response?.result : [...prevData, ...response?.result]
        );
        setMemberTotal(response?.total);
        setHasMore(response?.result.length >= limit);
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
      getAllMembers(members.length, 50, searchValue);
    }
  };
  
  const handleAddMember = async (member: Member) => {
    let response: any;
    try {
      if (memberType === "edit") {
        response = await TransmitterUpdateOCRMember(
          member?.role,
          member?.name,
          member?.memberId
        );
      } else if (memberType === "add") {
        response = await TransmitterCreateOCRMember(
          member?.role,
          member?.email,
          member?.name
        );
      }
      if (response?.id) {
        dispatch.modal.closeAddMember();
        getAllMembers(0, 50, "");
        getOCRRole();
      } else if (response?.detail) {
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
  
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setSearchValue(searchTerm);
      getAllMembers(0, 50, searchTerm);
    }, 500);
  };
  
  const onDeleteSubmit = async (user: any) => {
    try {
      await TransmitterDeleteOCRMember(user?.id);
      getAllMembers(0, 50, "");
    } catch (err) {
      console.log(err);
    }
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
          onScroll={handleScroll}
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
  const response = await TransmitterGetMemberOCRRole();
  if (response?.id) {
    (store.dispatch as Dispatch).memberRole.setRole({
      service: "transmitter_ocr",
      details: response,
    });
  }
};