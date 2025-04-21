import React, { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import Text from "../Text";
import Close from "../../assets/close.svg";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import SelectTagInput from "../SelectTagInput";
import { Controller, useForm } from "react-hook-form";
import Toast from "../Toast";

const FeedbackQAViewer = ({ data, isOpen, onClose }) => {
  const dispatch = useDispatch<Dispatch>();
  const feedbackReviewState = useSelector(
    (state: RootState) => state.feedbackReview
  );
  const { control, handleSubmit } = useForm();

  const closeModal = () => {
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Your key down handling logic here
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
                className="w-full max-w-3xl h-[94vh] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
              >
                <DialogTitle
                  as="h3"
                  className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                >
                  <Text>{data?.name}</Text>
                  <button
                    className="absolute -right-2 -top-4"
                    onClick={closeModal}
                  >
                    <img src={Close} alt="close" loading="lazy" />
                  </button>
                </DialogTitle>
                <div className="flex flex-col mt-12 mx-2 p-2 gap-12">
                  <div className="border rounded-lg overflow-y-auto w-full bg-[#F3F1FF] max-h-40 min-h-20 p-1 border-black-800">
                    <Text type="body" className="text-primary_text">
                      Question:
                    </Text>
                    <Text type="small" className="text-primary_text mx-2">
                      {data?.question}
                    </Text>
                  </div>
                  <div className="border rounded-lg overflow-y-auto w-full max-h-80 min-h-20 bg-[#F3F1FF] p-1 border-black-800">
                    <Text type="body" className="text-primary_text">
                      Answer:
                    </Text>
                    <Text type="small" className="text-primary_text mx-2">
                      {data?.answer}
                    </Text>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FeedbackQAViewer;
