"use client";
import { useRouter } from "next/navigation";
import { MessagePanel } from "@/components/dashboard/MessagePanel";
export default function MessagesPage() {
  const router = useRouter();
  return <MessagePanel embedded teacher={true} onClose={() => router.push("/teacher")} />;
}
