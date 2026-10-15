declare module "lucide-react" {
  import React from "react";

  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
    className?: string;
  }

  export type LucideIcon = React.FC<IconProps>;

  export const LayoutDashboard: LucideIcon;
  export const Users: LucideIcon;
  export const Building2: LucideIcon;
  export const Database: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Settings: LucideIcon;
  export const X: LucideIcon;
  export const XIcon: LucideIcon;
  export const Bell: LucideIcon;
  export const BellRing: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const Loader2: LucideIcon;
  export const Moon: LucideIcon;
  export const Sun: LucideIcon;
  export const Menu: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronRightIcon: LucideIcon;
  export const ChevronLeftIcon: LucideIcon;
  export const ChevronDownIcon: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUpIcon: LucideIcon;
  export const CheckIcon: LucideIcon;
  export const CircleIcon: LucideIcon;
  export const MoreHorizontalIcon: LucideIcon;
  export const PanelLeftIcon: LucideIcon;
  export const Download: LucideIcon;
  export const Search: LucideIcon;
  export const Eye: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const Handshake: LucideIcon;
  export const Clock: LucideIcon;
  export const Filter: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const Phone: LucideIcon;
  export const Mail: LucideIcon;
  export const Calendar: LucideIcon;
  export const Home: LucideIcon;
  export const Wrench: LucideIcon;
  export const Map: LucideIcon;
  export const Layers: LucideIcon;
  export const MapPin: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const UserCheck: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const Camera: LucideIcon;
  export const Trash2: LucideIcon;
  export const User: LucideIcon;
  export const Shield: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Plus: LucideIcon;
  export const Pencil: LucideIcon;
  export const ImagePlus: LucideIcon;

  const icons: Record<string, LucideIcon>;
  export default icons;
}
