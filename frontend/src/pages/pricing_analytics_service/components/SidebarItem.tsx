import { NavLink } from "react-router-dom";

type SidebarItemProps = {
  label: string;
  path: string;
  icon: React.ElementType;
  isActive?: boolean;
};

const SidebarItem = ({
  label,
  path,
  icon: Icon,
  isActive,
}: SidebarItemProps) => {
  return (
    <NavLink
      to={path}
      end={!isActive}
      className={({ isActive: navActive }) => {
        const active = isActive ?? navActive;

        return `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
          active
            ? "bg-[#ed3437] text-white font-medium"
            : "text-white hover:bg-[#525253]"
        }`;
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
};

export default SidebarItem;