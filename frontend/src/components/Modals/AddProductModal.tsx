import { Dialog, Transition, Textarea, DialogTitle, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import DropDownButton from '../DropDownButton';
import Text from '../Text';
import Close from '../../assets/close.svg';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import { useForm } from 'react-hook-form';
import Toast from '../Toast';
import TagInput from '../TagInput';

export type DefaultValue = {
    title: string;
    short_title: string;
    description: string;
    models: { id: number | null, title: string }[]; // Update to new models type
    id: string;
}

export interface IFormInput {
    title: string;
    short_title: string;
    description: string;
    models: { id: number | null, title: string }[]; // Update models field in the form input type
}

interface Props {
    defaultValue?: DefaultValue;
    onSubmit?: any;
    service?: string
}


const AddProductModal: React.FC<Props> = ({ defaultValue, onSubmit, service = 'sales' }) => {
    const addProduct = useSelector((state: RootState) => state.modal.addProduct.status);
    const type = useSelector((state: RootState) => state.modal.addProduct.type);
    const dispatch = useDispatch<Dispatch>();
    const { register, handleSubmit, formState: { errors }, setValue, clearErrors } = useForm<IFormInput>();
    const toastStatus = useSelector((state: RootState) => state.toast);
    const [tags, setTags] = useState<{ id: number | null, title: string }[]>([]);
    const closeModal = () => {
        dispatch.modal.closeAddProduct();
    };

    const onProductSubmit = (data: IFormInput) => {
        const body = {
            title: data.title,
            short_title: data.short_title,
            description: data.description,
            models: data.models,
            id: defaultValue?.id
        }
        onSubmit(body);
    }

    useEffect(() => {
        if (defaultValue) {
            setValue('title', defaultValue.title);
            setValue('short_title', defaultValue.short_title);
            setValue('description', defaultValue.description);
            setValue('models', defaultValue.models);
            setTags(defaultValue.models); // Set default value for models field
        }
    }, [defaultValue, setValue]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
            event.preventDefault(); // Prevent form submission on Enter key press
        }
    };

    const onTagChange = (data: { id: number | null, title: string }[]) => {
        if (data) {
            clearErrors('models');
            setTags(data);
            setValue('models', data);
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
                                className="w-full max-w-3xl h-fit transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                                style={{ transform: 'translate(60px, -3px)' }}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={handleKeyDown} // Handle key events to prevent form submission
                            >
                                <DialogTitle
                                    as="h3"
                                    className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                                >
                                    <Text>{type === 'add' ? "Add New Product" : "Edit Product"}</Text>
                                    <button className='absolute -right-2 -top-4' onClick={closeModal}>
                                        <img src={Close} alt="close" loading="lazy" />
                                    </button>
                                </DialogTitle>
                                <form onSubmit={handleSubmit(onProductSubmit)}>
                                    {toastStatus.status && (
                                        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
                                            <Toast type='error' />
                                        </div>
                                    )}
                                    <div className="flex flex-col mt-5 gap-6">
                                        <div className="flex flex-row space-x-4">
                                            <div className="w-1/2 flex-col space-y-2">
                                                <label><Text className='text-primary_text'>Full name*</Text></label>
                                                <input
                                                    type="text"
                                                    className={`w-full h-12 border rounded-md focus:outline-none p-4 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder='Full name'
                                                    defaultValue={type === 'edit' ? defaultValue?.title : ''}
                                                    {...register("title", { required: "Field is required" })}
                                                />
                                                {errors.title && <span className="text-red-500">{errors.title.message}</span>}
                                            </div>
                                            <div className="w-1/2 flex-col space-y-2">
                                                <label><Text className='text-primary_text'>Short name*</Text></label>
                                                <input
                                                    type="text"
                                                    className={`w-full h-12 border rounded-md focus:outline-none p-4 ${errors.short_title ? 'border-red-500' : 'border-gray-300'}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder='Short name'
                                                    defaultValue={type === 'edit' ? defaultValue?.short_title : ''}
                                                    {...register("short_title", { required: "Field is required" })}
                                                />
                                                {errors.short_title && <span className="text-red-500">{errors.short_title.message}</span>}
                                            </div>
                                        </div>
                                        
                                       {service==='sales' &&<div className="w-full flex-col space-y-2">
                                            <label><Text className='text-primary_text'>Models*</Text></label>
                                            <TagInput
                                                value={tags}
                                                onChange={onTagChange}
                                                // register={register}
                                                error={errors.models?.message}
                                                placeholder='Enter models'
                                            />
                                            {errors.models && <span className="text-red-500">{errors.models.message}</span>}
                                        </div>}
                                        <div className="w-full flex-col space-y-2 h-[15vh]">
                                            <label><Text className='text-primary_text'>Description*</Text></label>
                                            <Textarea
                                                className={`w-full h-full border rounded-md focus:outline-none p-4 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder='Description'
                                                defaultValue={type === 'edit' ? defaultValue?.description : ''}
                                                {...register("description", { required: "Field is required" })}
                                            />
                                            {errors.description && <span className="text-red-500">{errors.description.message}</span>}
                                        </div>

                                    </div>
                                    <div className="mt-12 flex justify-end gap-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={closeModal}
                                        >
                                            <Text type='small'>Cancel</Text>
                                        </button>
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2"
                                        >
                                            <Text type='small'>Save</Text>
                                        </button>
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

export default AddProductModal;