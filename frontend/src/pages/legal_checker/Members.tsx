import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Text from "../../components/Text";
import Input from "../../components/Input";
import UserTable from "../../components/Table";
import Toast from "../../components/Toast";
import NoData from "../../assets/no_data";

import AddIcon from "../../assets/circle_plus.svg";
import SearchIcon from "../../assets/search_icon.svg";

import {
  ReadMembers,
  CreateMember,
  UpdateMember,
  DeleteMember,
  GetLegalCheckerRole,
} from "../../services/legal_checker.ts";

import { Dispatch, RootState } from "../../redux/store";

const Members: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const memberRole = useSelector((state: RootState) => state.memberRole);
  const modalType = useSelector((state: RootState) => state.modal.addMember.type);
  const toastStatus = useSelector((state: RootState) => state.toast);

  const legalCheckerMemberDetails =
    memberRole.service === "legal_checker" ? memberRole.details : {};

  const setLegalCheckerRole = async () => {
    try {
      const response = await GetLegalCheckerRole();
      if (response?.id) {
        dispatch.memberRole.setRole({ service: "legal_checker", details: response });
      }
    } catch (err) {
      console.error(err);
      setPageError(true);
    }
  };

  const fetchMembers = async (search_term = "") => {
    try {
      setLoading(true);
      const response = await ReadMembers(0, 100, search_term);
      setData(Array.isArray(response) ? response : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setPageError(true);
    }
  };

  useEffect(() => {
    setLegalCheckerRole();
    fetchMembers("");
  }, []);

  const onSubmit = async (payload: any) => {
    try {
      let response;
      if (modalType === "edit") {
        response = await UpdateMember(payload.role, payload.memberId);
      } else if (modalType === "add") {
        response = await CreateMember(payload.role, payload.email, payload.name);
      }
      if (response?.detail) {
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: response.detail, type: "error" });
      } else {
        dispatch.modal.closeAddMember();
        fetchMembers(searchValue);
      }
    } catch (err: any) {
      console.error(err);
      dispatch.toast.openToast({
        status: true,
        message: err?.response?.data?.detail || "Something went wrong.",
        type: "error",
      });
    }
  };

  const onDeleteSubmit = async (user: any) => {
    try {
      await DeleteMember(user.id);
      fetchMembers(searchValue);
    } catch (err: any) {
      console.error(err);
      dispatch.toast.openToast({
        status: true,
        message: err?.response?.data?.detail || "Could not remove this member.",
        type: "error",
      });
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setSearchValue(searchTerm);
      fetchMembers(searchTerm);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full gap-8">
      {toastStatus.status && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
          <Toast type="error" />
        </div>
      )}

      <div className="mx-8 flex mt-4 flex-col sm:flex-row sm:justify-between">
        <div className="flex flex-col">
          <Text className="text-[#091E42] ml-1" type="header2">
            Members
          </Text>
          <Text type="small" className="text-faint_text mt-1">
            ({data.length} {data.length === 1 ? "Result" : "Results"})
          </Text>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {legalCheckerMemberDetails?.role === "OWNER" && (
            <button
              onClick={() => dispatch.modal.openAddMember("add")}
              className="bg-danger w-24 h-10 flex items-center justify-center gap-2 rounded-lg text-white"
            >
              <img src={AddIcon} alt="add" loading="lazy" />
              <Text type="small">Add</Text>
            </button>
          )}

          <Input
            onChange={onSearchChange}
            prefixIcon={<img src={SearchIcon} alt="search" loading="lazy" />}
            placeholder="Search"
            fixed_size="large"
          />
        </div>
      </div>

      <div className="md:mx-16 mx-4 mt-2 flex-1 min-h-0 overflow-y-auto">
        {data.length > 0 ? (
          <UserTable data={data} onSubmit={onSubmit} onDeleteSubmit={onDeleteSubmit} />
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