import { Fragment, useState, useEffect } from "react";
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

  const { mutate } = useUpdateMember();

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
        onError: (err) => {
          console.log(err);
        },
      }
    );
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
                  Edit Member
                </DialogTitle>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <img src={CloseIcon} alt="close" className="w-5 h-5 text-gray-500" />
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
                      {...register("name")}
                      className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition-all duration-200 focus:border-[#e03639] focus:ring-2 focus:ring-[#e03639]/10 placeholder-gray-400"
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

                    <Listbox value={selectedRole} onChange={handleRoleChange}>
                      <div className="relative">
                        <Listbox.Button className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-sm focus:border-[#e03639] focus:ring-2 focus:ring-[#e03639]/10 focus:outline-none transition-all duration-200">
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
                    disabled
                    placeholder="Enter email address"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 text-sm outline-none transition-all duration-200 placeholder-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 italic">
                    Email address cannot be changed
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-lg bg-[#e03639] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#c92e32] active:bg-[#b0282c] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Save Changes
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
