// UserTable.js
import React, { useState } from "react";
import Text from "./Text";
import DropDownMenu from "./DropdownMenu";
import Edit from "../assets/edit.svg";
import Trash from "../assets/trash.svg";
import Menu from "../assets/more.svg";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../redux/store";
import AddMembersModal from "./Modals/AddMembers";
import { getKeyByValue } from '../utils/functions'
import ConfirmationModal from "./Modals/ConfirmationModal";
import { getInitials, roleMapping } from "../utils/functions";

interface Props {
  data: any[];
  onSubmit?: any;
  onDeleteSubmit?: any;
  type?: string;
  handleScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

const MenuItems = [
  {
    title: "Edit",
    component: <img src={Edit} alt="edit" loading="lazy" />,
  },
  {
    title: "Delete",
    component: <img src={Trash} alt="trash" loading="lazy" />,
  },
];

const UserTable: React.FC<Props> = ({
  data,
  onSubmit,
  onDeleteSubmit,
  type,
  handleScroll = () => {}, // Default to an empty function if not provided
}) => {
  const addMember = useSelector(
    (state: RootState) => state.modal.addMember.status
  );
  
  const dispatch = useDispatch<Dispatch>();
  const [defaultMember, setDefaultMember] = useState();
  const confirmationStatus = useSelector(
    (state: RootState) => state.modal.confirmation
  );
  const member = useSelector((state: RootState) => state.memberRole);
  const memberDetails = member?.details ?? {};

  const onChange = (item: string, user: any) => {
    setDefaultMember(user);
    if (item === "Edit") {
      dispatch.modal.openAddMember("edit");
    } else if (item === "Delete") {
      dispatch.modal.openConfirmation();
    } else {
      console.log("error");
    }
  };

  return (
    <div className="overflow-x-auto  border rounded-lg ">
      {addMember && (
        <AddMembersModal defaultValue={defaultMember} onSubmit={onSubmit} />
      )}
      {confirmationStatus && (
        <ConfirmationModal
          onSubmit={() => onDeleteSubmit(defaultMember)}
          title="Remove Member"
          content="Are you sure you want to remove this member?"
        />
      )}
      {type !== "baan" && (
        <div
          className="max-h-[400px] xl:max-h-[500px] overflow-y-auto"
          onScroll={handleScroll}
        >
          <table className="min-w-full bg-white">
            <thead>
              <tr className="lg:h-16 h-12">
                <th className="px-8 text-start border-b">
                  <Text type="bold-body" className="text-primary_text">
                    Name
                  </Text>
                </th>
                <th className=" text-start border-b">
                  <Text type="bold-body" className="text-primary_text">
                    Email Id
                  </Text>
                </th>
                <th className=" text-start border-b">
                  <Text type="bold-body" className="text-primary_text">
                    {"Role"}
                  </Text>
                </th>
                {type === "thermax_gpt" && <th className=" text-start border-b pl-24">
                  <Text type="bold-body" className="text-primary_text">
                    {"Services"}
                  </Text>
                </th>}
                <th className=" text-start border-b"></th>
              </tr>
            </thead>
            <tbody>
              {data?.map((user, index) => (
                <tr key={index} className="hover:bg-gray-100 border-b h-14">
                  <td >
                    <div className="flex flex-row self-center ml-4">
                      <div className="lg:w-8 lg:h-8 w-4 h-4 p-4 mt-1 lg:mt-0 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-600">
                          {getInitials(user?.name)}
                        </span>
                      </div>
                      <Text
                        className="text-[#172B4D] ml-2 self-center"
                        type="body"
                      >
                        {user.name}
                      </Text>
                    </div>
                  </td>
                  <td className="lg:m-2 lg:max-w-full max-w-[80px] truncate">
                    <Text className="text-primary_text" type="small">
                      {user.email}
                    </Text>{" "}
                  </td>
                  <td className="lg:max-w-full max-w-[200px] ml-8">
                    <Text className="text-primary_text " type="small">
                      {user?.role && getKeyByValue(roleMapping, user?.role)}
                    </Text>
                  </td>
                  {type === "thermax_gpt" && <td className="lg:max-w-full max-w-[90px] pl-24">
                    <div className="flex flex-wrap gap-2">
                      {user?.thrmx_gpt_user_service_mapping?.map((service: any, index: number) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full max-w-[120px] truncate"
                          title={service.title} // Tooltip with full name
                        >
                          {service.title}
                        </span>
                      ))}
                    </div>
                  </td>}
                  {(memberDetails?.role === 'OWNER' ) && (
                    <td className="px-4  text-right">
                      <DropDownMenu
                        onChange={(item: string) => onChange(item, user)}
                        content={
                          <img
                            className="w-8 h-8"
                            src={Menu}
                            alt="menu"
                            loading="lazy"
                          />
                        }
                        menuItems={MenuItems}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {type === "baan" && (
        <table className="min-w-full bg-white ">
          <thead>
            <tr className="h-16">
              <th className=" text-start border-b px-4">
                <Text type="bold-body" className="text-primary_text">
                  BAAN ID
                </Text>
              </th>
              <th className=" text-start border-b px-4">
                <Text type="bold-body" className="text-primary_text">
                  Field
                </Text>
              </th>
              <th className=" text-start border-b px-4">
                <Text type="bold-body" className="text-primary_text">
                  Lower Limit
                </Text>
              </th>
              <th className=" text-start border-b px-4">
                <Text type="bold-body" className="text-primary_text">
                  Upper Limit
                </Text>
              </th>
              <th className=" text-start border-b px-4">
                <Text type="bold-body" className="text-primary_text">
                  Aspect ID
                </Text>
              </th>
              <th className=" text-start border-b px-4">
                <Text type="bold-body" className="text-primary_text">
                  Sequence
                </Text>
              </th>
              <th className=" text-start border-b px-4">
                <Text type="bold-body" className="text-primary_text">
                  Version
                </Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item, index) => (
              <tr key={index} className="hover:bg-gray-100 border-b h-14">
                <td>
                  <Text
                    className="text-primary_text p-4 justify-center"
                    type="small"
                  >
                    {item.baan_id}
                  </Text>
                </td>
                <td>
                  <Text
                    className="text-primary_text p-4 justify-center"
                    type="small"
                  >
                    {item.field}
                  </Text>{" "}
                </td>
                <td>
                  <Text
                    className="text-primary_text p-4 justify-center"
                    type="small"
                  >
                    {item.lower_limit}
                  </Text>
                </td>
                <td>
                  <Text
                    className="text-primary_text p-4 justify-center"
                    type="small"
                  >
                    {item.upper_limit}
                  </Text>
                </td>
                <td>
                  <Text
                    className="text-primary_text p-4 justify-center"
                    type="small"
                  >
                    {item.aspect_id}
                  </Text>
                </td>
                <td>
                  <Text
                    className="text-primary_text p-4 justify-center"
                    type="small"
                  >
                    {item.sequence}
                  </Text>
                </td>
                <td>
                  <Text
                    className="text-primary_text p-4 justify-center"
                    type="small"
                  >
                    {item.version}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserTable;
