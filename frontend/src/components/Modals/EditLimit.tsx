import { Dialog, Transition, DialogTitle, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import Text from '../Text';
import Toast from '../Toast';
import Close from '../../assets/close.svg';

interface DefaultValue {
    limit: number;
    id?: string;
}

interface Props {
    defaultValue?: any;
    onSubmit?: any;
}

interface IFormInput {
    limit: number;
}

const EditLimitModal: React.FC<Props> = ({ defaultValue, onSubmit }) => {
    const editLimit = useSelector((state: RootState) => state.modal.editLimit);
    const dispatch = useDispatch<Dispatch>();
    const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>({
        defaultValues: {
            limit: defaultValue || 0,
        }
    });
    const toastStatus = useSelector((state: RootState) => state.toast);

    const closeModal = () => {
        dispatch.modal.closeEditLimit();
    };

    const onLimitSubmit = (data: IFormInput) => {
        const body = {
            limit: data?.limit,
        };
        onSubmit(body);
    };

    return (
        <Transition appear show={editLimit} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
                                className="w-full max-w-md h-fit transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <DialogTitle
                                    as="h3"
                                    className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                                >
                                    <Text>Edit Limit</Text>
                                    <button className='absolute -right-2 -top-4' onClick={closeModal}>
                                        <img src={Close} alt="close" loading="lazy" />
                                    </button>
                                </DialogTitle>
                                <form onSubmit={handleSubmit(onLimitSubmit)}>
                                    {toastStatus.status && (
                                        <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
                                            <Toast type='error' />
                                        </div>
                                    )}
                                    <div className="flex flex-col mt-5 gap-6">
                                        <div className="w-full flex-col space-y-2">
                                            <label><Text className='text-primary_text'>Limit*</Text></label>
                                            <input
                                                type="number"
                                                step="any"
                                                className={`w-full h-12 border rounded-md focus:outline-none p-4 ${errors.limit ? 'border-red-500' : 'border-gray-300'}`}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder='Limit'
                                                {...register("limit", {
                                                    required: "Field is required",
                                                    min: { value: 0, message: "Limit must be a positive number" },
                                                    valueAsNumber: true
                                                })}
                                            />
                                            {errors.limit && <span className="text-red-500">{errors.limit.message}</span>}
                                        </div>
                                    </div>
                                    <div className="mt-8 flex justify-end gap-4">
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

export default EditLimitModal;
