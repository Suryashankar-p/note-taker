import {
  Dialog,
  Transition,
  DialogTitle,
  DialogPanel,
  TransitionChild,
  Textarea,
} from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Text from "../Text";
import Close from "../../assets/close.svg";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import SelectTagInput from "../SelectTagInput";
import { Controller, useForm } from "react-hook-form";
import Toast from "../Toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import FileViewModal from "./FileViewModal";
import { getFileType } from "../../utils/functions";
import { ReadProductDocumentUrl } from "../../services/sales";

export type DefaultValue = {
  updated_question: string;
  updated_answer: string;
  products?: Tag[];
  models?: Tag[];
  id?: number;
  status?: string;
  created_by?: any;
  like?: boolean;
  question?: string;
  answer?: string;
  dislike_reason?: string;
  source?: [];
};
interface Tag {
  id: number | null | string;
  title: string;
}

interface Props {
  defaultValue?: DefaultValue;
  productsList?: { id: number; title: string; models: Tag[] }[];
  formSubmit?: any;
}

const FeedbackReview: React.FC<Props> = ({
  productsList = [],
  defaultValue,
  formSubmit,
}) => {
  const feedbackReviewState = useSelector(
    (state: RootState) => state.modal.feedbackReview
  );
  const type = feedbackReviewState.type;
  const dispatch = useDispatch<Dispatch>();
  const [products, setProducts] = useState<Tag[]>([]);
  const [models, setModels] = useState<Tag[]>([]);
  const [modelOptions, setModelOptions] = useState<Tag[]>([]);
  const [modelsRequired, setModelsRequired] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"feedback" | "review">("feedback");
  const member = useSelector((state: RootState) => state.memberRole);
  const cyberBuddyMemberDetails = member.service === "cyberbuddy" ? member?.details : {};

  const salesMemberDetails = member.service === "sales" ? member?.details : {};
  // Smart-troubleshooting has no REVIEWER role; only OWNER can approve/reject.
  // Members are blocked from this modal entirely upstream.
  const troubleshootingMemberDetails =
    member.service === "troubleshooting" ? member?.details : {};
  const [submitType, setSubmitType] = useState<string>("");
  const toastStatus = useSelector((state: RootState) => state.toast);
  const dislikeReason = [{ id: 1, name: defaultValue?.dislike_reason }];
  const loading = useSelector((state: RootState) => state.loadingState.status);
  const [fileShow, setFileShow] = useState(false);
  const [fileData, setFileData] = useState();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = useForm<DefaultValue>({
    defaultValues: {
      updated_question: "",
      updated_answer: "",
      products: [],
      models: [],
    },
  });

  useEffect(() => {
    setModelsRequired(products.length > 0);
    return () => {
      dispatch.loadingState.endLoading();
    };
  }, [products]);

  useEffect(() => {
    if (defaultValue) {
      setValue("updated_question", defaultValue.updated_question);
      setValue("updated_answer", defaultValue.updated_answer);
      setValue("products", defaultValue.products || []);
      setValue("models", defaultValue.models || []);
      if (defaultValue?.products) setProducts(defaultValue.products);
      if (defaultValue?.models) {
        setModels(defaultValue?.models);
        addModels(defaultValue?.products);
      }
    }
  }, [defaultValue, setValue]);

  const options = productsList.map((item) => ({
    id: item.id,
    title: item.title,
  }));

  const closeModal = () => {
    dispatch.modal.closeFeedbackReview();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      event.preventDefault(); // Prevent form submission on Enter key press
    }
  };

  const handleNext = () => {
    if (activeTab === "feedback") {
      setActiveTab("review");
    }
  };

  const addModels = (products: any) => {
    const filteredProducts = productsList.filter((product: any) =>
      products.some((selected: any) => selected.title === product.title)
    );
    const allModels: { title: string; id: number }[] = [];
    filteredProducts.forEach((product: any) => {
      allModels.push(...product.models);
    });
    setModelOptions(allModels);
    setModels(allModels);
    setValue("models", allModels);
  };

  const checkDisabled = () => {
    if (
      defaultValue?.status === "APPROVED" ||
      defaultValue?.status === "REJECTED"
    )
      return true;
    else if (salesMemberDetails?.role === "MEMBER") return true;
    else if (salesMemberDetails?.role === "REVIEWER") {
      if (defaultValue?.status !== "NOT_REVIEWED") return true;
    }
    else if (cyberBuddyMemberDetails?.role === "MEMBER") return true;
    else if (cyberBuddyMemberDetails?.role === "REVIEWER") {
      if (defaultValue?.status !== "NOT_REVIEWED") return true;
    }
    else if (troubleshootingMemberDetails?.role === "MEMBER") return true;
  };

  const bgFinder = (like: boolean | undefined) => {
    if (like === false) return "bg-red-200";
    else if (like === true) return "bg-green-200";
    else return "bg-";
  };

  const onSubmit = (data: DefaultValue) => {
    if (submitType === "approve") {
      data.status = "APPROVED";
    } else if (submitType === "reject") {
      data.status = "REJECTED";
    } else if (submitType === "inReview") {
      data.status = "IN_REVIEW";
    }
    formSubmit(data);
  };

  interface LoadingProps {
    title: string;
  }

const SourceComponent = () => {
  return (
    <div className="flex flex-col">
      <Text type="body" className="text-primary_text mb-1">
        Source:
      </Text>
      <div className="flex flex-wrap gap-2">
        {defaultValue?.source?.map((item: any) => (
          <div
            key={item.id}
            className={`${bgFinder(
              defaultValue?.like
            )} h-9 px-4 flex items-center rounded-full border border-gray-200 text-primary_text cursor-pointer`}
            onClick={() => onSourceClick(item)}
          >
            <Text type="small" className="whitespace-nowrap">{item?.name}</Text>
          </div>
        ))}
      </div>
    </div>
  );
};

  const LoadingComp: React.FC<LoadingProps> = ({ title }) => {
    return (
      <div className="flex items-center">
        <div className="mr-2">{title}</div>
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    );
  };

  const onSourceClick = async (item: any) => {
    try {
      if (item?.product_id) {
        const linkResp = await ReadProductDocumentUrl(item?.product_id, item?.product_document_id);
        if (linkResp?.link) {
          let fileInfo: any = {
            name: item.name,
            type: getFileType(item?.name),
            url: linkResp?.link,
          };
          setFileData(fileInfo);
          setFileShow(true);
        }
      }
    } catch (error) {
      console.error("Error fetching file URL:", error);
      // Handle error appropriately, e.g., show a toast notification
    }
  };

  return (
    <Transition appear show={feedbackReviewState.status} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0061F3]/10" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className="w-full max-w-3xl xl:max-w-6xl xl:h-[96vh] h-[94vh] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
              >
                <DialogTitle
                  as="h3"
                  className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                >
                  <Text>
                    {type === "add" ? "Add New Feedback" : "Edit Feedback"}
                  </Text>
                  <button
                    className="absolute -right-2 -top-4"
                    onClick={closeModal}
                  >
                    <img src={Close} alt="close" loading="lazy" />
                  </button>
                </DialogTitle>
                <div className="mt-2 relative h-screen">
                  {fileShow && (
                    <FileViewModal
                      fileUrl={fileData}
                      isOpen={fileShow}
                      onClose={() => setFileShow(false)}
                    />
                  )}
                  <div className="flex border-b border-gray-200">
                    <button
                      className={`py-2 px-4 text-sm font-medium ${
                        activeTab === "feedback"
                          ? "border-b-2 border-danger text-danger"
                          : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("feedback")}
                    >
                      Feedback
                    </button>
                    <button
                      className={`py-2 px-4 text-sm font-medium ${
                        activeTab === "review"
                          ? "border-b-2 border-danger text-danger"
                          : "text-gray-500"
                      }`}
                      onClick={() => setActiveTab("review")}
                    >
                      Review
                    </button>
                  </div>
                  <div className="mt-2">
                    {activeTab === "feedback" && (
                      <div className="flex flex-col mt-2 mx-2 p-2 gap-2 xl:gap-8">
                        <div className="border rounded-lg overflow-y-auto w-full bg-[#F3F1FF] h-[16vh] p-1 border-black-800">
                          <Text type="body" className="text-primary_text">
                            Question:
                          </Text>
                          <Text type="small" className="text-primary_text mx-2">
                            {defaultValue?.updated_question}
                          </Text>
                        </div>
                        <div className="border rounded-lg overflow-y-auto w-full h-[16vh] xl:h-[10rem] bg-[#F3F1FF] p-1 border-black-800">
                          <Text type="body" className="text-primary_text">
                            Answer:
                          </Text>
                          <Text type="small" className="text-primary_text mx-2">
                            <ReactMarkdown
                              children={
                                checkDisabled()
                                  ? defaultValue?.updated_answer
                                  : defaultValue?.answer
                              }
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              className="prose text-[14px] font-normal text-primary_text"
                              components={{
                                a: ({ node, ...props }) => (
                                  <a
                                    {...props}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {props.children}
                                  </a>
                                ),
                              }}
                            />
                          </Text>
                        </div>
                        <div className="flex flex-col justify-start gap-1">
                          <div className="flex flex-row items-center gap-2">
                            <label>
                              <Text
                                className="text-primary_text"
                                type="bold-body"
                              >
                                Status:
                              </Text>
                            </label>
                            <div className="flex flex-row gap-2">
                              <div
                                className={`${bgFinder(
                                  defaultValue?.like
                                )} rounded-full p-2 border border-gray-200 text-primary_text`}
                              >
                                <Text type="small">
                                  {defaultValue?.like === true
                                    ? "Liked"
                                    : defaultValue?.like === false
                                    ? "Disliked"
                                    : "Not Specified"}
                                </Text>
                              </div>
                            </div>
                          </div>
                          {defaultValue?.like === false && (
                            <div className="flex flex-col items-start">
                              <label>
                                <Text
                                  className="text-primary_text"
                                  type="bold-body"
                                >
                                  Dislike Reason:
                                </Text>
                              </label>
                              <div className="flex flex-row gap-2">
                                {dislikeReason?.map((item) => (
                                  <div
                                    key={item.id}
                                    className="rounded-lg p-2 border bg-[#F3F1FF] border-gray-200 h-[15vh] overflow-y-auto w-[50vw] text-primary_text"
                                  >
                                    <Text
                                      className="text-primary_text"
                                      type="small"
                                    >
                                      {item.name}
                                    </Text>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <SourceComponent />
                      </div>
                    )}
                    {activeTab === "review" && (
                      <form onSubmit={handleSubmit(onSubmit)}>
                        {toastStatus.status && (
                          <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
                            <Toast type="error" />
                          </div>
                        )}
                        <div className="flex flex-col m-2 p-2 gap-4">
                          <div className="flex flex-row gap-4 ">
                            <div className="w-1/2 flex flex-col gap-2">
                              <label>
                                <Text className="text-primary_text">
                                  Edit question
                                </Text>
                              </label>
                              <Textarea
                                className={`w-full text-primary_text h-[20vh] border rounded-md focus:outline-none p-4 'border-gray-300'`}
                                defaultValue={defaultValue?.updated_question}
                                disabled={checkDisabled()}
                                {...register("updated_question", {
                                  required: "Field is required",
                                })}
                              />
                              {errors.updated_question && (
                                <span className="text-red-500">
                                  {errors.updated_question.message}
                                </span>
                              )}
                            </div>
                            <div className="w-1/2 flex flex-col gap-2">
                              <label>
                                <Text className="text-primary_text">
                                  Edit answer
                                </Text>
                              </label>
                              <Textarea
                                className={`w-full text-primary_text font-mono whitespace-pre h-[20vh] border rounded-md focus:outline-none p-4 border-gray-300`}
                                defaultValue={
                                  defaultValue?.updated_answer ||
                                  defaultValue?.answer
                                }
                                disabled={checkDisabled()}
                                {...register("updated_answer", {
                                  required: "Field is required",
                                })}
                              />
                              {errors.updated_answer && (
                                <span className="text-red-500">
                                  {errors.updated_answer.message}
                                </span>
                              )}
                            </div>
                          </div>
                          {member?.service === "sales" && (
                            <div className="flex flex-row gap-4">
                              <div className="flex flex-col w-1/2 space-y-2">
                                <label>
                                  <Text className="text-primary_text">
                                    Products
                                  </Text>
                                </label>
                                <Controller
                                  name="products"
                                  control={control}
                                  render={({ field }) => (
                                    <SelectTagInput
                                      {...field}
                                      value={products}
                                      onChange={(newTags) => {
                                        field.onChange(newTags);
                                        setProducts(newTags);
                                        addModels(newTags);
                                        if (newTags.length === 0) setModels([]);
                                      }}
                                      options={options}
                                      disabled={checkDisabled()}
                                      placeholder="Enter products"
                                    />
                                  )}
                                />
                                {errors.products && (
                                  <span className="text-red-500">
                                    {errors.products.message}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col w-1/2 space-y-2">
                                <label>
                                  <Text className="text-primary_text">
                                    Models*
                                  </Text>
                                </label>
                                <Controller
                                  name="models"
                                  control={control}
                                  rules={{
                                    required:
                                      modelsRequired && "Field is required",
                                  }}
                                  render={({ field }) => (
                                    <SelectTagInput
                                      {...field}
                                      value={models}
                                      onChange={(newCategories) => {
                                        field.onChange(newCategories);
                                        setModels(newCategories);
                                      }}
                                      options={modelOptions}
                                      placeholder="Enter models"
                                      disabled={
                                        checkDisabled() || products.length < 1
                                      }
                                    />
                                  )}
                                />
                                {errors.models && (
                                  <span className="text-red-500">
                                    {errors.models.message}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                        <SourceComponent />
                        <div className="fixed right-10 bottom-8 flex space-x-4">
                          <button
                            className="py-2 px-4 text-gray-700 rounded-md"
                            onClick={closeModal}
                          >
                            <Text type="body">Cancel</Text>
                          </button>
                          {salesMemberDetails?.role === "OWNER" ||
                          cyberBuddyMemberDetails?.role === "OWNER" ||
                          troubleshootingMemberDetails?.role === "OWNER" ? (
                            <div className="flex flex-row gap-4">
                              {defaultValue?.status !== "APPROVED" && (
                                <button
                                  type="submit"
                                  className="py-2 px-4 bg-[#0061F3] text-white rounded-md"
                                  onClick={() => setSubmitType("approve")}
                                >
                                  {loading && submitType === "approve" ? (
                                    <LoadingComp title="Approving" />
                                  ) : (
                                    <Text type="body">Approve</Text>
                                  )}
                                </button>
                              )}
                              {defaultValue?.status !== "REJECTED" && (
                                <button
                                  type="submit"
                                  className="py-2 px-4 bg-[#0061F3] text-white rounded-md"
                                  onClick={() => setSubmitType("reject")}
                                >
                                  {loading && submitType === "reject" ? (
                                    <LoadingComp title="Rejecting..." />
                                  ) : (
                                    <Text type="body">Reject</Text>
                                  )}
                                </button>
                              )}
                            </div>
                          ) : (
                            (salesMemberDetails?.role === "REVIEWER" || cyberBuddyMemberDetails?.role === "REVIEWER") &&
                            defaultValue?.status === "NOT_REVIEWED" && (
                              <button
                                type="submit"
                                className="py-2 px-4 bg-[#0061F3] text-white rounded-md"
                                onClick={() => setSubmitType("inReview")}
                              >
                                {loading && submitType === "inReview" ? (
                                  <LoadingComp title="Reviewing..." />
                                ) : (
                                  <Text type="body">Review</Text>
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                  {activeTab === "feedback" && (
                    <div className="fixed right-10 bottom-4 flex space-x-4">
                      <button
                        className="py-2 px-4 text-gray-700 rounded-md"
                        onClick={closeModal}
                      >
                        <Text type="body">Cancel</Text>
                      </button>
                      <button
                        className="py-2 px-4 bg-blue-600 text-white rounded-md"
                        onClick={handleNext}
                      >
                        <Text type="body">Next</Text>
                      </button>
                    </div>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FeedbackReview;