import { TeacherSystem } from "@/components/teacher";

export default async function Page({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  return <TeacherSystem section="classes" classId={classId} />;
}
