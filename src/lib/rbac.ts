export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["*"],
  MANAGER: [
    "reservations:read", "reservations:write",
    "guests:read", "guests:write",
    "rooms:read", "rooms:write",
    "restaurant:read", "restaurant:write",
    "payments:read", "payments:write",
    "reports:read",
    "settings:read",
    "shifts:read", "shifts:write",
  ],
  RECEPTIONIST: [
    "reservations:read", "reservations:write",
    "guests:read", "guests:write",
    "rooms:read", "rooms:write",
    "payments:read", "payments:write",
  ],
  CASHIER: [
    "payments:read", "payments:write",
    "restaurant:read",
    "shifts:read", "shifts:write",
  ],
  CHEF: [
    "restaurant:read",
    "orders:read", "orders:write",
  ],
  WAITER: [
    "restaurant:read", "restaurant:write",
    "orders:read", "orders:write",
    "tables:read",
  ],
  CLEANER: [
    "rooms:read",
    "housekeeping:read", "housekeeping:write",
  ],
  STAFF: [
    "rooms:read",
  ],
} as const

export type Permission = string

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
  if (!permissions) return false
  if (permissions.includes("*" as never)) return true
  return (permissions as readonly string[]).includes(permission)
}
