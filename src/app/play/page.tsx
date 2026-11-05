import type { Metadata } from "next";
import { PlayEntry } from "@/components/ClientOnly";

export const metadata: Metadata = { title: "Play · The Waterloo Effect" };

export default function PlayPage() {
  return <PlayEntry />;
}
