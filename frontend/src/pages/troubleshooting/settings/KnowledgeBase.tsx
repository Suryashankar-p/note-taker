import { useEffect, useRef, useState } from "react";
import "../styles.css";
import Text from "../../../components/Text";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import AddIcon from "../../../assets/circle_plus.svg";
import SearchIcon from "../../../assets/search_icon.svg";
import Link from "../../../assets/link.svg";
import Menu from "../../../assets/more.svg";
import Trash from "../../../assets/trash.svg";
import LoaderIcon from "../../../components/LoaderIcon";
import NoData from "../../../assets/no_data";
import DropDownMenu from "../../../components/DropdownMenu";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import ConfirmationModal from "../../../components/Modals/ConfirmationModal";
import FileEditModal from "../../../components/Modals/FileEditModalTroubleshooting";
import KbCitationViewerModal from "../../../components/Modals/KbCitationViewerModal";
import Toast from "../../../components/Toast";
import {
  CreateKbDocument,
  DeleteKbDocument,
  PollKbDocumentStatus,
  ReadKbDocuments,
  ReadProducts,
} from "../../../services/troubleshooting";

interface ProductOption {
  id: number;
  product_title: string;
}

const MenuItems = [
  {
    title: "Delete Document",
    component: <img src={Trash} alt="trash" loading="lazy" />,
  },
];

interface KbDocument {
  id: number;
  filename: string;
  status: "STARTED" | "COMPLETED" | "FAILED";
  page_count?: number | null;
  created_on: string;
  created_by: number;
  is_active: boolean;
}

const KnowledgeBase = () => {
  const dispatch = useDispatch<Dispatch>();
  const member = useSelector((state: RootState) => state.memberRole);
  const troubleshootingMember =
    member.service === "troubleshooting" ? member?.details : {};
  const isOwner = troubleshootingMember?.role === "OWNER";

  const fileUpload = useSelector((state: RootState) => state.modal.isOpen);
  const confirmationStatus = useSelector(
    (state: RootState) => state.modal.confirmation
  );
  const toastStatus = useSelector((state: RootState) => state.toast);

  const [documents, setDocuments] = useState<KbDocument[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 20 });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pageError, setPageError] = useState<boolean>(false);
  const [activeDoc, setActiveDoc] = useState<KbDocument | null>(null);
  const [viewerDoc, setViewerDoc] = useState<KbDocument | null>(null);
  const pollingIdsRef = useRef<Set<number>>(new Set());

  let searchTimeoutId: NodeJS.Timeout | null = null;

  useEffect(() => {
    getAllDocuments(pageSize.skip, pageSize.limit, "");
    getProducts();
    return () => {
      pollingIdsRef.current.clear();
    };
  }, []);

  const getProducts = async () => {
    try {
      const resp = await ReadProducts(0, 100, "");
      if (resp?.result) setProducts(resp.result);
    } catch (err) {
      // Non-fatal: upload modal will show an empty product list.
    }
  };

  useEffect(() => {
    documents.forEach((d) => {
      if (d.status !== "COMPLETED" && !pollingIdsRef.current.has(d.id)) {
        pollDocumentStatus(d.id);
      }
    });
  }, [documents]);

  const getAllDocuments = async (
    skip: number,
    limit: number,
    search_term: string
  ) => {
    try {
      const resp = await ReadKbDocuments(skip, limit, search_term);
      if (resp?.result) {
        setDocuments(resp.result);
        setTotal(resp.total ?? resp.result.length);
      } else {
        setPageError(true);
        if (resp?.detail)
          dispatch.toast.openToast({ status: true, message: resp.detail });
      }
    } catch (err: any) {
      setPageError(true);
      dispatch.toast.openToast({
        status: true,
        message: err?.response?.data?.detail || "Failed to load KB documents",
        type: "error",
      });
    }
  };

  const pollDocumentStatus = (kbDocumentId: number) => {
    pollingIdsRef.current.add(kbDocumentId);
    const intervalId = setInterval(async () => {
      try {
        const resp = await PollKbDocumentStatus(kbDocumentId);
        if (resp?.status === "COMPLETED") {
          clearInterval(intervalId);
          pollingIdsRef.current.delete(kbDocumentId);
          getAllDocuments(0, pageSize.limit, searchTerm);
        }
      } catch (err) {
        clearInterval(intervalId);
        pollingIdsRef.current.delete(kbDocumentId);
      }
    }, 10000);
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (searchTimeoutId) clearTimeout(searchTimeoutId);
    searchTimeoutId = setTimeout(() => {
      setSearchTerm(value);
      getAllDocuments(0, pageSize.limit, value);
    }, 500);
  };

  const onFileUpload = async (data: any) => {
    if (!data?.file) return;
    dispatch.loadingState.startLoading();
    try {
      const response = await CreateKbDocument(data.file, data.productId);
      if (response?.id) {
        dispatch.modal.closeModal();
        getAllDocuments(0, pageSize.limit, searchTerm);
      }
    } catch (err: any) {
      setPageError(true);
      dispatch.toast.openToast({
        status: true,
        message: err?.response?.data?.detail || "Upload failed",
        type: "error",
      });
    } finally {
      dispatch.loadingState.endLoading();
    }
  };

  const onMenuChange = (doc: KbDocument, title: string) => {
    if (title === "Delete Document") {
      setActiveDoc(doc);
      dispatch.modal.openConfirmation();
    }
  };

  const onDeleteConfirm = async () => {
    if (!activeDoc) return;
    try {
      await DeleteKbDocument(activeDoc.id);
      getAllDocuments(0, pageSize.limit, searchTerm);
    } catch (err: any) {
      dispatch.toast.openToast({
        status: true,
        message: err?.response?.data?.detail || "Delete failed",
        type: "error",
      });
    } finally {
      setActiveDoc(null);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col gap-8 overflow-y-hidden">
      {confirmationStatus && (
        <ConfirmationModal
          onSubmit={onDeleteConfirm}
          title="Remove Document"
          content="Are you sure you want to remove this knowledge base document?"
        />
      )}
      {fileUpload.status && (
        <FileEditModal
          onSubmit={onFileUpload}
          defaultValues={{}}
          products={products}
        />
      )}
      {viewerDoc && (
        <KbCitationViewerModal
          isOpen={true}
          onClose={() => setViewerDoc(null)}
          documentId={viewerDoc.id}
          filename={viewerDoc.filename}
          page={1}
        />
      )}
      {toastStatus.status && pageError && (
        <div className="fixed top-15 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}

      <div className="mx-16 flex mt-1 flex-col sm:flex-row sm:justify-between">
        <div className="flex flex-col">
          <Text className="text-[#091E42] ml-1" type="header2">
            Knowledge Base
          </Text>
          <Text type="small" className="text-faint_text ml-1">
            {`(${
              documents.length > 1
                ? documents.length + " Results"
                : documents.length + " Result"
            } of ${total})`}
          </Text>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-5 mt-1 sm:mt-0">
          {isOwner && (
            <Button
              onClick={() => dispatch.modal.openModal("add")}
              custom_type="danger"
              className="bg-danger w-28 h-10 p-2 gap-2 rounded-lg"
              size="custom"
            >
              <img src={AddIcon} alt="add" loading="lazy" />
              <Text type="small">Upload</Text>
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

      <div className="self-center h-full items-center overflow-y-scroll w-full flex flex-col xl:mt-4 gap-4 xl:gap-8">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="w-[25rem] sm:w-[53vw] lg:w-[55rem] xl:w-[65rem] rounded-lg shadow-custom self-center flex flex-col border"
            >
              <div className="flex flex-row justify-between items-center px-8 pt-4 pb-4 min-h-20 gap-4">
                <button
                  onClick={() =>
                    doc.status === "COMPLETED" ? setViewerDoc(doc) : undefined
                  }
                  className="flex flex-1 items-center gap-3 border rounded-full h-10 px-4 py-2 min-w-0"
                  disabled={doc.status !== "COMPLETED"}
                  title={doc.filename}
                >
                  {doc.status === "COMPLETED" ? (
                    <img src={Link} alt="pdf" loading="lazy" />
                  ) : (
                    <LoaderIcon size={20} color="#42526e" />
                  )}
                  <Text className="text-primary_text truncate flex-1 text-left">
                    {doc.filename}
                  </Text>
                  {doc.page_count != null && (
                    <Text type="small" className="text-faint_text">
                      {doc.page_count} pages
                    </Text>
                  )}
                </button>
                {isOwner && (
                  <DropDownMenu
                    onChange={(title: string) => onMenuChange(doc, title)}
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
          <div className="flex justify-center item-center">
            <NoData />
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
