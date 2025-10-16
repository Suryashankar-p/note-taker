import "../styles.css";
import Text from "../../../components/Text";
import Button from "../../../components/Button";
import AddIcon from "../../../assets/circle_plus.svg";
import Input from "../../../components/Input";
import SearchIcon from "../../../assets/search_icon.svg";
import DropDownMenu from "../../../components/DropdownMenu";
import Menu from "../../../assets/more.svg";
import Edit from "../../../assets/edit.svg";
import Trash from "../../../assets/trash.svg";
import { useEffect, useRef, useState } from "react";
import Link from "../../../assets/link.svg";
import Attach from "../../../assets/attachment.svg";
import LoaderIcon from "../../../components/LoaderIcon";
import Line from "../../../assets/line .svg";
import FileEditModal from "../../../components/Modals/FileEditModalDoctorConBot.tsx";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import AddcategoryModal, {
  DefaultValue,
} from "../../../components/Modals/AddProductModalDoctorConBot.tsx";
import NoData from "../../../assets/no_data";
import {
  CreateCategory,
  CreateCategoryDocument,
  // EditcategoryDocument,
  DeleteCategory,
  DeleteCategoryDocument,
  ReadCategoryDocumentUrl,
  ReadCategoryDocuments,
  ReadCategories,
  // Updatecategory,
  PollDocumentStatus,
  getFileBlobUrl,
  PollCategoryDocumentStatus,
} from "../../../services/doctor_conbot.ts";
import ConfirmationModal from "../../../components/Modals/ConfirmationModal";
import Toast from "../../../components/Toast";
import { getFileType } from "../../../utils/functions.ts";
import FileViewModal from "../../../components/Modals/FileViewModal.tsx";

const MenuItems = [
  // {
  //   title: "Edit",
  //   component: <img src={Edit} alt="edit" loading="lazy" />,
  // },
  {
    title: "Delete",
    component: <img src={Trash} alt="trash" loading="lazy" />,
  },
];

type CurrentPage = "CATEGORIES" | "SUBPACKAGE";

interface categorysProps {
  onSwitch: (page: "CATEGORIES" | "SUBPACKAGE", data?: any) => void;
}

const categorys: React.FC<categorysProps> = ({ onSwitch }) => {
  const [filesExpanded, setFilesExpanded] = useState<number | null>(null);
  const isOpen = useSelector((state: RootState) => state.modal.addProduct);
  const fileUpload = useSelector((state: RootState) => state.modal.isOpen);
  const [categorys, setcategorys] = useState([]);
  const [files, setFiles] = useState<any>();
  const [defaultcategory, setDefaultcategory] = useState<any>();
  const member = useSelector((state: RootState) => state.memberRole);
  const doctorConBotMemberDetails =
    member.service === "doctor_conbot" ? member?.details : {};
  const dispatch = useDispatch<Dispatch>();
  let timeoutId: NodeJS.Timeout | null = null;
  const confirmationStatus = useSelector(
    (state: RootState) => state.modal.confirmation
  );
  const [categoryTotal, setcategoryTotal] = useState(0);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [defaultcategoryDocument, setDefaultcategoryDocument] = useState<any>();
  const [deleteType, setDeleteType] = useState<string | null>();
  const [fileUrl, setFileUrl] = useState();
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
  const [pollStatus, setPollStatus] = useState("PENDING");
  const [documentStatuses, setDocumentStatuses] = useState({});
  const pollingIntervalsRef = useRef<Record<number, NodeJS.Timeout>>({});
  const [currentPage, setCurrentpage] = useState<CurrentPage>("CATEGORIES");
  const [categoryDetails, setCategoryDetails] = useState<any>({});

  useEffect(() => {
    getAllCategories(pageSize.skip, pageSize.limit, "");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const THRESHOLD = 0.98;
      if ((scrollTop + clientHeight) / scrollHeight >= THRESHOLD && !loading) {
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
  }, [loading]);

  const loadMore = async (skip: number, limit: number) => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const categoryResponse = await ReadCategories(skip, limit, searchTerm);
      if (categoryResponse?.result) {
        setcategorys((prevcategorys) => [
          ...prevcategorys,
          ...categoryResponse?.result,
        ]);
        setLoading(false);
      } else {
        setPageError(true);
        if (categoryResponse?.detail)
          dispatch.toast.openToast({
            status: true,
            message: categoryResponse?.detail,
          });
        setLoading(false);
      }
    } catch (err) {
      console.log("errr", err);
      setLoading(false);
    }
    setIsLoadingMore(false);
  };
  const hasMorecategorys = categorys.length < categoryTotal;

  const getAllCategories = async (
    skip: number,
    limit: number,
    search_term: string
  ) => {
    try {
      const categoryResponse = await ReadCategories(skip, limit, search_term);
      if (categoryResponse?.result) {
        setcategorys(categoryResponse?.result);
        setcategoryTotal(categoryResponse?.total);
      } else {
        setPageError(true);
        if (categoryResponse?.detail)
          dispatch.toast.openToast({
            status: true,
            message: categoryResponse?.detail,
          });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const onCategoryOnChange = (item: any, title: string) => {
    setDefaultcategory(item);
    if (title === "Edit") {
      dispatch.modal.openAddProduct("edit");
    } else if (title === "Delete") {
      setDeleteType("category");
      dispatch.modal.openConfirmation();
    }
  };

  const onCategoryCreate = async (data: any) => {
    if (data) {
      let body = {
        title: data?.title,
        other_names: data?.other_names ? data?.other_names : "",
        description: data?.description,
      };
      try {
        const createResponse = await CreateCategory(body);
        if (createResponse?.id) {
          getAllCategories(0, 20, "");
          dispatch.modal.closeAddProduct();
        } else {
          setPageError(true);
          if (createResponse?.detail)
            dispatch.toast.openToast({
              status: true,
              message: createResponse?.detail,
            });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("error");
    }
  };

  // const onProductEdit = async (data: any) => {
  //   if (data) {
  //     try {
  //       const editResponse = await UpdateProduct(
  //         data?.id,
  //         data?.title,
  //         data?.short_title,
  //         data?.description
  //       );
  //       if (editResponse?.id) {
  //         getAllProducts(0, 20, "");
  //         dispatch.modal.closeAddProduct();
  //       } else {
  //         setPageError(true);
  //         if (editResponse?.detail)
  //           dispatch.toast.openToast({
  //             status: true,
  //             message: editResponse?.detail,
  //           });
  //       }
  //     } catch (err) {
  //       console.log("err", err);
  //     }
  //   } else {
  //     console.log("errror");
  //   }
  // };
  const onSubmit = (data: any) => {
    if (isOpen?.type === "edit") {
      // onProductEdit(data);
    } else if (isOpen?.type === "add") {
      onCategoryCreate(data);
    }
  };

  const onDeleteSubmit = async (value: any) => {
    if (value?.id) {
      try {
        await DeleteCategory(value?.id);
        getAllCategories(0, 20, "");
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Failed");
    }
  };
  const getCategoryDocuments = async (
    category_id: number | string,
    skip: number,
    limit: number,
    search_term: string
  ) => {
    try {
      const resp = await ReadCategoryDocuments(
        category_id,
        skip,
        limit,
        search_term
      );
      if (resp?.result) {
        setFiles(resp.result);
        return resp.result;
      } else {
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: resp?.detail });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const deletecategoryFile = async (
    category_id: string | number,
    file_id: string | number
  ) => {
    try {
      const resp = await DeleteCategoryDocument(category_id, file_id);
      getCategoryDocuments(category_id, 0, 100, "");
      getAllCategories(0, 20, "");
    } catch (err) {
      console.log("err", err);
    }
  };

  const expandFiles = async (key: number, item: any) => {
    if (filesExpanded === key) setFilesExpanded(null);
    else {
      setFilesExpanded(key);

      try {
        const documents = await getCategoryDocuments(item?.id, 0, 100, ""); // Await the result

        if (documents && Array.isArray(documents)) {
          documents.forEach((doc) => {
            if (doc.id) {
              // checkDocumentStatus(doc.id);
              checkDocumentStatus(doc.category_id, doc.id);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }

      setTimeout(() => {
        const categoryElement = document.getElementById(`category-${key}`);
        if (categoryElement && scrollRef.current) {
          const scrollContainer = scrollRef.current;
          const containerTop = scrollContainer.getBoundingClientRect().top;
          const elementTop = categoryElement.getBoundingClientRect().top;
          scrollContainer.scrollBy({
            top: elementTop - containerTop - 50,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setSearchTerm(searchTerm);
      getAllCategories(
        0,
        pageSize?.skip === 0 ? pageSize?.limit : pageSize?.skip,
        searchTerm
      );
    }, 500); // Adjust the delay time (in milliseconds) as needed
  };

  const onFileUpload = async (data: any) => {
    if (data && defaultcategory?.id) {
      dispatch.loadingState.startLoading();
      try {
        const file = data?.file || null;
        const description = data?.description || null;
        const kind = file ? data?.fileType : defaultcategoryDocument?.kind; // Retain current kind if no file is uploaded

        const response = await CreateCategoryDocument(
          defaultcategory?.id,
          description,
          kind,
          file,
        )

        if (response?.id) {
          dispatch.modal.closeModal();
          getCategoryDocuments(defaultcategory?.id, 0, 100, "");
          getAllCategories(0, 50, "");
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
    setDefaultcategoryDocument(item);
    if (type === "Delete") {
      setDeleteType("file");
      dispatch.modal.openConfirmation();
    }
    if (type === "Edit") {
      dispatch.modal.openModal("edit");
    }
  };

  const onFileClick = async (file: any) => {
    try {
      const linkResp = await ReadCategoryDocumentUrl(file.category_id, file.id);
      if (linkResp) {
        if (linkResp?.type === "base64") {
          let fileInfo: any = {
            name: file.filename,
            type: getFileType(file?.filename),
            url: linkResp?.link,
          };
          setFileData(fileInfo);
          setFileShow(true);
        } else {
          const response: any = await getFileBlobUrl(file)
          const blobUrl = URL.createObjectURL(response.data);
          console.log(blobUrl)
          let fileInfo: any = {
            name: file.filename,
            type: getFileType(file?.filename),
            url: blobUrl,
          };
          setFileData(fileInfo);
          setFileShow(true);
        }
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

  // Function to check document status with proper polling
  const checkDocumentStatus = async (categoryId, documentId) => {
    // Clear any existing polling for this document
    if (pollingIntervalsRef.current[documentId]) {
      clearInterval(pollingIntervalsRef.current[documentId]);
    }

    // Set initial status to PENDING
    setDocumentStatuses((prev) => ({
      ...prev,
      [documentId]: "COMPLETED",
    }));

    // Create a new polling interval
    const pollingInterval = setInterval(async () => {
      try {
        const response = await PollCategoryDocumentStatus(categoryId, documentId);

        if (response.status === "COMPLETED") {
          // Update status to COMPLETED
          setDocumentStatuses((prev) => ({
            ...prev,
            [documentId]: "COMPLETED",
          }));

          // Clear this polling interval
          clearInterval(pollingInterval);
          delete pollingIntervalsRef.current[documentId];
        } else {
          // Ensure status remains PENDING if not completed
          setDocumentStatuses((prev) => ({
            ...prev,
            [documentId]: "PENDING",
          }));
        }
      } catch (error) {
        console.error(`Error polling document ${documentId} status:`, error);
      }
    }, 5000);

    // Store the interval reference for cleanup
    pollingIntervalsRef.current[documentId] = pollingInterval;
  };
  // Clean up all polling intervals when component unmounts
  useEffect(() => {
    return () => {
      Object.values(pollingIntervalsRef.current).forEach((interval: any) => {
        clearInterval(interval);
      });
    };
  }, []);

  const onCategoryClicked = (categoryDetails: any) => {
    onSwitch("SUBPACKAGE", categoryDetails);
  };

  return (
    <div className="flex h-screen w-full flex-col gap-8  overflow-y-hidden max-h-[800px]">
      {isOpen.status && (
        <AddcategoryModal
          onSubmit={onSubmit}
          defaultValue={defaultcategory}
          modalType="CATEGORY"
        />
      )}
      {confirmationStatus && deleteType === "category" && (
        <ConfirmationModal
          onSubmit={() => onDeleteSubmit(defaultcategory)}
          title="Remove category"
          content="Are you sure you want to remove this category?"
        />
      )}
      {confirmationStatus && deleteType === "file" && (
        <ConfirmationModal
          onSubmit={() =>
            deletecategoryFile(
              defaultcategoryDocument?.product_id,
              defaultcategoryDocument?.id
            )
          }
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
      <div className="mx-16 lg:mx-16 flex mt-1 flex-col sm:flex-row sm:justify-between">
        <div className="flex flex-col">
          <Text className="text-[#091E42] ml-1" type="header2">
            Categories
          </Text>
          {categorys && (
            <Text type="small" className="text-faint_text ml-1">{`(${
              categorys?.length > 1
                ? categorys?.length + " Results"
                : categorys?.length + " Result"
            } of ${categoryTotal})`}</Text>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-5 mt-1 sm:mt-0 lg:mr-4">
          {doctorConBotMemberDetails?.role === "OWNER" && (
            <Button
              onClick={() => {
                dispatch.modal.openAddProduct("add");
                setDefaultcategory(undefined);
              }}
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
            fixed_size={"large"}
          />
        </div>
      </div>
      <div
        ref={scrollRef}
        className=" self-center h-fit items-center overflow-y-scroll w-full flex flex-col mb-10 gap-2 "
      >
        {categorys?.length > 0 ? (
          categorys.map((item: any, key: number) => (
            <div
              id={`category-${key}`}
              key={key}
              className="w-full sm:w-[73vw] h-fit rounded-lg shadow-custom self-center flex flex-col border hover:border-red-500 cursor-pointer"
              onClick={() => onCategoryClicked(item)}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-8 pt-3">
                <Text
                  title={item?.title}
                  className="max-w-full sm:max-w-[60vw] text-ellipsis overflow-hidden whitespace-nowrap"
                  type="header3"
                >
                  {item.title}
                </Text>
                {doctorConBotMemberDetails?.role === "OWNER" && (
                  <DropDownMenu
                    onChange={(title: string) => {
                      onCategoryOnChange(item, title);
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

              <div className="px-8 flex-row">
                <div className="flex flex-row flex-wrap gap-2 my-2">
                  {item?.other_names.map((name:string, key: number) => (
                  <Text key={key} className="text-[#505F79] border rounded-full bg-gray-200 max-w-fit text-[12px] line-clamp-3 px-2 ">
                    {name}
                  </Text>))
                  }
                </div>
                <Text
                  title={item?.description}
                  className="text-[#505F79] max-w-full sm:mr-[20vw] text-[12px] line-clamp-3"
                >
                  {item.description}
                </Text>
              </div>

              <div className="my-2 gap-2 mb-4 px-8 mt-[2vh] flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    expandFiles(key, item);
                  }}
                  className="w-28 h-10 rounded-full bg-[#F3F1FF]"
                >
                  <Text className="text-[#0061F3] text-[16px] leading-[18px]">
                    {filesExpanded === key ? "Hide files" : "View files"}
                  </Text>
                </button>
                <button
                  disabled
                  className="w-10 h-10 rounded-full bg-[#ED3438] bg-opacity-10"
                >
                  <Text className="text-danger" type="body">
                    {item?.total_document}
                  </Text>
                </button>
                {doctorConBotMemberDetails?.role === "OWNER" && (
                  <div className="flex flex-row items-center ml-auto">
                    <label
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch.modal.openModal("add");
                        setDefaultcategory(item);
                        setDefaultcategoryDocument(null);
                      }}
                      htmlFor="file-upload"
                      className="w-36 h-10 rounded-full bg-[#F3F1FF] flex items-center justify-center cursor-pointer"
                    >
                      <img src={Attach} alt="attach" className="w-5 h-5" />
                      <Text className="text-primary_text">Attach files</Text>
                    </label>
                  </div>
                )}
              </div>
              {filesExpanded === key && (
                <div className="flex flex-col">
                  <div className="bg-[#D9D9D9] h-[1px] w-full sm:w-[68vw] mx-5 mt-[3vh]"></div>
                  <div className="flex flex-col sm:flex-row justify-between items-center my-[2vh] px-5">
                    <div className="flex flex-col sm:flex-row w-3/4 relative flex-wrap">
                      {files?.length > 0 ? (
                        files.map((fileItem: any, key2: number) => (
                          <div
                            key={key2}
                            className="flex flex-col items-center"
                          >
                            <div className="flex gap-4 flex-row items-center justify-center mt-2 sm:mt-0">
                              {doctorConBotMemberDetails?.role === "OWNER" && (
                                <button
                                  title="Click to open/download"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFileClick(fileItem);
                                    setFileName(fileItem?.filename);
                                  }}
                                  className="flex border rounded-full my-4 w-max h-10 px-4 py-2"
                                >
                                  {documentStatuses[fileItem.id] ===
                                  "PENDING" ? (
                                    <LoaderIcon size={25} color="#42526e" />
                                  ) : (
                                    <img
                                      src={Link}
                                      alt="Document"
                                      loading="lazy"
                                    />
                                  )}
                                  <Text className="text-primary_text">
                                    {fileItem?.filename}
                                  </Text>
                                </button>
                              )}
                              {doctorConBotMemberDetails?.role === "OWNER" && (
                                <DropDownMenu
                                  content={
                                    <img
                                      className="h-45 w-45 absolute mt-1 right-3 ml-2"
                                      src={Menu}
                                      alt="menu"
                                      loading="lazy"
                                    />
                                  }
                                  menuItems={MenuItems}
                                  onChange={(type: string) => {
                                    fileMenuChange(type, fileItem);
                                    setDefaultcategory(item);
                                  }}
                                />
                              )}
                            </div>
                            {key2 < files.length - 1 && (
                              <div className="w-full flex justify-center">
                                <img
                                  src={Line}
                                  className="h-[1px] w-3/4"
                                  loading="lazy"
                                  alt="line"
                                />
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="absolute left-72 -top-2">
                          <Text type="small" className="text-primary_text">
                            No files added
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {fileUpload.status && (
                <FileEditModal
                  onSubmit={onFileUpload}
                  defaultValues={defaultcategoryDocument}
                  title={isOpen?.type === "add" ? `Add file for ${defaultcategory?.name ?? "the category"}` : "Edit file"}
                />
              )}
              {fileUrl && (
                <FileViewModal
                  fileUrl={fileUrl}
                  isOpen={fileUrl}
                  onClose={() => setFileUrl(null)}
                />
              )}
            </div>
          ))
        ) : (
          <div className="flex justify-center item-center">
            <NoData />
          </div>
        )}
      </div>
      {hasReachedEnd && hasMorecategorys && <p>Loading more...</p>}
    </div>
  );
};

export default categorys;
