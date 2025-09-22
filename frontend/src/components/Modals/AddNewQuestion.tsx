import { Dialog, Transition, Textarea, DialogTitle, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import Text from '../Text';
import Close from '../../assets/close.svg';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import SelectTagInput from '../SelectTagInput';
import { useForm, Controller } from 'react-hook-form';

export type DefaultValue = {
    question: string;
    answer: string;
    products?: Tag[];
    models?: Tag[];
    id?: number;
    status?: string;
    created_by?: any;
}

interface Props {
    defaultValue?: DefaultValue;
    productsList?: { id: number; title: string; models: Tag[] }[];
    onSubmit?: any
}

interface Tag {
    id: number | null | string;
    title: string;
}

const AddQuestionModal: React.FC<Props> = ({ defaultValue, productsList = [], onSubmit }) => {
    const QandAOpen = useSelector((state: RootState) => state.modal.qandaOpen);
    const type = QandAOpen.type;
    const dispatch = useDispatch<Dispatch>();
    const [products, setProducts] = useState<Tag[]>([]);
    const [models, setModels] = useState<Tag[]>([]);
    const member = useSelector((state: RootState) => state.memberRole);
    const salesMemberDetails = member.service === 'sales' ? member?.details : {};
    const [submitType, setSubmitType] = useState<string | null>()
    const [modelsRequired, setModelsRequired] = useState<boolean>(false);
    const loading = useSelector((state: RootState) => state.loadingState.status)

    const options = productsList.map((item) => ({
        id: item.id,
        title: item.title
    }));

    const [modelOptions, setModelOptions] = useState<Tag[]>([]);
    const { register, handleSubmit, setValue, formState: { errors }, control } = useForm<DefaultValue>({
        defaultValues: {
            question: '',
            answer: '',
            products: [],
            models: []
        }
    });

    useEffect(() => {
        return () => {
          dispatch.loadingState.endLoading();
        }
      }, [])
      

    useEffect(() => {
        if (defaultValue) {
            setValue('question', defaultValue.question);
            setValue('answer', defaultValue.answer);
            setValue('products', defaultValue.products);
            setValue('models', defaultValue.models);
            if (defaultValue?.products) setProducts(defaultValue.products)
            if (defaultValue?.models) {
                setModels(defaultValue?.models)
                addModels(defaultValue?.products)
            }
        }
    }, [defaultValue, setValue]);

    useEffect(() => {
        setModelsRequired(products.length > 0);
        return () => {
            dispatch.loadingState.endLoading();
        }
    }, [products]);

    const closeModal = () => {
        dispatch.modal.closeQandA();
        dispatch.loadingState.endLoading();

    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
            event.preventDefault(); // Prevent form submission on Enter key press
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
        setModelOptions(allModels)
        setModels(allModels)
        setValue('models', allModels)
    }

    const handle = (data: any) => {
        if (submitType === 'approve') {
            data.status = 'APPROVED'
        }
        if (submitType === 'reject') {
            data.status = 'REJECTED'
        }
        if (!submitType) {
            if (defaultValue?.status === 'APPROVED') {
                data.status = 'REJECTED'
            }
            if (defaultValue?.status === 'REJECTED') {
                data.status = 'APPROVED'
            }
            if (defaultValue?.status === 'IN_REVIEW') {
                data.status = 'IN_REVIEW'
            }
        }
        onSubmit(data)
    }

    const checkDisabled = () => {
        if (type === 'add') {
            return false
        }
        else if (salesMemberDetails?.role === 'OWNER') {
            return false
        }
        else if (salesMemberDetails?.role === 'REVIEWER') {
            if (defaultValue?.created_by === salesMemberDetails?.id) {
                if (defaultValue?.status === 'IN_REVIEW') {
                    return false
                } else {
                    return true
                }
            }
            else {
                return true
            }
        }
        else {
            return true
        }
    }

    const checkSave = () => {
        if (type === 'add') {
            return false
        }
        else if (salesMemberDetails?.role === 'OWNER') {
            return false
        }
        else if (salesMemberDetails?.role === 'REVIEWER') {
            if (defaultValue?.created_by === salesMemberDetails?.id) {
                if (defaultValue?.status === 'IN_REVIEW') {
                    return true
                } else {
                    return false
                }
            }
            else {
                return false
            }
        }
        else {
            return false
        }
    }

    interface LoadingProps {
        title: string
    }
    

    const LoadingComp: React.FC<LoadingProps> = ({ title }) => {
        return (
            <div className="flex items-center">
                <div className="mr-2">{title}</div>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
            </div>
        )
    }

    return (
        <Transition appear show={QandAOpen.status} as={Fragment}>
            <Dialog as="div" className="relative z-100" onClose={closeModal}>
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
                                className="w-full max-w-6xl h-[90vh] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                                style={{ transform: 'translate(70px, -2px)' }}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={handleKeyDown}
                            >
                                <DialogTitle
                                    as="h3"
                                    className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                                >
                                    <Text>{type === 'add' ? "Add New Knowledge" : "Edit knowledge"}</Text>
                                    <button className='absolute -right-2 -top-4' onClick={closeModal}>
                                        <img src={Close} alt="close" loading="lazy" />
                                    </button>
                                </DialogTitle>
                                <form onSubmit={type === 'edit' ? handleSubmit(handle) : handleSubmit(onSubmit)}>
                                    <div className="flex mt-5 flex-col gap-3">
                                        <div className="flex flex-row gap-6">
                                            <div className="flex flex-col w-1/2 space-y-2">
                                                <label><Text className='text-primary_text'>Enter your question*</Text></label>
                                                <Textarea
                                                    className={`w-full h-[20vh] text-primary_text border rounded-md focus:outline-none p-4 ${errors.question ? 'border-red-500' : 'border-gray-300'}`}
                                                    {...register("question", { required: "Field is required" })}
                                                    disabled={checkDisabled()}
                                                />
                                                {errors.question && <span className="text-red-500">{errors.question.message}</span>}
                                            </div>
                                            <div className="flex w-1/2 flex-col space-y-2">
                                                <label><Text className='text-primary_text'>Enter your answer*</Text></label>
                                                <Textarea
                                                    className={`w-full text-primary_text h-[20vh] border rounded-md focus:outline-none p-4 ${errors.answer ? 'border-red-500' : 'border-gray-300'}`}
                                                    {...register("answer", { required: "Field is required" })}
                                                    disabled={checkDisabled()}
                                                />
                                                {errors.answer && <span className="text-red-500">{errors.answer.message}</span>}
                                            </div>
                                        </div>
                                        <div className=" flex flex-row gap-8 -mt-1">
                                            <div className="flex flex-col w-1/2 space-y-2">
                                                <label><Text className='text-primary_text'>Products</Text></label>
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
                                                                addModels(newTags)
                                                                if (newTags.length === 0) setModels([]);
                                                            }}
                                                            options={options}
                                                            disabled={checkDisabled()}
                                                            placeholder="Enter products"
                                                        />
                                                    )}
                                                />
                                                {errors.products && <span className="text-red-500">{errors.products.message}</span>}
                                            </div>
                                            <div className="flex flex-col w-1/2 space-y-2">
                                                <label><Text className='text-primary_text'>Models*</Text></label>
                                                <Controller
                                                    name="models"
                                                    control={control}
                                                    rules={{ required: modelsRequired && "Field is required" }}
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
                                                            disabled={checkDisabled() || products.length < 1}
                                                        />
                                                    )}
                                                />
                                                {errors.models && <span className="text-red-500">{errors.models.message}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute right-6 bottom-5 flex justify-end gap-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={closeModal}
                                        >
                                            <Text type='body'>Cancel</Text>
                                        </button>
                                        {checkSave() && <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2"
                                        >
                                            {loading ? <LoadingComp title='Saving...' /> : <Text type='body'>Save</Text>}
                                        </button>}
                                        {(QandAOpen.type === 'edit' && salesMemberDetails?.role === 'OWNER' && defaultValue?.status === 'APPROVED') &&
                                            <button
                                                type="submit"
                                                onClick={(data: any) => {
                                                    handleSubmit(handle);
                                                    setSubmitType(null)
                                                }}
                                                className="inline-flex justify-center text-white rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2"
                                            >
                                                {loading && submitType === null ? <LoadingComp title='Rejecting...' /> : <Text type='body'>Reject</Text>}
                                            </button>
                                        }
                                        {(QandAOpen.type === 'edit' && salesMemberDetails?.role === 'OWNER' && defaultValue?.status === 'REJECTED') &&
                                            <button
                                                type="submit"
                                                onClick={(data: any) => {
                                                    handleSubmit(handle);
                                                    setSubmitType(null)
                                                }}
                                                className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2"
                                            >
                                                {loading && submitType === null ? <LoadingComp title='Approving...' /> : <Text type='body'>Approve</Text>}
                                            </button>
                                        }
                                        {(QandAOpen.type === 'edit' && salesMemberDetails?.role === 'OWNER' && defaultValue?.status === 'IN_REVIEW') &&
                                            <div className='flex flex-row gap-4'>
                                                <button
                                                    type="submit"
                                                    onClick={(data: any) => {
                                                        handleSubmit(handle);
                                                        setSubmitType('approve')
                                                    }}
                                                    className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2"
                                                >
                                                    {loading && submitType === 'approve' ? <LoadingComp title='Approving...' /> : <Text className='text-white ' type='body'>Approve</Text>}
                                                </button>
                                                <button
                                                    type="submit"
                                                    onClick={(data: any) => {
                                                        handleSubmit(handle);
                                                        setSubmitType('reject')
                                                    }}
                                                    className="inline-flex text-white justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2"
                                                >
                                                    {loading && submitType === 'reject' ? <LoadingComp title='Rejecting...' /> : <Text type='body'>Reject</Text>}
                                                </button>
                                            </div>
                                        }
                                        {QandAOpen.type === 'add' && <button
                                            type="submit"
                                            className={`inline-flex bg-[#0061F3] justify-center rounded-md border border-transparent  px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2`}
                                        >
                                            {loading ? <LoadingComp title={salesMemberDetails?.role === 'OWNER' ? 'Approving...' : 'Revieweing...'} /> : <Text className='text-white' type='body'>{salesMemberDetails?.role === 'OWNER' ? 'Approve' : 'Review'}</Text>}
                                        </button>}
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default AddQuestionModal;
