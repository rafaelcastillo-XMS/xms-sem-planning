import type { CampaignType } from "@/types/planning";

interface SubmissionNotificationInput {
  sessionId: string;
  clientName: string;
  clientSlug: string;
  campaignType: CampaignType;
  submittedAt: string;
  adminUrl: string;
}

export function buildSubmissionNotification(input: SubmissionNotificationInput) {
  const campaign = input.campaignType === "lsa"
    ? "Local Services Ads"
    : input.campaignType === "google_ads"
      ? "Google Ads"
      : "Local Services Ads + Google Ads";

  return {
    event: "sem_planning.submitted",
    notificationId: `${input.sessionId}:${input.submittedAt}`,
    sessionId: input.sessionId,
    client: {
      name: input.clientName,
      slug: input.clientSlug
    },
    campaign,
    submittedAt: input.submittedAt,
    adminUrl: input.adminUrl
  };
}

export async function sendSubmissionNotification(
  payload: ReturnType<typeof buildSubmissionNotification>,
  webhookUrl = process.env.N8N_SUBMISSION_WEBHOOK_URL,
  request: typeof fetch = fetch
) {
  if (!webhookUrl) return { sent: false as const, reason: "not_configured" as const };

  const response = await request(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.N8N_SUBMISSION_WEBHOOK_SECRET
        ? { "X-Webhook-Secret": process.env.N8N_SUBMISSION_WEBHOOK_SECRET }
        : {})
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000)
  });

  if (!response.ok) {
    throw new Error(`n8n webhook returned HTTP ${response.status}`);
  }

  return { sent: true as const };
}
