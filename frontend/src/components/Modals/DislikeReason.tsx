import { Dialog, Transition, Textarea, DialogTitle, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import DropDownButton from '../DropDownButton';
import Text from '../Text';
import Close from '../../assets/close.svg';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import { useForm, Controller } from 'react-hook-form';
import RadioButtonGroup from '../RadioGroup';


interface Props {
    onSubmit?: any;
}

interface IFormInput {
    dislikeReason: string;
    customReason?: string;
    suggestedAnswer?: string
}

const radioList = [
    { id: 1, name: 'Incorrect Answer' },
    { id: 2, name: 'Incorrect Follow Up' },
    { id: 3, name: 'Incomplete Answer' },
    { id: 4, name: 'Other' }
]

const DislikeReason: React.FC<Props> = ({ onSubmit }) => {
    const openModal = useSelector((state: RootState) => state.modal.dislikeReason.status);
    const type = useSelector((state: RootState) => state.modal.dislikeReason.type);
    const dispatch = useDispatch<Dispatch>();
    const { register, handleSubmit, control, setValue, watch, formState: { errors }, clearErrors } = useForm<IFormInput>();
    const [radioValue, setRadioValue] = useState<typeof radioList[0]>();

    const closeModal = () => {
        dispatch.modal.CloseDislikeReason();
    };

    const onRadioButtonChange = (value: any) => {
        setRadioValue(value);
        setValue("dislikeReason", value.name);
    }

    const watchRadioValue = watch("dislikeReason");

    useEffect(() => {
        if (watchRadioValue !== 'Other') {
            setValue("customReason", '');
        }
    }, [watchRadioValue, setValue]);

    return (
        <Transition appear show={openModal} as={Fragment}>
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
                    <div className="fixed inset-0 bg-[#0061F3]/10  " />
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
                                className="w-full max-w-3xl h-fit fixed left-45 transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                                style={{ transform: 'translate(40px, 30px)' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <DialogTitle
                                    as="h3"
                                    className="text-[24px] ml-2 relative text-black font-medium flex justify-between leading-6 text-gray-900"
                                >
                                    <Text>{type === 'add' ? "Dislike Reason" : "Edit Product"}</Text>
                                    <button className='absolute -right-2 -top-4' onClick={closeModal}>
                                        <img src={Close} alt="close" loading="lazy" />
                                    </button>
                                </DialogTitle>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <div className="flex flex-col gap-6 m-4 relative">
                                        <div className='flex mb-9 flex-col'>
                                            <Controller
                                                name="dislikeReason"
                                                control={control}
                                                rules={{ required: "Please select a reason" }}
                                                render={({ field }) => (
                                                    <RadioButtonGroup
                                                        radioList={radioList}
                                                        onChange={(value: any) => {
                                                            onRadioButtonChange(value);
                                                            field.onChange(value.name);
                                                            clearErrors('customReason')
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>
                                        {errors.dislikeReason && <Text className="text-red-500">{errors.dislikeReason.message}</Text>}
                                        {radioValue?.name === 'Other' && (
                                            <div className="flex flex-col gap-1">
                                                <label><Text type='body' className='text-primary_text'>Custom Reason</Text></label>
                                                <Textarea
                                                    className="w-full h-fit border rounded-md focus:outline-none p-4"
                                                    onClick={(e) => e.stopPropagation()}
                                                    placeholder='You can provide a custom reason here'
                                                    {...register("customReason", { required: radioValue?.name === 'Other' ? "Field is required" : false })}
                                                />
                                                {errors.customReason && <Text className="mx-2 text-red-500">{errors.customReason.message}</Text>}
                                            </div>
                                        )}
                                        <div className='flex flex-col gap-1'>
                                            <label><Text type='body' className='text-primary_text'>Suggested Answer</Text></label>
                                            <Textarea
                                                className="w-full h-full border rounded-md focus:outline-none p-4"
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder='Optional'
                                                {...register("suggestedAnswer")}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end mr-4 gap-4">
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

export default DislikeReason;
