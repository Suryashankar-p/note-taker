import { Fragment, useState, useEffect } from "react";
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
import { useUpdateMember } from "../services/query/query";
import { Dispatch } from "../../../redux/store";

type Props = {
  open: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
};

const EditMemberModal = ({ open, onClose, member }: Props) => {
  const [selectedRole, setSelectedRole] = useState<
    (typeof roles)[number] | null
  >(null);

  const { mutate, isPending } = useUpdateMember();
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

  useEffect(() => {
    if (member) {
      setValue("name", member.name);
      setValue("email", member.email);
      setValue("role", member.role);
      const role = roles.find((r) => r.value === member.role);
      setSelectedRole(role || null);
    }
  }, [member, setValue]);

  const handleRoleChange = (role: (typeof roles)[number]) => {
    setSelectedRole(role);
    setValue("role", role.value, {
      shouldValidate: true,
    });
  };

  const onSubmit = (data: MemberFormData) => {
    if (!member) return;
    mutate(
      { member_id: member.id, name: data.name, role: data.role },
      {
        onSuccess: () => {
          onClose();
          reset();
        },
        onError: (err: any) => {
          const message = err?.message || err?.response?.data?.detail || "Failed to update member. Please try again.";
          dispatch.toast.openToast({ status: true, message, type: "error" });
        },
      }
    );
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={isPending ? () => {} : onClose}>
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
            <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle
                as="h3"
                className="text-[20px] relative text-black font-semibold flex justify-between leading-6 text-gray-900 mb-5"
              >
                <span>Edit Member</span>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="absolute -right-2 -top-2 flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img src={CloseIcon} alt="close" className="w-4 h-4" />
                </button>
              </DialogTitle>

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
                      className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition-all duration-200 focus:border-[#0061F3] focus:ring-2 focus:ring-[#0061F3]/10 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <Listbox.Button className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-[#0061F3] focus:ring-2 focus:ring-[#0061F3]/10 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
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
                                    ? "bg-[#0061F3] text-white"
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
                    disabled
                    placeholder="Enter email address"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 text-sm outline-none transition-all duration-200 placeholder-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 italic">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-white hover:bg-[#004fd1] active:bg-[#003faa] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                  >
                    {isPending ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
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

export default EditMemberModal;
