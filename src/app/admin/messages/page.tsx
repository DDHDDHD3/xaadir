"use client";
import { useRouter } from "next/navigation";
import { MessagePanel } from "@/components/dashboard/MessagePanel";
export default function MessagesPage() {
  const router = useRouter();
  return <MessagePanel embedded teacher={false} onClose={() => router.push("/admin")} />;
}
