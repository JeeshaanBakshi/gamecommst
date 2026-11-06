import type { Metadata } from "next";
import { HostLogin } from "@/components/host/HostLogin";

export const metadata: Metadata = { title: "Presenter login · The Waterloo Effect" };

export default function HostLoginPage() {
  return <HostLogin />;
}
