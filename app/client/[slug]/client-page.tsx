"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ClientWizard } from "@/components/wizard/client-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePlanningStore } from "@/lib/store";
import { ClientResponseFormValues } from "@/lib/validators";

export default function ClientSlugPage() {
  const params = useParams<{ slug: string }>();
  const { hydrated, getSessionBySlug, getClientById, updateSessionResponse, submitSession } =
    usePlanningStore();

  const session = useMemo(() => getSessionBySlug(params.slug), [getSessionBySlug, params.slug]);
  const client = session ? getClientById(session.clientId) : undefined;

  if (!hydrated) {
    return <p className="p-4 text-sm text-muted-foreground">Loading planning...</p>;
  }

  if (!session || !client) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-4">
        <Card className="w-full">
          <CardContent className="space-y-3 p-5 text-center">
            <h1 className="text-lg font-semibold">Planning URL not found</h1>
            <p className="text-sm text-muted-foreground">
              This client link is not available in the current local mock state.
            </p>
            <Button asChild>
              <Link href="/admin">Go to admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const saveDraft = (values: ClientResponseFormValues) => {
    return updateSessionResponse(session.id, values, "in_review");
  };

  const submitFinal = (values: ClientResponseFormValues) => {
    return submitSession(session.id, values);
  };

  return <ClientWizard client={client} session={session} onSaveDraft={saveDraft} onSubmitFinal={submitFinal} />;
}
