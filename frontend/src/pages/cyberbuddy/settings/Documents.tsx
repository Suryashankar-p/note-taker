import "../styles.css";
import Text from "../../../components/Text.tsx";
import Button from "../../../components/Button.tsx";
import AddIcon from "../../../assets/circle_plus.svg";
import Input from "../../../components/Input.tsx";
import Link from "../../../assets/link.svg";
import SearchIcon from "../../../assets/search_icon.svg";
import DropDownMenu from "../../../components/DropdownMenu.tsx";
import Menu from "../../../assets/more.svg";
import Edit from "../../../assets/edit.svg";
import LoaderIcon from "../../../components/LoaderIcon.tsx";
import Trash from "../../../assets/trash.svg";
import { useEffect, useRef, useState } from "react";
import AddDocumentsModal from "../../../components/Modals/AddDocumentsModal.tsx";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store.ts";
import NoData from "../../../assets/no_data.tsx";
import {
  CreateDocument,
  ReadDocument,
  ReadDocuments,
  DeleteDocument,
  PollDocumentStatus,
  ReadDocumentUrl,
} from "../../../services/cyberbuddy.ts";
import ConfirmationModal from "../../../components/Modals/ConfirmationModal.tsx";
import Toast from "../../../components/Toast.tsx";
import { getFileType } from "../../../utils/functions.ts";
import FileViewModal from "../../../components/Modals/FileViewModal.tsx";

const MenuItems = [
  {
    title: "Edit",
    component: <img src={Edit} alt="edit" loading="lazy" />,
  },
  {
    title: "Delete",
    component: <img src={Trash} alt="trash" loading="lazy" />,
  },
];

const Documents = () => {
  const fileUpload = useSelector((state: RootState) => state.modal.isOpen);
  const [files, setFiles] = useState<any[]>([]);
  const [defaultProduct, setDefaultProduct] = useState<any>();
  const member = useSelector((state: RootState) => state.memberRole);
  const CyberBuddyMemberDetails =
    member.service === "cyberbuddy" ? member?.details : {};
  const dispatch = useDispatch<Dispatch>();
  let timeoutId: NodeJS.Timeout | null = null;
  const confirmationStatus = useSelector(
    (state: RootState) => state.modal.confirmation
  );
  const [documentsTotal, setDocumentsTotal] = useState(0);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [defaultProductDocument, setDefaultProductDocument] = useState<any>();
  const [deleteType, setDeleteType] = useState<string | null>();
  const [fileName, setFileName] = useState<string | null>();
  const scrollRef = useRef(null);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pageError, setPageError] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileShow, setFileShow] = useState(false);
  const [fileData, setFileData] = useState();
  const [status, setStatus] = useState("PENDING");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    getDocuments(pageSize.skip, pageSize.limit, "");
  }, []);

  const loadMore = async (skip: number, limit: number) => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const documentsResponse = await ReadDocuments(skip, limit, searchTerm);
      if (documentsResponse?.result) {
        const newDocuments = documentsResponse.result
        setFiles((prevFiles) => [...prevFiles, ...newDocuments]);
        setDocumentsTotal(documentsResponse?.total);
        setLoading(false);
      } else {
        setPageError(true);
        if (documentsResponse?.detail)
          dispatch.toast.openToast({
            status: true,
            message: documentsResponse?.detail,
          });
        setLoading(false);
      }
    } catch (err) {
      console.log("errr", err);
      setLoading(false);
    }
    setIsLoadingMore(false);
  };

  const tabs = [
    { id: 0, label: "All", kind: null },
    { id: 1, label: "Policy", kind: "POLICY" },
    { id: 2, label: "Procedure", kind: "PROCEDURE" },
    { id: 3, label: "Guidelines", kind: "GUIDELINES" },
    { id: 4, label: "Others", kind: "OTHERS" },
  ];

  const getFilteredFiles = () => {
    if (selectedIndex === 0) {
      return files;
    }
    
    const selectedTab = tabs[selectedIndex];
    return files.filter((file) => file.kind === selectedTab.kind);
  };

  const filteredFiles = getFilteredFiles();
  const filteredTotal = filteredFiles.length;
  const hasMoreDocuments = (files?.length || 0) < documentsTotal;  

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (
        scrollTop + clientHeight >= scrollHeight &&
        !loading &&
        hasMoreDocuments
      ) {
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
  }, [loading, hasMoreDocuments]);

  const getDocuments = async (
    skip: number,
    limit: number,
    search_term: string
  ) => {
    try {
      const resp = await ReadDocuments(skip=0, limit=100, search_term);
      if (resp?.result) {
        setDocumentsTotal(resp?.total || 0);
        setFiles(resp.result || []);
      } else {
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: resp?.detail });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const deleteProductFile = async (file_id: string | number) => {
    try {
      const resp = await DeleteDocument(file_id);
      getDocuments(0, 100, "");
    } catch (err) {
      console.log("err", err);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setSearchTerm(searchTerm);
      getDocuments(
        0,
        pageSize?.skip === 0 ? pageSize?.limit : pageSize?.skip,
        searchTerm
      );
    }, 500); // Adjust the delay time (in milliseconds) as needed
  };

  const onFileUpload = async (data: { file: File; kind: string }) => {
    if (!data) return;
    dispatch.loadingState.startLoading();
    try {
      console.log("onFileUpload called with data:", data);
      const response = await CreateDocument(data.kind, data.file);

      if (response?.id) {
        dispatch.modal.closeModal();
        CheckDocumentStatus(response.id);
        getDocuments(0, 100, "");
      }
    } catch (err: any) {
      console.error("Error in onFileUpload:", err);
      const error_message = err?.response?.data?.detail || "An unexpected error occurred";
      dispatch.toast.openToast({ status: true, message: error_message });
      setPageError(true);
    } finally {
      dispatch.loadingState.endLoading();
    }
  };

  const fileMenuChange = (type: string, item: any) => {
    setDefaultProductDocument(item);
    if (type === "Delete") {
      setDeleteType("file");
      dispatch.modal.openConfirmation();
    }
    if (type === "Edit") {
      dispatch.modal.openModal("edit");
    }
  };
  
  const handleFileView = (fileUrl) => {
    setFileData(fileUrl);
    setFileShow(true);
  };

  const onFileClick = async (file: any) => {
    try {
      const linkResp = await ReadDocumentUrl(file.id);

      if (linkResp?.link) {
        let fileInfo: any = {
          name: file.filename,
          type: getFileType(file?.filename),
          url: linkResp?.link,
        };
        setFileData(fileInfo);
        setFileShow(true);
      } else {
        dispatch.toast.openToast({
          status: true,
          message: "File not found",
          type: "error",
        });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const CheckDocumentStatus = async (product_document_id) => {
    const polling = setInterval(async () => {
      try {
        const response = await PollDocumentStatus(product_document_id);
        if (response.status === "COMPLETED") {
          setStatus("COMPLETED");
          getDocuments(pageSize.skip, pageSize.limit, "");
          clearInterval(polling);
        }
      } catch (error) {
        console.error("Error polling document status:", error);
      }
    }, 5000);

    return () => clearInterval(polling);
  };

  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col gap-8  overflow-y-hidden">
      {confirmationStatus && deleteType === "file" && (
        <ConfirmationModal
          onSubmit={() => deleteProductFile(defaultProductDocument?.id)}
          title="Remove File"
          content="Are you sure you want to remove this file?"
        />
      )}
      {toastStatus.status && pageError && (
        <div className="fixed top-15 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      {fileShow && (
        <FileViewModal
          fileUrl={fileData}
          isOpen={fileShow}
          onClose={() => setFileShow(false)}
        />
      )}
      <div className="mx-16 flex mt-1 flex-col sm:flex-row sm:justify-between">
        <div className="flex flex-col">
          <Text className="text-[#091E42] ml-1" type="header2">
            Documents
          </Text>

          {files && (
            <Text type="small" className="text-faint_text ml-1">{`(${
              filteredTotal > 1
                ? filteredTotal + " Results"
                : filteredTotal + " Result"
            } of ${selectedIndex === 0 ? documentsTotal : filteredTotal})`}</Text>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-5 mt-1 sm:mt-0">
          {CyberBuddyMemberDetails?.role === "OWNER" && (
            <Button
              onClick={() => {
                dispatch.modal.openModal("add");
                setDefaultProductDocument(null);
              }}
              custom_type="danger"
              className="bg-danger w-20 h-10 p-2 gap-2 rounded-lg"
              size="custom"
            >
              <img src={AddIcon} alt="add" loading="lazy" />
              <Text type="small">Add</Text>
            </Button>
          )}
          {fileUpload.status && (
            <AddDocumentsModal
              onSubmit={onFileUpload}
              defaultValues={defaultProductDocument}
            />
          )}
          <Input
            onChange={onSearchChange}
            prefixIcon={<img src={SearchIcon} alt="search" loading="lazy" />}
            placeholder="Search"
            fixed_size={"large"}
          />
        </div>
      </div>
      
      <div className="w-full flex border-b border-gray-300 self-center gap-4 px-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(index)}
            className={`relative px-6 py-2 text-sm font-medium tracking-wide transition-all duration-300 ease-in-out ${
              selectedIndex === index
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="self-center h-fit items-center overflow-y-scroll w-full flex flex-col mb-20 gap-4"
      >
        {filteredFiles?.length > 0 ? (
          filteredFiles.map((item: any, key: number) => (
            <div
              id={`file-${key}`}
              key={key}
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 p-6 w-[900px] h-[90px] flex justify-between items-center"
            >
              {item.status === "COMPLETED" ? (
                <img src={Link} alt="Document" loading="lazy" />
              ) : (
                <LoaderIcon size={25} color="#42526e" />
              )}
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-lg text-gray-900 truncate">
                  {item?.filename}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {CyberBuddyMemberDetails?.role === "OWNER" && (
                  <button
                    onClick={() => {
                      onFileClick(item);
                      setFileName(item?.filename);
                    }}
                    className="w-28 h-10 rounded-full bg-[#F3F1FF]"
                  >
                    <Text className="text-[#0061F3] text-[16px] leading-[18px]">
                      View File
                    </Text>
                  </button>
                )}
                {CyberBuddyMemberDetails?.role === "OWNER" && (
                  <DropDownMenu
                    onChange={(type: string) => {
                      fileMenuChange(type, item);
                      setDefaultProductDocument(item);
                    }}
                    content={
                      <img
                        src={Menu}
                        className="w-9 h-9"
                        alt="menu"
                        loading="lazy"
                      />
                    }
                    menuItems={MenuItems}
                  />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center">
            <NoData />
          </div>
        )}
      </div>
      {hasReachedEnd && hasMoreDocuments && <p>Loading more...</p>}
    </div>
  );
};

export default Documents;