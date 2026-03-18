import Header from "../../../components/Header";
import SettingsSidebar from "./Sidebar";
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
import Line from "../../../assets/line .svg";
import FileEditModal from "../../../components/Modals/FileEditModal";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import AddProductModal, {
  DefaultValue,
} from "../../../components/Modals/AddProductModal";
import NoData from "../../../assets/no_data";
import {
  CreateProduct,
  CreateProductDocument,
  DeleteProduct,
  DeleteProductDocument,
  ReadProductDocumentUrl,
  ReadProductDocuments,
  ReadProducts,
  UpdateProduct,
} from "../../../services/sales.ts";
import ConfirmationModal from "../../../components/Modals/ConfirmationModal";
import Toast from "../../../components/Toast";
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

const Knowledge = () => {
  const [filesExpanded, setFilesExpanded] = useState<number | null>(null);
  const isOpen = useSelector((state: RootState) => state.modal.addProduct);
  const fileUpload = useSelector((state: RootState) => state.modal.isOpen);
  const [products, setProducts] = useState([]);
  const [files, setFiles] = useState<any>();
  const [defaultProduct, setDefaultProduct] = useState<DefaultValue>();
  const member = useSelector((state: RootState) => state.memberRole);
  const salesMemberDetails = member.service === "sales" ? member?.details : {};
  const dispatch = useDispatch<Dispatch>();
  let timeoutId: NodeJS.Timeout | null = null;
  const confirmationStatus = useSelector(
    (state: RootState) => state.modal.confirmation
  );
  const [productTotal, setProductTotal] = useState(0);
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
    getAllProducts(pageSize.skip, pageSize.limit, "");
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
      setLoading(false);
    }
    setIsLoadingMore(false);
  };
  const hasMoreProducts = products.length < productTotal;

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
      } else {
        setPageError(true);
        if (productResponse?.detail)
          dispatch.toast.openToast({
            status: true,
            message: productResponse?.detail,
          });
      }
    } catch (err) {
      setPageError(true);
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
          data?.description,
          data?.models
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
        setPageError(true);
      }
    } else {
      setPageError(true);
    }
  };

  const onProductEdit = async (data: any) => {
    if (data) {
      try {
        const editResponse = await UpdateProduct(
          data?.id,
          data?.title,
          data?.short_title,
          data?.description,
          data?.models
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
        setPageError(true);
      }
    } else {
      setPageError(true);
    }
  };

  const getProductDocuments = async (
    product_id: number | string,
    skip: number,
    limit: number,
    search_term: string
  ) => {
    try {
      const resp = await ReadProductDocuments(
        product_id,
        skip,
        limit,
        search_term
      );
      if (resp?.result) {
        setFiles(resp.result);
      } else {
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: resp?.detail });
      }
    } catch (err) {
      setPageError(true);
    }
  };

  const onSubmit = (data: any) => {
    if (isOpen?.type === "edit") {
      onProductEdit(data);
    } else if (isOpen?.type === "add") {
      onProductCreate(data);
    }
  };

  const deleteProductFile = async (
    product_id: string | number,
    file_id: string | number
  ) => {
    try {
      const resp = await DeleteProductDocument(product_id, file_id);
      getProductDocuments(product_id, 0, 100, "");
    } catch (err) {
      setPageError(true);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setSearchTerm(searchTerm);
      getAllProducts(0, pageSize?.skip === 0 ? pageSize?.limit : pageSize?.skip, searchTerm);
    }, 500); // Adjust the delay time (in milliseconds) as needed
  };

  const onDeleteSubmit = async (value: any) => {
    if (value?.id) {
      try {
        await DeleteProduct(value?.id);
        getAllProducts(0, 20, "");
      } catch (err) {
        setPageError(true);
      }
    } else {
      setPageError(true);
    }
  };

  const displayModels = (modelArray: []) => {
    return modelArray.map((item: any, key: number) =>
      key < modelArray.length - 1 ? item.title + ", " : item.title
    );
  };

  const expandFiles = (key: number, item: any) => {
    if (filesExpanded === key) setFilesExpanded(null);
    else {
      setFilesExpanded(key);
      getProductDocuments(item?.id, 0, 100, "");
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

  const onFileUpload = async (data: any) => {
    if (data && defaultProduct?.id) {
      dispatch.loadingState.startLoading();
      try {
        const response = await CreateProductDocument(
          defaultProduct?.id,
          data?.description,
          data?.fileType,
          data?.file,
          data?.models,
          defaultProductDocument?.id
        );
        if (response?.id) {
          dispatch.modal.closeModal();
          getProductDocuments(defaultProduct?.id, 0, 100, "");
          getAllProducts(0, 50, "");
          dispatch.loadingState.endLoading();
        }
      } catch (err: any) {
        setPageError(true);
        let error_message = err?.response?.data?.detail;
        dispatch.loadingState.endLoading();
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: error_message });
        if (err?.response?.status === 422) {
          //  dispatch.toast.openToast({ status: true, message: 'File format not supported' })
        }
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

  const onFileClick = async (file: any) => {
    try {
      const linkResp = await ReadProductDocumentUrl(
        file.product_id,
        file.id
      );
        
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
      setPageError(true);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col gap-8  overflow-y-hidden">
      {isOpen.status && (
        <AddProductModal onSubmit={onSubmit} defaultValue={defaultProduct} />
      )}
      {confirmationStatus && deleteType === "product" && (
        <ConfirmationModal
          onSubmit={() => onDeleteSubmit(defaultProduct)}
          title="Remove Product"
          content="Are you sure you want to remove this product?"
        />
      )}
      {confirmationStatus && deleteType === "file" && (
        <ConfirmationModal
          onSubmit={() =>
            deleteProductFile(
              defaultProductDocument?.product_id,
              defaultProductDocument?.id
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
      <div className="mx-16 flex mt-1 flex-col sm:flex-row sm:justify-between">
        <div className="flex flex-col">
          <Text className="text-[#091E42] ml-1" type="header2">
            Products
          </Text>
          {products && (
            <Text type="small" className="text-faint_text ml-1">{`(${
              products?.length > 1
                ? products?.length + " Results"
                : products?.length + " Result"
            } of ${productTotal})`}</Text>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-5 mt-1 sm:mt-0">
          {salesMemberDetails?.role === "OWNER" && (
            <Button
              onClick={() => {
                dispatch.modal.openAddProduct("add");
                setDefaultProduct(undefined);
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
        className=" self-center h-fit items-center overflow-y-scroll w-full flex flex-col mb-20 gap-4 "
      >
        {products?.length > 0 ? (
          products.map((item: any, key: number) => (
            <div
              id={`product-${key}`}
              key={key}
              className="w-full sm:w-[73vw] h-fit rounded-lg shadow-custom self-center flex flex-col border"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-8 pt-3">
                <Text
                  title={item?.title}
                  className="max-w-full sm:max-w-[60vw] text-ellipsis overflow-hidden whitespace-nowrap"
                  type="header3"
                >
                  {item.title} {`(${item.short_title})`}
                </Text>
                {salesMemberDetails?.role === "OWNER" && (
                  <DropDownMenu
                    onChange={(title: string) => onProductOnChange(item, title)}
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

              <div className="px-8">
                <Text
                  title={item?.description}
                  className="text-[#505F79] max-w-full sm:mr-[20vw] text-[12px] line-clamp-3"
                >
                  {item.description}
                </Text>
              </div>
              <div className="px-8 pt-2">
                <Text
                  title={item.models.map((item: any) => item.title)}
                  className="text-[#505F79] max-w-full sm:mr-[20vw] font-medium text-[14px]"
                >
                  Models: {displayModels(item.models)}
                </Text>
              </div>
              <div className="my-2 gap-2 mb-4 px-8 mt-[2vh] flex">
                <button
                  onClick={() => expandFiles(key, item)}
                  className="w-28 h-10 rounded-full bg-[#F3F1FF]"
                >
                  <Text className="text-[#0061F3]  text-[16px] leading-[18px]">
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
              </div>
              {filesExpanded === key && (
                <div className="flex flex-col">
                  <div className="bg-[#D9D9D9] h-[1px] w-full sm:w-[68vw] mx-5 mt-[3vh]"></div>
                  <div className="flex flex-col sm:flex-row justify-between items-center my-[2vh] px-5">
                    <div className="flex flex-col sm:flex-row w-3/4 relative flex-wrap">
                      {files?.length > 0 ? (
                        files?.map((fileItem: any, key2: number) => (
                          <div
                            key={key2}
                            className="flex gap-4 flex-row sm:flex-row items-center relative justify-center mt-2 sm:mt-0"
                          >
                            <button
                              title="Click to open/download"
                              onClick={() => {
                                onFileClick(fileItem);
                                setFileName(fileItem?.filename);
                              }}
                              className="flex border rounded-full my-4 w-max h-10 px-4 py-2"
                            >
                              <img src={Link} alt="link" loading="lazy" />
                              <Text className="text-primary_text">
                                {fileItem?.filename}
                              </Text>
                            </button>
                            {salesMemberDetails?.role === "OWNER" && (
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
                                  setDefaultProduct(item);
                                }}
                              />
                            )}
                            {/* {key2 < (files.length - 1) && <img src={Line} className="absolute right-1" loading="lazy" alt="line" />} */}
                          </div>
                        ))
                      ) : (
                        <div className="absolute left-72 ">
                          <Text type="small" className="text-primary_text">
                            No files added
                          </Text>
                        </div>
                      )}
                    </div>
                    {salesMemberDetails?.role === "OWNER" && (
                      <div className="flex flex-row mt-4 sm:mt-0">
                        <label
                          onClick={() => {
                            dispatch.modal.openModal("add");
                            setDefaultProduct(item);
                            setDefaultProductDocument(null);
                          }}
                          htmlFor="file-upload"
                          className="w-36 h-10 rounded-full sm:mr-[3vh] bg-[#F3F1FF] flex items-center justify-center cursor-pointer"
                        >
                          <img src={Attach} alt="attach" className="w-5 h-5" />
                          <Text className="text-primary_text">
                            Attach files
                          </Text>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {fileUpload.status && (
                <FileEditModal
                  onSubmit={onFileUpload}
                  defaultValues={defaultProductDocument}
                  options={defaultProduct?.models}
                />
              )}
              {/* {fileUrl && <FileViewModal fileType={getFileType(fileName)} fileUrl={fileUrl} isOpen={fileUrl} onClose={() => setFileUrl(null)} />} */}
            </div>
          ))
        ) : (
          <div className="flex justify-center item-center">
            <NoData />
          </div>
        )}
      </div>
      {hasReachedEnd && hasMoreProducts && <p>Loading more...</p>}
    </div>
  );
};

export default Knowledge;
