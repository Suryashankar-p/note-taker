import Header from "../../../components/Header.tsx";
import SettingsSidebar from "./Sidebar.tsx";
import "../styles.css";
import Text from "../../../components/Text.tsx";
import Button from "../../../components/Button.tsx";
import AddIcon from "../../../assets/circle_plus.svg";
import Input from "../../../components/Input.tsx";
import SearchIcon from "../../../assets/search_icon.svg";
import DropDownMenu from "../../../components/DropdownMenu.tsx";
import Menu from "../../../assets/more.svg";
import Edit from "../../../assets/edit.svg";
import Trash from "../../../assets/trash.svg";
import { useEffect, useRef, useState } from "react";
import Link from "../../../assets/link.svg";
import Attach from "../../../assets/attachment.svg";
import Line from "../../../assets/line .svg";
import FileEditModal from "../../../components/Modals/FileEditModalDoctorConBot.tsx";
import AddFaqModal from "../../../components/Modals/AddFaqModal.tsx";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store.ts";
import AddProductModal, {
  DefaultValue,
} from "../../../components/Modals/AddProductModalDoctorConBot.tsx";
import NoData from "../../../assets/no_data.tsx";
import {
  CreateProduct,
  CreateProductDocument,
  CreateFaqDocument,
  EditFaqDocument,
  DeleteProduct,
  DeleteProductDocument,
  ReadFaqDocuments,
  ReadProductDocumentUrl,
  ReadFaqDocumentUrl,
  ReadProductDocuments,
  DeleteFaqDocument,
  ReadProducts,
  UpdateProduct,
} from "../../../services/doctor_conbot.ts";
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

const Faq = () => {
  const [filesExpanded, setFilesExpanded] = useState<number | null>(null);
  const isOpen = useSelector((state: RootState) => state.modal.addProduct);
  const fileUpload = useSelector((state: RootState) => state.modal.isOpen);
  const [products, setProducts] = useState([]);
  const [files, setFiles] = useState<any>();
  const [defaultProduct, setDefaultProduct] = useState<any>();
  const member = useSelector((state: RootState) => state.memberRole);
  const doctorConBotMemberDetails =
    member.service === "doctor_conbot" ? member?.details : {};
  const dispatch = useDispatch<Dispatch>();
  let timeoutId: NodeJS.Timeout | null = null;
  const confirmationStatus = useSelector(
    (state: RootState) => state.modal.confirmation
  );
  const [productTotal, setProductTotal] = useState(0);
  const [faqTotal, setFaqTotal] = useState(0);
  const [fileTotal, setFileTotal] = useState(0);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [defaultProductDocument, setDefaultProductDocument] = useState<any>();
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

  useEffect(() => {
    getFaqDocuments(pageSize.skip, pageSize.limit, "");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight && !loading) {
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
      const productResponse = await ReadProducts(skip, limit, searchTerm);
      if (productResponse?.result) {
        setProducts((prevProducts) => [
          ...prevProducts,
          ...productResponse?.result,
        ]);
        setLoading(false);
      } else {
        setPageError(true);
        if (productResponse?.detail)
          dispatch.toast.openToast({
            status: true,
            message: productResponse?.detail,
          });
        setLoading(false);
      }
    } catch (err) {
      console.log("errr", err);
      setLoading(false);
    }
    setIsLoadingMore(false);
  };
  const hasMoreProducts = products.length < productTotal;
  // const hasMoreFiles = files.length < fileTotal;

  const getAllProducts = async (
    skip: number,
    limit: number,
    search_term: string
  ) => {
    try {
      const productResponse = await ReadProducts(skip, limit, search_term);
      if (productResponse?.result) {
        setProducts(productResponse?.result);
        setProductTotal(productResponse?.total);
        console.log("productTotal", productResponse.total);
      } else {
        setPageError(true);
        if (productResponse?.detail)
          dispatch.toast.openToast({
            status: true,
            message: productResponse?.detail,
          });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const onProductOnChange = (item: any, title: string) => {
    setDefaultProduct(item);
    if (title === "Edit") {
      dispatch.modal.openAddProduct("edit");
    } else if (title === "Delete") {
      dispatch.modal.openConfirmation();
      setDeleteType("product");
    }
  };

  const onProductCreate = async (data: any) => {
    if (data) {
      try {
        const createResponse = await CreateProduct(
          data?.title,
          data?.short_title,
          data?.description
          // data?.models
        );
        if (createResponse?.id) {
          getAllProducts(0, 20, "");
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

  const onProductEdit = async (data: any) => {
    if (data) {
      try {
        const editResponse = await UpdateProduct(
          data?.id,
          data?.title,
          data?.short_title,
          data?.description
          // data?.models
        );
        if (editResponse?.id) {
          getAllProducts(0, 20, "");
          dispatch.modal.closeAddProduct();
        } else {
          setPageError(true);
          if (editResponse?.detail)
            dispatch.toast.openToast({
              status: true,
              message: editResponse?.detail,
            });
        }
      } catch (err) {
        console.log("err", err);
      }
    } else {
      console.log("errror");
    }
  };
  const onSubmit = (data: any) => {
    if (isOpen?.type === "edit") {
      onProductEdit(data);
    } else if (isOpen?.type === "add") {
      onProductCreate(data);
    }
  };

  const onDeleteSubmit = async (value: any) => {
    if (value?.id) {
      try {
        await DeleteProduct(value?.id);
        getAllProducts(0, 20, "");
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Failed");
    }
  };
  const getFaqDocuments = async (
    // product_id: number | string,
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
        setFaqTotal(resp?.total);
        setFiles(faqDocuments);
        console.log("files", files.length);
      } else {
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: resp?.detail });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const deleteProductFile = async (
    // product_id: string | number,
    file_id: string | number
  ) => {
    try {
      const resp = await DeleteFaqDocument(file_id);
      console.log("deleting the faq.....");
      getFaqDocuments(0, 100, "");
    } catch (err) {
      console.log("err", err);
    }
  };

  const expandFiles = (key: number, item: any) => {
    if (filesExpanded === key) setFilesExpanded(null);
    else {
      setFilesExpanded(key);
      // getProductDocuments(item?.id, 0, 100, "");
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
      console.log("onFileUpload.....");
      dispatch.loadingState.startLoading();
      try {
        const file = data?.file || null;
        const description = data?.description || null;
        const filename = file ? file.name : defaultProductDocument?.filename; // Use current filename if no file is uploaded

        let response;
        if (fileUpload?.type === "edit") {
          response = await EditFaqDocument(
            description,
            defaultProductDocument?.id
            // file
          );
        } else {
          response = await CreateFaqDocument(
            description,
            file,
            defaultProductDocument?.id
          );
        }

        if (response?.id) {
          dispatch.modal.closeModal();
          getFaqDocuments(0, 100, "");
          // getAllProducts(0, 50, "");
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
      const linkResp = await ReadFaqDocumentUrl(file.id);
      console.log(linkResp);

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

  return (
    <div className="flex h-screen w-full flex-col gap-8  overflow-y-hidden">
      {/* {isOpen.status && (
        <AddProductModal onSubmit={onSubmit} defaultValue={defaultProduct} />
      )} */}
      {/* {confirmationStatus && deleteType === "product" && (
        <ConfirmationModal
          onSubmit={() => onDeleteSubmit(defaultProduct)}
          title="Remove Product"
          content="Are you sure you want to remove this product?"
        />
      )} */}
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
                // setDefaultProduct(item);
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
            <AddFaqModal
              onSubmit={onFileUpload}
              defaultValues={defaultProductDocument}
              options={defaultProduct?.models}
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
              className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 p-6 w-[900px] h-[130px] flex justify-between items-center"
            >
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-lg text-gray-900 truncate">
                  {item?.filename}
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {item?.description?.length > 50
                    ? item.description.slice(0, 50) + "..."
                    : item.description}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                {doctorConBotMemberDetails?.role === "OWNER" && (
                  <DropDownMenu
                    onChange={(type: string) => {
                      fileMenuChange(type, item);
                      setDefaultProduct(item);
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
              </div>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center">
            <NoData />
          </div>
        )}
      </div>

      {hasReachedEnd && hasMoreProducts && <p>Loading more...</p>}
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
