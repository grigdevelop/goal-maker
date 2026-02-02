import { DashboardLayout, UserMenuServer } from "@/components/layouts";
import { Providers } from "@/components/shared/Providers";

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <DashboardLayout userMenu={<UserMenuServer />}>{children}</DashboardLayout>
        </Providers>
    );
}