import { Fragment, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Listbox,
  Transition,
  TransitionChild,
} from "@headlessui/react";

import CloseIcon from "../../../assets/close.svg";
import DropDownIcon from "../../../assets/down_arrow.svg.svg";
import { roles } from "../constants/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MemberFormData,
  memberSchema,
} from "../validations/memberValidation";
import { useCreateMember } from "../services/query/query";
import { Dispatch } from "../../../redux/store";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AddMemberModal = ({ open, onClose }: Props) => {
  const [selectedRole, setSelectedRole] = useState<
    (typeof roles)[number] | null
  >(null);

  const { mutate, isPending } = useCreateMember();
  const dispatch = useDispatch<Dispatch>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
    },
  });
  const handleRoleChange = (role: (typeof roles)[number]) => {
    setSelectedRole(role);
    setValue("role", role.value, {
      shouldValidate: true,
    });
  };
  const onSubmit = (data: MemberFormData) => {
    console.log(data)
    mutate(data, {
      onSuccess: () => {
        reset();
        setSelectedRole(null);
        onClose();
      },
      onError: (err: any) => {
        const message = err?.message || err?.response?.data?.detail || "Failed to add member. Please try again.";
        dispatch.toast.openToast({ status: true, message, type: "error" });
      },
    });
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
              <div className="mb-6 flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold text-[#0D1431]">
                  Add New Member
                </DialogTitle>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="flex h-20 w-20 items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img src={CloseIcon} alt="close" className="w-16 h-16 text-gray-500" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Name<span className="text-[#e03639]"> *</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter full name"
                      disabled={isPending}
                      {...register("name")}
                      className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition-all duration-200 focus:border-[#e03639] focus:ring-2 focus:ring-[#e03639]/10 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-sm text-[#e03639] font-medium">
                        {String(errors.name.message)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Role<span className="text-[#e03639]"> *</span>
                    </label>

                    <Listbox value={selectedRole} onChange={handleRoleChange} disabled={isPending}>
                      <div className="relative">
                        <Listbox.Button className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-[#e03639] focus:ring-2 focus:ring-[#e03639]/10 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                          <span className={selectedRole ? "text-gray-900" : "text-gray-400"}>{selectedRole?.name || "Select role"}</span>

                          <img src={DropDownIcon} alt="dropdown" className="h-4 w-4 text-gray-500" />
                        </Listbox.Button>

                        <Listbox.Options className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white py-1.5 shadow-xl focus:outline-none">
                          {roles.map((role) => (
                            <Listbox.Option
                               key={role.id}
                              value={role}
                              className={({ active, selected }) =>
                                `cursor-pointer px-4 py-2.5 text-sm rounded-md transition-all duration-150 ${
                                  active
                                    ? "bg-[#e03639] text-white"
                                    : "text-gray-700 hover:bg-gray-50"
                                } ${selected ? "font-semibold" : ""}`
                              }
                            >
                              {role.name}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </div>
                    </Listbox>
                    {errors.role && (
                      <p className="mt-1.5 text-sm text-[#e03639] font-medium">
                        {String(errors.role.message)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address<span className="text-[#e03639]"> *</span>
                  </label>

                  <input
                    type="email"
                    {...register("email")}
                    disabled={isPending}
                    placeholder="Enter email address"
                    className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition-all duration-200 focus:border-[#e03639] focus:ring-2 focus:ring-[#e03639]/10 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-[#e03639] font-medium">
                      {String(errors.email.message)}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-[#e03639] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#c92e32] active:bg-[#b0282c] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : (
                      "Add Member"
                    )}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddMemberModal;