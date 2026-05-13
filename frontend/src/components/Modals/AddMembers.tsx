import React, { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  Transition,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { useLocation } from "react-router-dom";
import DropDownButton from "../DropDownButton";
import Text from "../Text";
import Close from "../../assets/close.svg";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import { useForm } from "react-hook-form";
import Toast from "../Toast";
import { capitalizeWords, roleMapping } from "../../utils/functions.ts";
import {
  listValues_normal,
  listValues_sales,
  roleMapping_normal,
  roleMapping_sales,
} from "../../utils/constants.ts";
import { getThermaxServices } from "../../services/thermax_gpt.ts";
import TagInput from "../TagInput.tsx";
import SelectTagInput from "../SelectTagInput.tsx";

export type DefaultValue = {
  name: string;
  role: string;
  email: string;
  thrmx_gpt_user_service_mapping?: {
    id: number | null | string;
    title: string;
  }[];
  id: number;
};

interface Props {
  defaultValue?: DefaultValue;
  onSubmit: (data: {
    name: string;
    role: string;
    email: string;
    services_provisioned?: { id: string | number | null; title: string }[];
  }) => void;
}

interface IFormInput {
  name: string;
  role?: RoleKey;
  email: string;
  services_provisioned?: { id: string | number | null; title: string }[];
}

type RoleKey = keyof typeof roleMapping;
// type RoleKeyDoctorConBot = keyof typeof roleMapping_doctor_conbot;

const AddMembersModal: React.FC<Props> = ({ defaultValue, onSubmit }) => {
  const location = useLocation();

  const isOcrPath = location.pathname.endsWith("/tbwes_ocr");
  const isThermaxPath = location.pathname.endsWith("/thermax_gpt/settings");
  const isSalesPath = location.pathname.endsWith("/sales/settings");
  const isCisoBotPath = location.pathname.endsWith("/ciso_bot/settings");
  const isDoctorConBotPath = location.pathname.endsWith(
    "/doctor_conbot/settings"
  );
  const isTroubleshootingPath = location.pathname.endsWith(
    "/troubleshooting/settings"
  );
  const isCyberBuddyPath = location.pathname.endsWith(
    "/cyberbuddy/settings"
  );
  const isSpecialPath =
    isOcrPath || isTroubleshootingPath || isDoctorConBotPath;

  const listValuesToUse =
    isSalesPath || isCyberBuddyPath ? listValues_sales : listValues_normal;

  const roleMappingToUse =
    isSalesPath || isCyberBuddyPath ? roleMapping_sales : roleMapping_normal;

  const addMember = useSelector(
    (state: RootState) => state.modal.addMember.status
  );
  const type = useSelector((state: RootState) => state.modal.addMember.type);
  const dispatch = useDispatch<Dispatch>();

  // All available services from API
  const [allThermaxServices, setAllThermaxServices] = useState<
    { id: number | null | string; title: string }[]
  >([]);

  // User-selected services (defaultValue)
  const [selectedServices, setSelectedServices] = useState<
    { id: number | null | string; title: string }[]
  >(type === 'edit' ? defaultValue?.thrmx_gpt_user_service_mapping : []);

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IFormInput>({
    defaultValues: {
      name: type === "edit" && defaultValue ? defaultValue.name : "",
      email: type === "edit" && defaultValue ? defaultValue.email : "",
      role:
        type === "edit" && defaultValue
          ? (defaultValue.role as RoleKey)
          : "Member", // Make sure role matches IFormInput type
      services_provisioned: type === "edit" && defaultValue ? defaultValue?.thrmx_gpt_user_service_mapping : [],
    },
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize(); // Initial check
    // if (isThermaxPath) {
    //   getAllThermaxServices();
    // }
    window.addEventListener("resize", checkScreenSize);
    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const toastStatus = useSelector((state: RootState) => state.toast);
  const [selectedRole, setSelectedRole] = useState(() => {
    const defaultRole = watch("role"); // Get the default role from useForm
    return (
      listValuesToUse.find((value) => value.name === defaultRole) ||
      listValuesToUse[2]
    ); // Default to 'Member'
  });

  useEffect(() => {
    if (defaultValue && type === "edit") {
      setValue("name", defaultValue.name);
      setValue("email", defaultValue.email);
      setValue(
        "services_provisioned",
        defaultValue.thrmx_gpt_user_service_mapping
      );
      setValue("role", defaultValue.role as RoleKey);
      const defaultRole = listValuesToUse.find(
        (value) => roleMappingToUse[value.name as RoleKey] === defaultValue.role
      );
      if (defaultRole) setSelectedRole(defaultRole);
    }
  }, [defaultValue, setValue, listValuesToUse, roleMappingToUse]);

  useEffect(() => {
    if (selectedRole) {
      setValue("role", selectedRole.name as RoleKey);
    }
  }, [selectedRole, setValue]);

  const closeModal = () => {
    dispatch.modal.closeAddMember();
  };

  const handleOnSubmit = (data: IFormInput) => {
    const role = data.role as RoleKey;

    let servicesToSubmit = selectedServices;

    if (isThermaxPath) {
      // Find ThermaxGPT service from the list if available, otherwise use a default fallback
      const thermaxGPTService = allThermaxServices.find(
        (service) =>
          service.title.replace(/\s/g, "").toLowerCase() === "thermaxgpt"
      );

      if (thermaxGPTService) {
        servicesToSubmit = [thermaxGPTService];
      } else {
        // Fallback: Defaulting to ThermaxGPT with a generic ID if not found in fetched list
        servicesToSubmit = [{ id: 1, title: "ThermaxGPT" }];
      }
    }

    const body = {
      name: data.name,
      email: data.email,
      role: roleMappingToUse[role],
      memberId: defaultValue?.id,
      thrmx_gpt_user_service_mapping: servicesToSubmit,
    };
    onSubmit(body);
  };

  const getAllThermaxServices = async () => {
    try {
      const response = await getThermaxServices();

      if (response?.result?.length > 0) {
        const serviceList = response.result.map((item: any) => ({
          id: item.key,
          title: item.display_name,
        }));
        setAllThermaxServices(serviceList); // Update state
      } else {
        setAllThermaxServices([]); // Optional: clear state if no services
      }
    } catch (error) {
      console.error("Failed to fetch Thermax services:", error);
    }
  };

  const onTagChange = (
    tags: { id: number | null | string; title: string }[]
  ) => {
    clearErrors("services_provisioned");
    setSelectedServices(tags);
    setValue("services_provisioned", tags, { shouldValidate: true });
  };

  return (
    <Transition appear show={addMember} as={Fragment}>
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
              className="w-full sm:w-[90vw] md:w-[70vw] lg:w-[50vw] max-w-xl h-fit transform  rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <DialogTitle
                as="h3"
                className="text-lg sm:text-xl font-medium flex justify-between text-gray-900"
              >
                <Text>
                  {!isThermaxPath
                    ? type === "add"
                      ? "Add Member"
                      : "Edit Member"
                    : "Add Owners"}
                </Text>
                <button
                  className="absolute -right-2 -top-1"
                  onClick={closeModal}
                >
                  <img src={Close} alt="close" loading="lazy" />
                </button>
              </DialogTitle>

              <form onSubmit={handleSubmit(handleOnSubmit)}>
                {toastStatus.status && (
                  <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50">
                    <Toast type="error" />
                  </div>
                )}

                <div className="flex flex-col gap-4 mt-4">
                  <div className="flex flex-col sm:flex-row w-full gap-4">
                    <div className="w-full flex flex-col space-y-2">
                      <label>
                        <Text className="text-primary_text">Name*</Text>
                      </label>
                      <input
                        type="text"
                        className={`w-full h-12 md:h-10 text-base md:text-sm border rounded-md focus:outline-none p-4 ${
                          errors.name ? "border-red-500" : ""
                        }`}
                        autoComplete={isMobile ? "off" : "on"}
                        placeholder={
                          defaultValue && type === "edit"
                            ? defaultValue.name
                            : "Name"
                        }
                        {...register("name", {
                          required: "Field is required",
                          onChange: (e) =>
                            setValue("name", capitalizeWords(e.target.value)),
                        })}
                      />
                      {errors.name && (
                        <p className="text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="w-full flex flex-col space-y-1">
                      <label>
                        <Text className="text-primary_text">Role*</Text>
                      </label>
                      <DropDownButton
                        className="w-full"
                        error={errors.role}
                        listValues={listValuesToUse}
                        onChange={(value: any) => {
                          setSelectedRole(value);
                          setValue("role", value.name as RoleKey);
                          clearErrors("role");
                        }}
                        value={selectedRole}
                      />
                    </div>
                  </div>

                  <div className="w-full flex flex-col space-y-2">
                    <label>
                      <Text className="text-primary_text">Email Id*</Text>
                    </label>
                    <input
                      type="text"
                      className={`w-full h-12 border rounded-md focus:outline-none p-4 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      placeholder={
                        defaultValue && type === "edit"
                          ? defaultValue.email
                          : "Type email here"
                      }
                      disabled={type === "edit"}
                      {...register("email", { required: "Field is required" })}
                    />
                    {errors.email && (
                      <p className="text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  {/* {isThermaxPath && (
                    <div className="w-full flex flex-col space-y-2">
                      <label>
                        <Text className="text-primary_text">
                          Services provisioned*
                        </Text>
                      </label>
                      <SelectTagInput
                        value={selectedServices}
                        options={allThermaxServices}
                        onChange={onTagChange}
                        placeholder="Select the services the member should have access to"
                      />
                      {errors.services_provisioned && (
                        <p className="text-red-500">
                          {errors.services_provisioned.message}
                        </p>
                      )}
                    </div>
                  )} */}
                </div>

                <div className="mt-4 flex justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none"
                    onClick={closeModal}
                  >
                    <Text type="small">Cancel</Text>
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-white focus:outline-none"
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
};

export default AddMembersModal;
