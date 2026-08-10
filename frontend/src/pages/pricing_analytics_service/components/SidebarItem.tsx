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

        return `flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${
          active
            ? "text-[#e03639] font-semibold"
            : "text-[#a3a3a6] hover:text-white"
        }`;
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
};

export default SidebarItem;