import { NextResponse } from "next/server";

import { buildSubmissionNotification, sendSubmissionNotification } from "@/lib/submission-notification";
import { CLIENTS_TABLE, SESSIONS_TABLE, supabase } from "@/lib/supabase";
import type { CampaignType } from "@/types/planning";

interface SubmittedSessionRow {
  id: string;
  client_id: string;
  status: string;
  submitted_at: string | null;
  proposal: { campaignType?: CampaignType };
}

interface NotificationClientRow {
  name: string;
  slug: string;
}

export async function POST(request: Request) {
  let sessionId: string;

  try {
    const body = await request.json() as { sessionId?: unknown };
    if (typeof body.sessionId !== "string" || !body.sessionId || body.sessionId.length > 100) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }
    sessionId = body.sessionId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from(SESSIONS_TABLE)
    .select("id, client_id, status, submitted_at, proposal")
    .eq("id", sessionId)
    .single();
  const session = sessionData as SubmittedSessionRow | null;

  if (sessionError || !session) {
    return NextResponse.json({ error: "Submitted planning not found" }, { status: 404 });
  }
  if (session.status !== "submitted" || !session.submitted_at) {
    return NextResponse.json({ error: "Planning has not been submitted" }, { status: 409 });
  }

  const { data: clientData, error: clientError } = await supabase
    .from(CLIENTS_TABLE)
    .select("name, slug")
    .eq("id", session.client_id)
    .single();
  const client = clientData as NotificationClientRow | null;

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const payload = buildSubmissionNotification({
    sessionId: session.id,
    clientName: client.name,
    clientSlug: client.slug,
    campaignType: session.proposal.campaignType ?? "lsa",
    submittedAt: session.submitted_at,
    adminUrl: new URL(`/admin/planning/${session.id}`, request.url).toString()
  });

  try {
    const result = await sendSubmissionNotification(payload);
    if (!result.sent) {
      return NextResponse.json({ error: "Notification webhook is not configured" }, { status: 503 });
    }
    return NextResponse.json({ notified: true });
  } catch (error) {
    console.error("[submission-notification] n8n request failed", error);
    return NextResponse.json({ error: "Notification could not be delivered" }, { status: 502 });
  }
}
