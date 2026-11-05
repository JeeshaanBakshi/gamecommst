import type { Metadata } from "next";
import { HostEntry } from "@/components/ClientOnly";

export const metadata: Metadata = { title: "Host · The Waterloo Effect" };

export default function HostPage() {
  return <HostEntry />;
}
