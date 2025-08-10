import type { User } from "@clerk/nextjs/server"

export function isAdminUser(user: User | null): boolean {
  if (!user) return false

  // 1) Clerk publicMetadata role flag
  const role = (user.publicMetadata as Record<string, unknown>)?.role
  if (role === "admin") return true

  // 2) Admin allowlist by email (comma-separated)
  const allowlist = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()).filter(Boolean)
  const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase()
  if (allowlist && allowlist.length > 0 && email) {
    return allowlist.includes(email)
  }

  // 3) Fallback: if no allowlist configured, allow access for signed-in users
  return !allowlist || allowlist.length === 0
}


