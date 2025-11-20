import React, { useState, useEffect, useRef } from "react";
import { Member } from "../../utils/constants";
import Text from "../../components/Text";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import SearchIcon from "../../assets/search_icon.svg";
import Input from "../../components/Input";
import UserTable from "../../components/Table";
import {
  CreateOCRMember,
  DeleteOCRMember,
  GetBaanData,
  GetHeatingOCRRole,
  ReadOCRMembers,
  UpdateOCRMember,
} from "../../services/heating_ocr.ts";
import NoData from "../../assets/no_data.tsx";
import Toast from "../../components/Toast.tsx";

const BaanTable: React.FC = () => {
  const [baanData, setBaanData] = useState<Member[]>([]);
  const dispatch = useDispatch<Dispatch>();
  const [baanTotal, setBaanTotal] = useState<number>(0);
  const [pageError, setPageError] = useState<boolean>(false);
  const [loading, setLoading] = useState(false); // Track loading state
  const [hasMore, setHasMore] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  let timeoutId: NodeJS.Timeout | null = null;
  const toastStatus = useSelector((state: RootState) => state.toast);
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref for scroll container

  useEffect(() => {
    getAllBaanData(0, 50, "");
  }, []);

  const getAllBaanData = async (
    skip: number,
    limit: number,
    search_term?: string
  ) => {
    try {
      const response = await GetBaanData(skip, limit, search_term);
      if (response?.result) {
        setBaanData((prevData) =>
          skip === 0 ? response?.result : [...prevData, ...response?.result]
        );
        setBaanTotal(response?.total);
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
      setPageError(true);
      dispatch.toast.openToast({
        status: true,
        message: "Error fetching data",
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
      getAllBaanData(0, 50, searchTerm);
    }, 500); 
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollContainerRef.current;
      if (scrollTop + clientHeight >= scrollHeight && !loading && hasMore) {
        getAllBaanData(baanData.length, 50, searchValue); 
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      {toastStatus.status && pageError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      <div className="flex flex-col flex-1 mt-30 w-full p-6 h-screen pb-20">
        <div className="flex flex-row justify-between items-center">
          <div>
            <Text className="text-2xl font-bold ml-1" type="header2">
              BAAN
            </Text>
            {baanData && (
              <Text type="small" className="text-faint_text ml-1">{`(${
                baanData?.length > 1
                  ? baanData?.length + " Results"
                  : baanData?.length + " Result"
              } of ${baanTotal})`}</Text>
            )}
          </div>
          <div className="flex items-center space-x-5">
            <Input
              onChange={onSearchChange}
              prefixIcon={<img src={SearchIcon} alt="search" loading="lazy" />}
              placeholder="Search"
              fixed_size={"large"}
            />
          </div>
        </div>
        <div
          className="flex-1 mt-8 pr-4 w-full overflow-y-auto"
          style={{ height: "calc(100vh - 150px)" }}
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {baanData.length > 0 ? (
            <UserTable data={baanData} type="baan" />
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

export default BaanTable;
