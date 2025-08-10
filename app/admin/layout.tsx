import { currentUser } from "@clerk/nextjs/server"
import { isAdminUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  const canView = isAdminUser(user)
  if (!canView) {
    redirect("/")
  }
  return <>{children}</>
}


