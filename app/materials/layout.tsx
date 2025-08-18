import { AppSidebar } from '@/components/layout/app-sidebar'

export default function MaterialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppSidebar>
      {children}
    </AppSidebar>
  )
}