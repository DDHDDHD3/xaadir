export type MessageAttachmentType = "DAILY_ATTENDANCE" | "MONTHLY_REPORT" | "ANALYTICS_SNAPSHOT" | "CLASS" | "STUDENT" | "REPORT_REQUEST";
export type MessageAttachment = {
  type: MessageAttachmentType;
  entityId: string;
  label: string;
  contextType?: "MISSING_REGISTER" | "STUDENT_ATTENDANCE" | "CLASS_ATTENDANCE";
  teacherId?: string;
  assignmentId?: string;
  classId?: string;
  subjectId?: string;
  studentId?: string;
  date?: string;
  month?: string;
  metrics?: Record<string, number>;
};
export type XaadirMessage = { id: string; senderUserId: string; senderName: string; recipientUserId: string; recipientName: string; body: string; createdAt: string; readAt?: string; attachment?: MessageAttachment; forwardedFromMessageId?: string };
export type XaadirNotification = { id: string; recipientUserId: string; title: string; body: string; createdAt: string; readAt?: string; messageId?: string };

export type ReportRequest = {
  id: string;
  requesterUserId: string;
  teacherUserId: string;
  teacherId: string;
  assignmentId: string;
  classId: string;
  subjectId: string;
  month: string;
  messageId: string;
  status: "PENDING" | "SUBMITTED";
  createdAt: string;
  submittedAt?: string;
  reportSubmissionId?: string;
  responseMessageId?: string;
};
