import "../styles.css";
import Text from "../../../components/Text.tsx";
import Button from "../../../components/Button.tsx";
import AddIcon from "../../../assets/circle_plus.svg";
import Input from "../../../components/Input.tsx";
import Link from "../../../assets/link.svg";
import SearchIcon from "../../../assets/search_icon.svg";
import DropDownMenu from "../../../components/DropdownMenu.tsx";
import Menu from "../../../assets/more.svg";
import LoaderIcon from "../../../components/LoaderIcon";
import Trash from "../../../assets/trash.svg";
import { useEffect, useRef, useState } from "react";
import AddFaqModal from "../../../components/Modals/AddFaqModal.tsx";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store.ts";
import NoData from "../../../assets/no_data.tsx";
import {
  CreateFaqDocument,
  ReadFaqDocuments,
  ReadFaqDocumentUrl,
  DeleteFaqDocument,
  PollDocumentStatus,
} from "../../../services/doctor_conbot.ts";
import ConfirmationModal from "../../../components/Modals/ConfirmationModal.tsx";
import Toast from "../../../components/Toast.tsx";
import { getFileType } from "../../../utils/functions.ts";
import FileViewModal from "../../../components/Modals/FileViewModal.tsx";

const MenuItems = [
  {
    title: "Delete",
    component: <img src={Trash} alt="trash" loading="lazy" />,
  },
];

const Faq = () => {
  const fileUpload = useSelector((state: RootState) => state.modal.isOpen);
  const [files, setFiles] = useState<any[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<any>();
  const member = useSelector((state: RootState) => state.memberRole);
  const doctorConBotMemberDetails =
    member.service === "doctor_conbot" ? member?.details : {};
  const dispatch = useDispatch<Dispatch>();
  let timeoutId: NodeJS.Timeout | null = null;
  const confirmationStatus = useSelector(
    (state: RootState) => state.modal.confirmation
  );
  const [faqTotal, setFaqTotal] = useState(0);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [defaultCategoryDocument, setDefaultCategoryDocument] = useState<any>();
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
  useEffect(() => {
    getFaqDocuments(pageSize.skip, pageSize.limit, "");
  }, []);

  const loadMore = async (skip: number, limit: number) => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const faqResponse = await ReadFaqDocuments(skip, limit, searchTerm);
      if (faqResponse?.result) {
        const newFaqDocuments = faqResponse.result.filter(
          (doc: { kind?: string }) => doc.kind === "FAQ"
        );
        setFiles((prevFiles) => [...prevFiles, ...newFaqDocuments]);
        setFaqTotal(faqResponse?.total);
        setLoading(false);
      } else {
        setPageError(true);
        if (faqResponse?.detail)
          dispatch.toast.openToast({
            status: true,
            message: faqResponse?.detail,
          });
        setLoading(false);
      }
    } catch (err) {
      console.log("errr", err);
      setLoading(false);
    }
    setIsLoadingMore(false);
  };

  // Update the hasMoreDocuments check
  const hasMoreDocuments = (files?.length || 0) < faqTotal;
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

  const getFaqDocuments = async (
    skip: number,
    limit: number,
    search_term: string
  ) => {
    try {
      const resp = await ReadFaqDocuments(skip, limit, search_term);
      if (resp?.result) {
        // setFiles(resp.result);
        const faqDocuments = resp.result.filter(
          (doc: { kind?: string }) => doc.kind === "FAQ"
        );
        setFaqTotal(resp?.total || 0);
        setFiles(faqDocuments || []);
      } else {
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: resp?.detail });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const deleteCategoryFile = async (file_id: string | number) => {
    try {
      const resp = await DeleteFaqDocument(file_id);
      getFaqDocuments(0, 100, "");
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
      getFaqDocuments(
        0,
        pageSize?.skip === 0 ? pageSize?.limit : pageSize?.skip,
        searchTerm
      );
    }, 500); // Adjust the delay time (in milliseconds) as needed
  };

  const onFileUpload = async (data: any) => {
    if (data) {
      dispatch.loadingState.startLoading();
      try {
        const file = data?.file || null;
        const description = data?.description || null;
        const filename = file ? file.name : defaultCategoryDocument?.filename; // Use current filename if no file is uploaded

        let response;
          response = await CreateFaqDocument(
            description,
            file,
            defaultCategoryDocument?.id
          );

        if (response?.id) {
          dispatch.modal.closeModal();
          // CheckDocumentStatus(response?.id);
          getFaqDocuments(0, 100, "");
          dispatch.loadingState.endLoading();
        }
      } catch (err: any) {
        console.error("Error in onFileUpload:", err); // Debugging error
        const error_message =
          err?.response?.data?.detail || "An unexpected error occurred";
        dispatch.toast.openToast({ status: true, message: error_message });
        dispatch.loadingState.endLoading();
        setPageError(true);
      }
    }
  };

  const fileMenuChange = (type: string, item: any) => {
    setDefaultCategoryDocument(item);
    if (type === "Delete") {
      setDeleteType("file");
      dispatch.modal.openConfirmation();
    }
  };
  const handleFileView = (fileUrl) => {
    setFileData(fileUrl);
    setFileShow(true);
  };

  const onFileClick = async (file: any) => {
    try {
      const linkResp = await ReadFaqDocumentUrl(file.id);

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

  const CheckDocumentStatus = async (category_document_id) => {
    const polling = setInterval(async () => {
      try {
        const response = await PollDocumentStatus(category_document_id);
        if (response.status === "COMPLETED") {
          setStatus("COMPLETED");
          getFaqDocuments(pageSize.skip, pageSize.limit, "");
          clearInterval(polling);
        }
      } catch (error) {
        console.error("Error polling document status:", error);
      }
    }, 5000);

    return () => clearInterval(polling);
  };
  return (
    <div className="flex h-screen w-full flex-col gap-8  overflow-y-hidden">
      {confirmationStatus && deleteType === "file" && (
        <ConfirmationModal
          onSubmit={() => deleteCategoryFile(defaultCategoryDocument?.id)}
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
            FAQ Documents
          </Text>

          {files && (
            <Text type="small" className="text-faint_text ml-1">{`(${
              files?.length > 1
                ? files?.length + " Results"
                : files?.length + " Result"
            } of ${faqTotal})`}</Text>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-5 mt-1 sm:mt-0">
          {doctorConBotMemberDetails?.role === "OWNER" && (
            <Button
              onClick={() => {
                dispatch.modal.openModal("add");
                setDefaultCategoryDocument(null);
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
            <AddFaqModal
              onSubmit={onFileUpload}
              defaultValues={defaultCategoryDocument}
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

      <div
        ref={scrollRef}
        className="self-center h-fit items-center overflow-y-scroll w-full flex flex-col mb-20 gap-4"
      >
        {files?.length > 0 ? (
          files.map((item: any, key: number) => (
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
                {doctorConBotMemberDetails?.role === "OWNER" && (
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
                {doctorConBotMemberDetails?.role === "OWNER" && (
                  <DropDownMenu
                    onChange={(type: string) => {
                      fileMenuChange(type, item);
                      setDefaultCategoryDocument(item);
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
      {fileShow && (
        <FileViewModal
          fileUrl={fileData}
          isOpen={fileShow}
          onClose={() => setFileShow(false)}
        />
      )}
    </div>
  );
};

export default Faq;
