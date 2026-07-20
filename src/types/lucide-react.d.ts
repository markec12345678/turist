declare module "lucide-react" {
  import type { FC, SVGProps } from "react"
  export type LucideProps = SVGProps<SVGSVGElement> & {
    size?: string | number
    absoluteStrokeWidth?: boolean
    color?: string
    strokeWidth?: string | number
  }
  export type LucideIcon = FC<LucideProps>

  export const LayoutDashboard: LucideIcon
  export const CalendarDays: LucideIcon
  export const CalendarRange: LucideIcon
  export const Users: LucideIcon
  export const BedDouble: LucideIcon
  export const UtensilsCrossed: LucideIcon
  export const CreditCard: LucideIcon
  export const Settings: LucideIcon
  export const LogOut: LucideIcon
  export const Building2: LucideIcon
  export const ClipboardList: LucideIcon
  export const Monitor: LucideIcon
  export const Armchair: LucideIcon
  export const BarChart3: LucideIcon
  export const Clock: LucideIcon
  export const FileText: LucideIcon
  export const Plus: LucideIcon
  export const Search: LucideIcon
  export const Minus: LucideIcon
  export const Trash2: LucideIcon
  export const Bell: LucideIcon
  export const CheckCheck: LucideIcon
  export const ExternalLink: LucideIcon
  export const AlertCircle: LucideIcon
  export const CheckCircle: LucideIcon
}
