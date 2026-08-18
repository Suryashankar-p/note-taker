import { Dialog, Transition, DialogTitle, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import Text from '../Text';
import Close from '../../assets/close.svg';

interface Props {
    title: string;
    content: string;
    onSubmit: () => void;
}

const ConfirmationModal: React.FC<Props> = ({ title, content, onSubmit }) => {
  const confirmationStatus = useSelector((state: RootState) => state.modal.confirmation);
  const dispatch = useDispatch<Dispatch>();

    const closeModal = () => {
       dispatch.modal.closeConfirmation();
    };

    return (
        <>
            <Transition appear show={confirmationStatus} as={Fragment}>
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
                                    className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <DialogTitle
                                        as="h3"
                                        className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                                    >
                                        <Text>{title}</Text>
                                        <button className='absolute -right-4 -top-5' onClick={closeModal}>
                                            <img src={Close} alt="close" loading="lazy" />
                                        </button>
                                    </DialogTitle>
                                    <div className="mb-2 mt-5">
                                        <p className="text-sm text-gray-500">{content}</p>
                                    </div>
                                    <div className="mt-5 flex justify-end gap-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={closeModal}
                                        >
                                            <Text type='small'>Cancel</Text>
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2"
                                            onClick={() => {
                                                onSubmit();
                                                closeModal();
                                            }}
                                        >
                                            <Text type='small'>Confirm</Text>
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default ConfirmationModal;
