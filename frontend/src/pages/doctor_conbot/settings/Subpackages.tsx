import React, { useEffect, useRef, useState } from "react";
import Text from "../../../components/Text";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import Button from "../../../components/Button";
import AddIcon from "../../../assets/circle_plus.svg";
import Attach from "../../../assets/attachment.svg";
import {
  CreateCategoryDocument,
  CreateSubpackage,
  CreateSubPackageDocument,
  DeleteCategoryDocument,
  DeleteSubPackage,
  DeleteSubPackageDocument,
  ReadCategoryDocuments,
  ReadSubPackageDocuments,
  ReadSubpackages,
  ReadCategoryDocumentUrl,
  ReadSubpackageDocumentUrl,
  getCategoryFileBlobUrl,
  getSubpackageFileBlobUrl,
  PollSubpackageDocumentStatus,
} from "../../../services/doctor_conbot";
import { getFileType } from "../../../utils/functions.ts";
import AddProductModal from "../../../components/Modals/AddProductModalDoctorConBot";
import FileEditModal from "../../../components/Modals/FileEditModalDoctorConBot";
import FileViewModal from "../../../components/Modals/FileViewModal.tsx";
import DropDownMenu from "../../../components/DropdownMenu";
import Menu from "../../../assets/more.svg";
import Edit from "../../../assets/edit.svg";
import Trash from "../../../assets/trash.svg";
import Line from "../../../assets/line .svg";
import Link from "../../../assets/link.svg";
import Input from "../../../components/Input";
import SearchIcon from "../../../assets/search_icon.svg";
import Usage from "../../../assets/usage.svg";
import ConfirmationModal from "../../../components/Modals/ConfirmationModal";
import internal from "stream";

interface SubpackagesProps {
  onSwitch: (page: "CATEGORIES" | "SUBPACKAGE") => void;
  productData: any;
}

const MenuItems = [
  {
    title: "Delete",
    component: <img src={Trash} alt="trash" loading="lazy" />,
  },
  {
    title: "Open",
    component: (
      <img src={Link} className="text-gray-500" alt="trash" loading="lazy" />
    ),
  },
];

const Subpackages: React.FC<SubpackagesProps> = ({ onSwitch, productData }) => {
  const member = useSelector((state: RootState) => state.memberRole);
  const doctorConBotMemberDetails =
    member.service === "doctor_conbot" ? member?.details : {};
  const dispatch = useDispatch<Dispatch>();
  const [subpackages, setSubpackages] = useState<any>();
  const [files, setFiles] = useState<any[]>([]);
  const [fileShow, setFileShow] = useState(false);
  const [fileData, setFileData] = useState();
  const [pageError, setPageError] = useState<boolean>(false);
  const isAdmin = doctorConBotMemberDetails?.role === "OWNER";
  const fileUpload = useSelector((state: RootState) => state.modal.isOpen);
  const scrollRef = useRef(null);
  const [defaultCategoryDocument, setDefaultCategoryDocument] = useState<any>();
  const [defaultSubPackageDocument, setDefaultSubPackageDocument] =
    useState<any>();
  const [deleteType, setDeleteType] = useState<
    "FILE" | "SUBPACKAGE" | "SUBPACKAGEFILE"
  >();
  const confirmationStatus = useSelector(
    (state: RootState) => state.modal.confirmation
  );
  const [filesExpanded, setFilesExpanded] = useState<number | null>(null);
  const [defaultSubpackage, setDefaultSubpackage] = useState<any>();
  const isOpen = useSelector((state: RootState) => state.modal.addProduct);
  const pollingIntervalsRef = useRef<Record<number, NodeJS.Timeout>>({});
  const [documentStatuses, setDocumentStatuses] = useState({});
  const [fileUploadType, setFileUploadType] = useState<
    "CATEGORY" | "SUBPACKAGE"
  >("CATEGORY");
  const [subpackageFiles, setSubpackageFiles] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 10 });
  const [searchTerm, setSearchTerm] = useState<string>("");
  let timeoutId: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (productData?.id) {
      getCategoryDocuments(productData?.id, 0, 10, "");
      getSubPackages(productData?.id, 0, 20, "");
      console.log(productData);
      
    }
  }, [productData]);

  const getCategoryDocuments = async (
    product_id: number | string,
    skip: number,
    limit: number,
    search_term: string
  ) => {
    try {
      const resp = await ReadCategoryDocuments(
        product_id,
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

  const getSubPackages = async (
    category_id: number | string,
    skip: number,
    limit: number,
    search_term: string
  ) => {
    try {
      const resp = await ReadSubpackages(category_id, skip, limit, search_term);
      if (resp?.result) {
        setSubpackages(resp?.result);
      } else {
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: resp?.detail });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const onSubmit = async (data: any) => {
    let body = {
      title: data?.title,
      other_names: data?.other_names ? data?.other_names : "",
      description: data?.description,
    };
    try {
      const response = await CreateSubpackage(body, productData?.id);
      if (response) {
        getSubPackages(productData?.id, 0, 20, "");
        dispatch.modal.closeAddProduct();
      } else {
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: response?.detail });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const onSubPackageDeleteSubmit = async (subpackageData: any) => {
    if (subpackageData?.id) {
      try {
        await DeleteSubPackage(subpackageData?.category_id, subpackageData?.id);
        getSubPackages(productData?.id, 0, 20, "");
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Failed");
    }
  };

  const getSubPackageDocuments = async(sub_package_id: number | string, skip:number, limit: number, search_term: string = '') => {
    if(sub_package_id){
      try {
        const response = await ReadSubPackageDocuments(sub_package_id, skip, limit, search_term)
        if(response?.result){
          setSubpackageFiles(response?.result)
          return response?.result
        }
        else {
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: response?.detail });
      }
      } catch (error) {
        
      }
    }

  }

  const onFileUpload = async (data: any) => {
    if (fileUploadType === "CATEGORY") {
      try {
        const file = data?.file || null;
        const description = data?.description || null;
        const kind = file ? data?.fileType : productData?.kind;

        let response = await CreateCategoryDocument(
          productData?.id,
          description,
          kind,
          file
        );

        if (response?.id) {
          dispatch.modal.closeModal();
          getCategoryDocuments(productData?.id, 0, 100, "");
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
    } else {
      try {
        const file = data?.file || null;
        const description = data?.description || null;
        const kind = file ? data?.fileType : productData?.kind;
        const response = await CreateSubPackageDocument(defaultSubpackage?.id, description, kind, file)
         if (response?.id) {
          dispatch.modal.closeModal();
          getSubPackages(productData?.id, 0, 20, "");
          dispatch.loadingState.endLoading();
        }
      } catch (error) {}
    }
  };

  const onSubpackageMenuChange = () => {};

  const expandFiles = async (key: number, item: any) => {
    if (filesExpanded === key) setFilesExpanded(null);
    else {
      setFilesExpanded(key);

      try {
        const documents = await getSubPackageDocuments(item?.id, 0, 100, ""); // Await the result
        console.log("Fetched documents:", documents); // Debugging log  
        if (documents && Array.isArray(documents)) {
          documents.forEach((doc) => {
            if (doc.id) {
              checkDocumentStatus(doc.sub_package_id, doc.id);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }

      setTimeout(() => {
        const productElement = document.getElementById(`product-${key}`);
        if (productElement && scrollRef.current) {
          const scrollContainer = scrollRef.current;
          const containerTop = scrollContainer.getBoundingClientRect().top;
          const elementTop = productElement.getBoundingClientRect().top;
          scrollContainer.scrollBy({
            top: elementTop - containerTop - 50,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  const deletecategoryFile = async (
    category_id: string | number,
    file_id: string | number
  ) => {
    try {
      const resp = await DeleteCategoryDocument(category_id, file_id);
      getCategoryDocuments(category_id, 0, 100, "");
    } catch (err) {
      console.log("err", err);
    }
  };

  const deleteSubpackageFile = async (file_id: string | number, current_sub_package_id: string | number) => {
    try {
      await DeleteSubPackageDocument(file_id, current_sub_package_id);
      getSubPackageDocuments(current_sub_package_id, 0, 100, "");
      getSubPackages(productData?.id, 0, 20, "");
    } catch (error) {
      console.log("err", error);
    }
  };

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setSearchTerm(searchTerm);
      getSubPackages(productData?.id,0, pageSize?.skip === 0 ? pageSize?.limit : pageSize?.skip, searchTerm
      );
    }, 500); // Adjust the delay time (in milliseconds) as needed
  };

  const onFileClick = async (file: any, fileType: "CATEGORY" | "SUBPACKAGE") => {
    console.log("File clicked:", file);
    try {
      let linkResp;
      if (fileType === "CATEGORY") {
        linkResp = await ReadCategoryDocumentUrl(file.category_id, file.id);
      } else {
        linkResp = await ReadSubpackageDocumentUrl(file.sub_package_id, file.id);
      }
      if (linkResp) {
        console.log("Type:", linkResp?.type)
        if (linkResp?.type === "base64") {
          let fileInfo: any = {
            name: file.filename,
            type: getFileType(file?.filename),
            url: linkResp?.link,
          };
          console.log("Base link:",fileInfo.url)
          setFileData(fileInfo);
          setFileShow(true);
        } else {
          let response;
            if (fileType === "CATEGORY") {
              response = await getCategoryFileBlobUrl(file);
            } else {
              response = await getSubpackageFileBlobUrl(file);
            }
          console.log("Respose:",response)
          const blobUrl = URL.createObjectURL(response.data);
          console.log(blobUrl);
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
      dispatch.toast.openToast({
        status: true,
        message: "Failed to open file",
        type: "error",
      });
    }
  };


  const checkDocumentStatus = async (subPackageId, documentId) => {
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
        const response = await PollSubpackageDocumentStatus(subPackageId, documentId);

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

  return (
    <div className="flex flex-col w-full h-full p-4 sm:p-6 lg:p-1 lg:px-6 overflow-hidden">
      {/* Header Section */}
      {isOpen.status && (
        <AddProductModal
          modalType="SUBPACKAGE"
          onSubmit={onSubmit}
          defaultValue={defaultSubpackage}
          title={`Add a sub-package under the category ${productData?.title}`}
        />
      )}

      {confirmationStatus && (
        <ConfirmationModal
          onSubmit={() => {
            if (deleteType === "SUBPACKAGE") {
              onSubPackageDeleteSubmit(defaultSubpackage);
            } else if (deleteType === "FILE") {
              deletecategoryFile(productData?.id, defaultCategoryDocument?.id);
            } else {
              deleteSubpackageFile(defaultSubPackageDocument?.id, defaultSubpackage?.id);
            }
          }}
          title={
            deleteType === "SUBPACKAGE" ? "Remove Subpackage" : "Remove File"
          }
          content={
            deleteType === "SUBPACKAGE"
              ? `Are you sure you want to remove this sub-package under ${productData?.title}?`
              : "Are you sure you want to remove this file?"
          }
        />
      )}
      {fileUpload.status && (
        <FileEditModal
          onSubmit={onFileUpload}
          defaultValues={null}
          title={
            fileUploadType === "CATEGORY"
              ? `Add file for the category ${productData?.title}`
              : `Add file for the sub-package ${defaultSubpackage?.title}`
          }
        />
      )}
      {fileShow && (
        <FileViewModal
          fileUrl={fileData}
          isOpen={fileShow}
          onClose={() => setFileShow(false)}
        />
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
        {/* Title + Files */}
        <div className="flex flex-col gap-2 w-full">
          {/* Title */}
          <Text className="text-[#091E42]" type="header2">
            {productData?.title || "Untitled Product"}
          </Text>

          {/* File list under title */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Text type="small" className="text-gray-500">
              Files:
            </Text>

            {files.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {files.map((file, index) => (
                  <DropDownMenu
                    content={
                      <span
                        className="flex items-center max-w-[160px] bg-gray-100 p-2 
                     rounded-full text-[8px] text-gray-700 border truncate relative font-bold"
                        title={file?.filename}
                      >
                        {file?.filename || `File ${index + 1}`}
                      </span>
                    }
                    menuItems={MenuItems}
                    onChange={(action: string) => {
                      setDefaultCategoryDocument(file);
                      console.log(action);
                      if (action === "Edit") {
                        onFileClick(file, "CATEGORY");
                      }
                      if (action === "Delete") {
                        console.log("Delete clicked", file);
                        setDeleteType("FILE");
                        dispatch.modal.openConfirmation();
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <Text type="small" className="text-gray-400 italic">
                No files
              </Text>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mr-4">
          <Button
            onClick={() => onSwitch("CATEGORIES")}
            custom_type="normal"
            className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 
                 text-gray-800 w-20 sm:w-40 h-9 rounded-md transition text-sm"
            size="custom"
          >
            ← Back
          </Button>

          {isAdmin && (
            <Button
              onClick={() => {
                dispatch.modal.openModal("add");
                setFileUploadType("CATEGORY");
              }}
              custom_type="danger"
              className="flex items-center justify-center gap-1 bg-danger w-full sm:w-28 h-9 rounded-md text-sm"
              size="custom"
            >
              <img src={AddIcon} alt="add" className="w-3 h-3" />
              Add File
            </Button>
          )}
        </div>
      </div>

      {/* Content Section */}
      {/* Header with Add Subpackage button */}
      <div className="flex items-center justify-between mt-4 lg:mt-4 lg:py-2 mb-4 lg:mr-4">
        <Text className="text-[#091E42] font-bold lg:text-2xl">
          Sub-Packages
        </Text>
        <div className="flex flex-row">
          {isAdmin && (
            <Button
              onClick={() => {
                dispatch.modal.openAddProduct("add");
                setDefaultSubpackage(undefined);
                // setAddSubpackage(true);
              }}
              custom_type="danger"
              className="flex items-center gap-2 bg-danger px-2 py-2 rounded-lg shadow-md hover:bg-red-600 mr-4"
              size="custom"
            >
              <img src={AddIcon} alt="add" className="w-4 h-4" />
              <Text type="small">Add Sub-package</Text>
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

      {/* Vertical Scrollable Subpackage List */}
      <div
        ref={scrollRef}
        className="self-center max-h-[60vh] items-center overflow-y-scroll w-full flex flex-col mb-10 gap-2"
      >
        {subpackages?.length > 0 ? (
          subpackages.map((item: any, key: number) => (
            <div
              id={`subpackage-${key}`}
              key={key}
              className="w-full lg:w-[74vw] sm:w-[73vw] h-fit rounded-lg shadow-custom self-center flex flex-col border"
            >
              {/* -------- Header: Title + Menu -------- */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-8 pt-3">
                <Text
                  title={item?.title}
                  className="max-w-full sm:max-w-[60vw] text-ellipsis overflow-hidden whitespace-nowrap"
                  type="bold-body"
                >
                  {item.title} 
                </Text>

                {isAdmin && (
                  <DropDownMenu
                    onChange={(action: string) => {
                      setDefaultSubpackage(item);
                      console.log(action);
                      if (action === "Edit") {
                        dispatch.modal.openAddProduct("edit");
                        // handle edit logic
                      }
                      if (action === "Delete") {
                        setDeleteType("SUBPACKAGE");
                        dispatch.modal.openConfirmation();
                        // handle delete logic
                      }
                    }}
                    content={
                      <img
                        src={Menu}
                        className="w-9 h-9"
                        alt="menu"
                        loading="lazy"
                      />
                    }
                    menuItems={[
                      {
                        title: "Delete",
                        component: (
                          <img src={Trash} alt="trash" loading="lazy" />
                        ),
                      },
                    ]}
                  />
                )}
              </div>
              
              {/* -------- Description -------- */}
              <div className="px-8">
                <div className="flex flex-row flex-wrap gap-2 my-2">
                  {item?.other_names.map((name:string) => (
                    <Text className="text-[#505F79] border rounded-full bg-gray-200 max-w-fit text-[12px] line-clamp-3 px-2 ">
                      {name}
                    </Text>))
                  }
                </div>
                <Text
                  title={item?.description}
                  className="text-[#505F79] max-w-full sm:mr-[20vw] text-[12px] line-clamp-3"
                >
                  {item.description || "No description available"}
                </Text>
              </div>
              {/* -------- Action Buttons (View, Count, Attach) -------- */}
              <div className="my-2 gap-2 mb-4 px-8 mt-[2vh] flex items-center">
                {/* View/Hide files */}
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

                {/* File Count */}
                <button
                  disabled
                  className="w-10 h-10 rounded-full bg-[#ED3438] bg-opacity-10"
                >
                  <Text className="text-danger" type="body">
                    {item?.total_document || 0}
                  </Text>
                </button>

                {/* Attach Files (Admins only) */}
                {isAdmin && (
                  <div className="flex flex-row items-center ml-auto">
                    <label
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch.modal.openModal("add");
                        setDefaultSubpackage(item);
                        setFileUploadType("SUBPACKAGE");
                        // setDefaultSubpackage(item);
                        //setDefaultSubpackageDocument(null);
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

              {/* -------- Expandable Files Section -------- */}
              {filesExpanded === key && (
                <div className="flex flex-col">
                  <div className="bg-[#D9D9D9] h-[1px] w-full sm:w-[68vw] mx-5 mt-[3vh]"></div>

                  <div className="flex flex-col sm:flex-row justify-between items-center my-[2vh] px-5">
                    <div className="flex flex-col sm:flex-row w-3/4 relative flex-wrap">
                      {subpackageFiles?.length > 0 ? (
                        subpackageFiles.map((file: any, index2: number) => (
                          <DropDownMenu
                            content={
                              <span
                                className="flex items-center max-w-[160px] bg-gray-100 p-2 
                                    rounded-full text-[8px] font-bold text-gray-700 border truncate relative"
                                title={file?.filename}
                              >
                                {file?.filename || `File ${index2 + 1}`}
                              </span>
                            }
                            menuItems={MenuItems}
                            onChange={(action: string) => {
                              setDefaultSubPackageDocument(file);
                              setDefaultSubpackage(item);
                              if (action === "Open") {
                                onFileClick(file, "SUBPACKAGE");
                              }
                              if (action === "Delete") {
                                setDeleteType("SUBPACKAGEFILE");
                                dispatch.modal.openConfirmation();
                              }
                            }}
                          />
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
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">No subpackages found.</p>
        )}
      </div>
    </div>
  );
};
export default Subpackages;
