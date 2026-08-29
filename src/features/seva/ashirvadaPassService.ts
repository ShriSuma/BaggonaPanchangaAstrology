import {
  type AshirvadaPassDoc,
  saveAshirvadaPassToFirestore,
  recordAshirvadaPassDownload,
  resetAshirvadaPassValidity,
  logSystemAuditEvent
} from "../../db/firestoreDb";
import { notifyAshirvadaPassIssued } from "../notifications/notificationService";
import { fetchClientPublicIp } from "../auth/ipSecurityService";

export interface IssueAshirvadaPassInput {
  userId: string;
  priestName: string;
  devoteeName: string;
  sevaName: string;
  totalDays?: number; // default 90 days
  qrCodeUrl?: string;
}

/**
 * Issues a new Ashirvada QR Code Pass and saves it to Cloud Firestore with 90-day validity
 */
export async function issueAshirvadaPass(
  input: IssueAshirvadaPassInput
): Promise<AshirvadaPassDoc> {
  const totalDays = input.totalDays || 90;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + totalDays * 24 * 60 * 60 * 1000);
  const passId = `pass_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const passDoc: AshirvadaPassDoc = {
    id: passId,
    userId: input.userId,
    priestName: input.priestName,
    devoteeName: input.devoteeName,
    sevaName: input.sevaName,
    totalDays,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    daysRemaining: totalDays,
    qrCodeUrl: input.qrCodeUrl,
    downloadCount: 0,
    downloadHistory: [],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  await saveAshirvadaPassToFirestore(passDoc);

  // Dispatch Email Notification to spshreepandit@gmail.com
  void notifyAshirvadaPassIssued({
    passId,
    priestName: input.priestName,
    devoteeName: input.devoteeName,
    sevaName: input.sevaName,
    totalDays,
    expiresAt: expiresAt.toLocaleDateString("en-IN")
  });

  // Log system audit event
  void logSystemAuditEvent({
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    action: "ASHIRVADA_PASS_ISSUED",
    userId: input.userId,
    username: input.priestName,
    role: "priest",
    details: `Issued ${totalDays}-Day Ashirvada QR Pass for ${input.devoteeName} (${input.sevaName})`,
    timestamp: new Date().toISOString()
  });

  return passDoc;
}

/**
 * Logs a download event for an Ashirvada QR Pass
 */
export async function logPassDownload(
  passId: string,
  downloadedBy: string,
  role: string
): Promise<void> {
  const clientIp = await fetchClientPublicIp();
  await recordAshirvadaPassDownload(passId, downloadedBy, role, clientIp);

  // System audit log
  void logSystemAuditEvent({
    id: `audit_dl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    action: "ASHIRVADA_PASS_DOWNLOADED",
    userId: downloadedBy,
    username: downloadedBy,
    role,
    ipAddress: clientIp,
    details: `Downloaded Ashirvada Patra / QR Pass ID ${passId}`,
    timestamp: new Date().toISOString()
  });
}

/**
 * Super Admin: Resets/extends validity of an Ashirvada QR pass
 */
export async function extendPassValidity(
  passId: string,
  days: number = 90,
  adminUsername: string = "superadmin"
): Promise<boolean> {
  const success = await resetAshirvadaPassValidity(passId, days);
  if (success) {
    void logSystemAuditEvent({
      id: `audit_reset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action: "ASHIRVADA_VALIDITY_RESET",
      userId: "superadmin_master",
      username: adminUsername,
      role: "superadmin",
      details: `Reset validity of Ashirvada Pass ${passId} to ${days} Days`,
      timestamp: new Date().toISOString()
    });
  }
  return success;
}
