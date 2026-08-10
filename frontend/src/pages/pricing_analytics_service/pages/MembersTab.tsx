import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { useState } from "react";
import SearchIcon from "../../../assets/search_icon.svg";
import AddIcon from "../../../assets/plus_icon.svg";
import EditMemberIcon from "../../../assets/edit.svg";
import DeleteMemberIcon from "../../../assets/delete.svg";
import AddMemberModal from "../components/AddNewMemberModal";
import EditMemberModal from "../components/EditMemberModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { useGetMembersList, useDeleteMember, useGetMemberPricingAnalyticsRole } from "../services/query/query";
import { useInfiniteScroll } from "../../../services/hooks/useInfiniteScroll";
import MoreIcon from "../../../assets/more.svg";
import Toast from "../../../components/Toast";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";

const MembersSection = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { mutate: deleteMember, isPending: isDeleting } = useDeleteMember();
  const dispatch = useDispatch<Dispatch>();
  const toastStatus = useSelector((state: RootState) => state.toast);

  const payload = {
    limit: 10,
    search_term: search,
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetMembersList(payload);

  const { data: currentUserRoleData } = useGetMemberPricingAnalyticsRole();
  const isOwner = currentUserRoleData?.role?.toUpperCase() === 'OWNER';

  const loadMoreRef = useInfiniteScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  const members = data?.pages.flatMap((page) => page.result) ?? [];

  const handleEdit = (member: {
    id: string;
    name: string;
    email: string;
    role: string;
  }) => {
    setSelectedMember(member);
    setEditOpen(true);
  };

  const handleDelete = (member: {
    id: string;
    name: string;
  }) => {
    setMemberToDelete(member);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete.id, {
        onSuccess: () => {
          setDeleteOpen(false);
          setMemberToDelete(null);
        },
        onError: (err: any) => {
          const message = err?.response?.data?.detail || err?.message || "Failed to delete member. Please try again.";
          dispatch.toast.openToast({ status: true, message, type: "error" });
          setDeleteOpen(false);
          setMemberToDelete(null);
        },
      });
    }
  };

  return (
    <div className="px-6 py-4 gap-4 flex flex-col bg-[#F8FAFC] w-full h-full">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h6 className="text-[#0D1431] font-bold text-2xl mb-1">Members</h6>
          <p className="text-gray-500 text-sm">Manage team members and their roles</p>
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2.5 w-72 transition-all duration-200 focus-within:border-[#e03639] focus-within:ring-2 focus-within:ring-[#e03639]/10">
            <img src={SearchIcon} alt="search" className="w-4 h-4 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search members..."
              className="outline-none w-full text-sm text-gray-700 placeholder-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isOwner && (
            <Button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#e03639] text-white rounded-lg hover:bg-[#c92e32] active:bg-[#b0282c] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <img src={AddIcon} alt="add" className="w-4 h-4" />
              <p className="text-sm font-medium">Add Member</p>
            </Button>
          )}
        </div>
      </div>

      <div className="relative overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-xs uppercase tracking-wider">Role</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody>
            {members ? (
              members?.map((member, index) => (
                <tr 
                  key={member.id} 
                  className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-all duration-200 group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e03639] to-[#c92e32] flex items-center justify-center text-white font-semibold text-sm">
                        {member?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{member?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{member?.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      member?.role === 'OWNER' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {member?.role}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right">
                    {isOwner && (
                      <Menu
                        as="div"
                        className="relative inline-block text-left"
                      >
                        <MenuButton className="rounded-lg p-2 hover:bg-gray-100 transition-colors duration-150">
                          <img src={MoreIcon} alt="more" className="w-4 h-4 text-gray-500 hover:text-[#e03639] transition-colors duration-150" />
                        </MenuButton>

                        <MenuItems
                          anchor="bottom end"
                          className="z-50 mt-2 w-44 rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-gray-200 focus:outline-none border border-gray-100"
                        >
                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 ${
                                  focus ? "bg-[#e03639] text-white" : "text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => handleEdit(member)}
                              >
                                <img src={EditMemberIcon} alt="edit" className={`h-5 w-5 ${focus ? 'text-white' : 'text-gray-500'}`} />
                                <span className="text-sm font-medium">
                                  Edit
                                </span>
                              </button>
                            )}
                          </MenuItem>

                          <MenuItem>
                            {({ focus }) => (
                              <button
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 ${
                                  focus ? "bg-red-600 text-white" : "text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => handleDelete({ id: member.id, name: member.name })}
                              >
                                <img src={DeleteMemberIcon} alt="delete" className={`h-5 w-5 ${focus ? 'text-white' : 'text-gray-500'}`} />
                                <span className="text-sm font-medium">
                                  Delete
                                </span>
                              </button>
                            )}
                          </MenuItem>
                        </MenuItems>
                      </Menu>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <img src={SearchIcon} alt="no results" className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No members found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or add a new member</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddMemberModal open={open} onClose={() => setOpen(false)} />
      <EditMemberModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
      />
      <DeleteConfirmationModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={confirmDelete}
        memberName={memberToDelete?.name}
        loading={isDeleting}
      />

      {toastStatus?.status && toastStatus?.type === "error" && (
        <Toast type="error" />
      )}
      {toastStatus?.status && toastStatus?.type === "success" && (
        <Toast type="success" />
      )}
    </div>
  );
};

export default MembersSection;