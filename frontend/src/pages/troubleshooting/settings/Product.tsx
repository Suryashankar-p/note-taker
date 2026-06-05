import "../styles.css";
import Text from "../../../components/Text";
import Button from "../../../components/Button";
import AddIcon from "../../../assets/circle_plus.svg";
import Input from "../../../components/Input";
import SearchIcon from "../../../assets/search_icon.svg";
import DropDownMenu from "../../../components/DropdownMenu";
import Menu from "../../../assets/more.svg";
import Trash from "../../../assets/trash.svg";
import Edit from "../../../assets/edit.svg";
import { useEffect, useRef, useState } from "react";
import Link from "../../../assets/link.svg";
import Attach from "../../../assets/attachment.svg";
import LoaderIcon from "../../../components/LoaderIcon";
import FileEditModal from "../../../components/Modals/FileEditModalTroubleshooting.tsx";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import AddProductModal, {
  DefaultValue,
} from "../../../components/Modals/AddProductModalTroubleshooting.tsx";
import NoData from "../../../assets/no_data";
import {
  CreateProduct,
  DeleteProduct,
  ReadProducts,
  CreateDocument,
  ReadDocuments,
  DeleteDocument,
  ReadDocumentUrl,
  PollDocumentStatus,
} from "../../../services/troubleshooting.ts";
import ConfirmationModal from "../../../components/Modals/ConfirmationModal";
import Toast from "../../../components/Toast";
import { getFileType } from "../../../utils/functions.ts";
import FileViewModal from "../../../components/Modals/FileViewModal.tsx";
import ProductTree from "./ProductTree.tsx";

const MenuItems = [
  {
    title: "Delete File",
    component: <img src={Edit} alt="edit" loading="lazy" />,
  },
  {
    title: "Delete Product",
    component: <img src={Trash} alt="trash" loading="lazy" />,
  },
];

const Products = () => {
  const [filesExpanded, setFilesExpanded] = useState<number | null>(null);
  const isOpen = useSelector((state: RootState) => state.modal.addProduct);
  const fileUpload = useSelector((state: RootState) => state.modal.isOpen);
  const [products, setProducts] = useState([]);
  const [files, setFiles] = useState<any>();
  const [defaultProduct, setDefaultProduct] = useState<DefaultValue>();
  const member = useSelector((state: RootState) => state.memberRole);
  const TroubleshootingMemberDetails =
    member.service === "troubleshooting" ? member?.details : {};
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
  const [status, setStatus] = useState("PENDING");
  const [treeProduct, setTreeProduct] = useState<any>(null);

  useEffect(() => {
    getAllProducts(pageSize.skip, pageSize.limit, "");
  }, []);

  // useEffect(() => {
  //   if (!files?.id) return;
  //   CheckDocumentStatus(files.id);
  // }, [files?.id]);

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
  };

  const onProductOnChange = (item: any, title: string) => {
    setDefaultProduct(item);
    if (title === "Delete File") {
      dispatch.modal.openConfirmation();
      setDeleteType("file");
    } else if (title === "Delete Product") {
      dispatch.modal.openConfirmation();
      setDeleteType("product");
    }
  };

  const onProductCreate = async (data: any) => {
    const createResponse = await CreateProduct(data?.product_title);
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
  };

  const onSubmit = (data: any) => {
    if (isOpen?.type === "add") {
      onProductCreate(data);
    }
  };

  const onDeleteSubmit = async (value: any) => {
    await DeleteProduct(value?.id);
    getAllProducts(0, 20, "");
  };

  const getProductDocuments = async (
    product_id: number | string,
    skip: number,
    limit: number,
    search_term: string
  ) => {
      const resp = await ReadDocuments(product_id, skip, limit, search_term);
      if (resp?.result) {
        setFiles(resp.result);
      } else {
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: resp?.detail });
      }
  };

  const deleteProductFile = async (product_id: string | number) => {
    await DeleteDocument(product_id);
    getAllProducts(0, 20, "");
    getProductDocuments(product_id, 0, 100, "");
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setSearchTerm(searchTerm);
      getAllProducts(
        0,
        pageSize?.skip === 0 ? pageSize?.limit : pageSize?.skip,
        searchTerm
      );
    }, 500);
  };

  const onFileUpload = async (data: any) => {
    if (data && defaultProductDocument?.id) {
      dispatch.loadingState.startLoading();
      try {
        const response = await CreateDocument(defaultProduct?.id, data?.file);
        if (response?.id) {
          dispatch.modal.closeModal();
          getAllProducts(0, 50, "");
          CheckDocumentStatus(defaultProduct.id);
          dispatch.loadingState.endLoading();
        }
      } catch (err: any) {
        let error_message = err?.response?.data?.detail;
        dispatch.loadingState.endLoading();
        setPageError(true);
        dispatch.toast.openToast({ status: true, message: error_message });
        if (err?.response?.status === 422) {
        }
      }
    }
  };

  const onFileClick = async (prod: any) => {
    try {
      const linkResp = await ReadDocumentUrl(prod.id);

      if (linkResp?.link) {
        const fileType = getFileType(prod?.filename);
        
        if (fileType?.toLowerCase() === "xls" || fileType?.toLowerCase() === "xlsx") {
          const base64Response = await fetch(linkResp.link);
          const blob = await base64Response.blob();
          const blobUrl = URL.createObjectURL(blob);
          
          let fileInfo: any = {
            name: prod.filename,
            type: fileType,
            url: blobUrl,
          };
          setFileData(fileInfo);
          setFileShow(true);
        } else {
          let fileInfo: any = {
            name: prod.filename,
            type: fileType,
            url: linkResp?.link,
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
      dispatch.toast.openToast({
        status: true,
        message: "Error loading file",
        type: "error",
      });
    }
  };

  const CheckDocumentStatus = async (product_id) => {
    const polling = setInterval(async () => {
      try {
        const response = await PollDocumentStatus(product_id);
        if (response.status === "COMPLETED") {
          setStatus("COMPLETED");
          getAllProducts(pageSize.skip, pageSize.limit, "");
          clearInterval(polling);
        }
      } catch (error) {
        console.error("Error polling document status:", error);
      }
    }, 10000);

    return () => clearInterval(polling);
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
          onSubmit={() => deleteProductFile(defaultProduct?.id)}
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
          {TroubleshootingMemberDetails?.role === "OWNER" && (
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
        className=" self-center h-full items-center overflow-y-scroll w-full flex flex-col xl:mt-4 gap-4 xl:gap-8"
      >
        {products?.length > 0 ? (
          products.map((item: any, key: number) => (
            <div
              id={`product-${key}`}
              key={key}
              className="w-[25rem] sm:w-[53vw] lg:w-[55rem] xl:w-[65rem] rounded-lg shadow-custom self-center flex flex-col items-betweeen justify-center border"
            >
              <div className="flex lg:flex-row flex-row justify-between items-start sm:items-center px-8 pt-4 pb-4 min-h-20">
                <Text
                  title={item?.product_title}
                  className="max-w-full sm:max-w-[60vw] lg:mt-0 mt-1 text-ellipsis overflow-hidden whitespace-nowrap"
                  type="header3"
                >
                  {item.product_title}
                </Text>
                {!item.filename &&
                  TroubleshootingMemberDetails?.role === "OWNER" && (
                    <div className="flex flex-row items-center ml-auto">
                      <label
                        onClick={() => {
                          dispatch.modal.openModal("add");
                          setDefaultProduct(item);
                          setDefaultProductDocument(item);
                        }}
                        htmlFor="file-upload"
                        className="w-36 h-10 rounded-full bg-[#F3F1FF] flex items-center justify-center cursor-pointer"
                      >
                        <img src={Attach} alt="attach" className="w-5 h-5" />
                        <Text className="text-primary_text">Attach file</Text>
                      </label>
                    </div>
                  )}
                {item.filename && (
                  <button
                    onClick={
                      TroubleshootingMemberDetails?.role === "OWNER"
                        ? () => {
                            onFileClick(item);
                            setFileName(item.filename);
                          }
                        : undefined
                    }
                    className="flex border rounded-full my-0 w-[13rem] lg:w-[20rem] h-10 px-4 py-2 items-center ml-auto"
                  >
                    {item.status === "COMPLETED" ? (
                      <img src={Link} alt="Document" loading="lazy" />
                    ) : (
                      <LoaderIcon size={25} color="#42526e" />
                    )}
                    <Text className="text-primary_text max-w-[150px] lg:max-w-[300px] truncate" title={item.filename}>
                      {item.filename}
                    </Text>{" "}
                  </button>
                )}
                <button
                  onClick={() => setTreeProduct(item)}
                  className="flex border rounded-full my-0 h-10 px-4 py-2 items-center ml-2 shrink-0"
                  title="Manage problems, causes & solutions"
                >
                  <Text className="text-primary_text">Knowledge tree</Text>
                </button>
                {TroubleshootingMemberDetails?.role === "OWNER" && (
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
              {fileUpload.status && (
                <FileEditModal
                  onSubmit={onFileUpload}
                  defaultValues={defaultProductDocument}
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
      {hasReachedEnd && hasMoreProducts && <p>Loading more...</p>}
      {treeProduct && (
        <ProductTree
          product={treeProduct}
          isOwner={TroubleshootingMemberDetails?.role === "OWNER"}
          onClose={() => setTreeProduct(null)}
        />
      )}
    </div>
  );
};

export default Products;