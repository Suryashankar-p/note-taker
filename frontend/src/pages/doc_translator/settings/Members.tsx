import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Text from "../../../components/Text";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import UserTable from "../../../components/Table";
import Toast from "../../../components/Toast";
import NoData from "../../../assets/no_data";

import AddIcon from "../../../assets/circle_plus.svg";
import SearchIcon from "../../../assets/search_icon.svg";

import {
  ReadMembers,
  CreateMember,
  UpdateMember,
  DeleteMember,
  GetTranslatorRole,
} from "../../../services/doc_translator";

import { Dispatch, RootState } from "../../../redux/store";

const Members: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // ===== Redux state =====
  const memberRole = useSelector((state: RootState) => state.memberRole);
  const modalType = useSelector(
    (state: RootState) => state.modal.addMember.type
  );
  const toastStatus = useSelector((state: RootState) => state.toast);

  const translatorMemberDetails =
    memberRole.service === "doc_translator" ? memberRole.details : {};

  // ===== Fetch role (once) =====
  const setTranslatorRole = async () => {
    try {
      const response = await GetTranslatorRole();
      if (response?.data?.id) {
        dispatch.memberRole.setRole({
          service: "doc_translator",
          details: response.data,
        });
      }
    } catch (err) {
      console.error(err);
      setPageError(true);
    }
  };

  // ===== Fetch members =====
  const fetchMembers = async (search_term = "") => {
    try {
      setLoading(true);
      const response = await ReadMembers(0, 100, search_term);

      if (response?.result) {
        setData(response.result);
      } else {
        setData([]);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setPageError(true);
    }
  };

  // ===== Lifecycle =====
  useEffect(() => {
    setTranslatorRole();
    fetchMembers("");
  }, []);

  // ===== Modal submit handler =====
  const onSubmit = async (payload: any) => {
    try {
      if (modalType === "edit") {
        await UpdateMember(payload.role, payload.name, payload.memberId);
      } else if (modalType === "add") {
        await CreateMember(payload.role, payload.email, payload.name);
      }
      dispatch.modal.closeAddMember();
      fetchMembers(searchValue);
    } catch (err) {
      console.error(err);
      setPageError(true);
    }
  };

  // ===== Delete handler =====
  const onDeleteSubmit = async (user: any) => {
    try {
      await DeleteMember(user.id);
      fetchMembers(searchValue);
    } catch (err) {
      console.error(err);
      setPageError(true);
    }
  };

  // ===== Search =====
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setSearchValue(searchTerm);
      fetchMembers(searchTerm);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full gap-8 overflow-y-hidden">
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
          {translatorMemberDetails?.role === "OWNER" && (
            <Button
              onClick={() => dispatch.modal.openAddMember("add")}
              custom_type="danger"
              className="bg-danger w-24 h-10 p-2 gap-2 rounded-lg"
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

      <div className="md:mx-16 mx-4 mt-2 max-h-[70vh] overflow-y-auto">
        {data.length > 0 ? (
          <UserTable
            data={data}
            onSubmit={onSubmit}
            onDeleteSubmit={onDeleteSubmit}
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