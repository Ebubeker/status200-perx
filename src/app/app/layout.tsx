import { MobileShell } from "@/components/MobileShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
