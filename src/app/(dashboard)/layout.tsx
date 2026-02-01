import { DashboardLayout, UserMenuServer } from "@/components/layouts";

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
    return <DashboardLayout userMenu={<UserMenuServer/>}>{children}</DashboardLayout>;
}