import { Dialog, Transition, DialogTitle, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import Text from '../Text';
import Close from '../../assets/close.svg';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import { useForm } from 'react-hook-form';
import Toast from '../Toast';

export type DefaultValue = {
    product_title: string;
    id: number
}

export interface IFormInput {
    product_title: string;
}

interface Props {
    defaultValue?: DefaultValue;
    onSubmit?: any;
}


const AddProductModal: React.FC<Props> = ({ defaultValue, onSubmit }) => {
    const addProduct = useSelector((state: RootState) => state.modal.addProduct.status);
    const type = useSelector((state: RootState) => state.modal.addProduct.type);
    const dispatch = useDispatch<Dispatch>();
    const { register, handleSubmit, formState: { errors }, setValue, clearErrors } = useForm<IFormInput>();
    const toastStatus = useSelector((state: RootState) => state.toast);
    const [tags, setTags] = useState<{ id: number | null, product_title: string }[]>([]);
    const closeModal = () => {
        dispatch.modal.closeAddProduct();
    };

    const onProductSubmit = (data: IFormInput) => {
        const body = {
            product_title: data.product_title,
        }
        onSubmit(body);
    }

    useEffect(() => {
        if (defaultValue) {
            setValue('product_title', defaultValue.product_title);
        }
    }, [defaultValue, setValue]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
            event.preventDefault();
        }
    };

    return (
        <Transition appear show={addProduct} as={Fragment}>
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
                <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
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
                            className="w-full max-w-lg sm:max-w-auto h-fit transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-left align-middle shadow-xl transition-all"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={handleKeyDown}
                        >
                            <DialogTitle
                                as="h3"
                                className="text-[20px] sm:text-[24px] relative text-black font-medium flex justify-between leading-6"
                            >
                                <Text>{type === 'add' ? "Add New Product" : "Edit Product"}</Text>
                                <button className="absolute -right-2 -top-4 sm:-top-6" onClick={closeModal}>
                                    <img src={Close} alt="close" loading="lazy" />
                                </button>
                            </DialogTitle>
                                <form onSubmit={handleSubmit(onProductSubmit)}>
                                {toastStatus.status && (
                                    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
                                        <Toast type="error" />
                                    </div>
                                )}
    
                                <div className="flex flex-col mt-5 gap-4">
                                    <div className="flex flex-col sm:flex-row sm:space-x-4">
                                        <div className="w-full  flex-col space-y-2">
                                            <label>
                                                <Text className="text-primary_text">Product Title*</Text>
                                            </label>
                                            <input
                                                type="text"
                                                className={`w-full h-12 border rounded-md focus:outline-none p-4 ${
                                                    errors.product_title ? "border-red-500" : "border-gray-300"
                                                }`}
                                                placeholder="Product Title"
                                                defaultValue={type === "edit" ? defaultValue?.product_title : ""}
                                                {...register("product_title", { required: "Field is required" })}
                                            />
                                            {errors.product_title && (
                                                <span className="text-red-500">{errors.product_title.message}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                    <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
                                    <button
                                        type="button"
                                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={closeModal}
                                    >
                                        <Text type="small">Cancel</Text>
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2"
                                    >
                                        <Text type="small">Save</Text>
                                    </button>
                                </div>
                            </form>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
    
}

export default AddProductModal;