"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { createEmptyClientResponse } from "@/lib/defaults";
import { seededClients } from "@/mock-data/clients";
import { seededSessions } from "@/mock-data/planning";
import { CLIENTS_TABLE, SESSIONS_TABLE, supabase } from "@/lib/supabase";
import {
  Client,
  ClientResponse,
  NewPlanningInput,
  PlanningProposal,
  PlanningSeedState,
  PlanningSession,
  PlanningStatus
} from "@/types/planning";
import { slugify, uid } from "@/lib/utils";

const LOGO_INSTRUCTIONS =
  "Upload your current logo in high quality for branding consistency.";
const PHOTO_INSTRUCTIONS =
  "Please send us images that reflect your services, ongoing work, and business.";
const OLD_PHOTO_INSTRUCTIONS =
  "Share images that show your services, projects in progress, team, and finished work.";

const clone = <T,>(value: T): T => {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value)) as T;
  }
};

interface PlanningStoreContextValue {
  clients: Client[];
  sessions: PlanningSession[];
  hydrated: boolean;
  getClientById: (id: string) => Client | undefined;
  getSessionById: (id: string) => PlanningSession | undefined;
  getSessionBySlug: (slug: string) => PlanningSession | undefined;
  isSlugAvailable: (slug: string, excludeClientId?: string) => boolean;
  updateClient: (clientId: string, patch: Partial<Client>) => Promise<void>;
  createPlanning: (input: NewPlanningInput) => Promise<PlanningSession>;
  updateSessionProposal: (sessionId: string, proposal: PlanningProposal) => Promise<void>;
  updateSessionResponse: (
    sessionId: string,
    response: ClientResponse,
    status?: PlanningStatus
  ) => Promise<void>;
  submitSession: (sessionId: string, response: ClientResponse) => Promise<void>;
  deletePlanning: (sessionId: string) => void;
  resetSeedData: () => void;
}

const initialSeed: PlanningSeedState = {
  clients: seededClients,
  sessions: seededSessions
};

const normalizeSeedState = (state: PlanningSeedState): PlanningSeedState => ({
  clients: state.clients,
  sessions: state.sessions.map((session) => ({
    ...session,
    proposal: {
      ...session.proposal,
      missingInfoChecklist: [],
      assetRequirements: session.proposal.assetRequirements.map((requirement) => {
        if (requirement.id === "logo" && !requirement.instructions) {
          return { ...requirement, instructions: LOGO_INSTRUCTIONS };
        }

        if (
          requirement.id === "business-photos" &&
          (!requirement.instructions || requirement.instructions === OLD_PHOTO_INSTRUCTIONS)
        ) {
          return { ...requirement, instructions: PHOTO_INSTRUCTIONS };
        }

        return requirement;
      })
    },
    response: {
      ...session.response,
      missingInfoResponses: {
        totalFieldworkers: "",
        ...(session.response.missingInfoResponses ?? {})
      },
      acknowledgedMissingItems: session.response.acknowledgedMissingItems ?? [],
      finalComment: session.response.finalComment ?? ""
    }
  }))
});

const normalizedInitialSeed = normalizeSeedState(initialSeed);

// --- Supabase row <-> domain mappers -------------------------------------

interface ClientRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  contact_phone: string | null;
}

interface SessionRow {
  id: string;
  client_id: string;
  status: PlanningStatus;
  proposal: PlanningProposal;
  response: ClientResponse;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
}

const clientToRow = (client: Client): ClientRow => ({
  id: client.id,
  name: client.name,
  slug: client.slug,
  logo_url: client.logoUrl ?? null,
  contact_phone: client.contactPhone ?? null
});

const rowToClient = (row: ClientRow): Client => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  logoUrl: row.logo_url ?? undefined,
  contactPhone: row.contact_phone ?? undefined
});

const sessionToRow = (session: PlanningSession): SessionRow => ({
  id: session.id,
  client_id: session.clientId,
  status: session.status,
  proposal: session.proposal,
  response: session.response,
  created_at: session.createdAt,
  updated_at: session.updatedAt,
  submitted_at: session.submittedAt ?? null
});

const rowToSession = (row: SessionRow): PlanningSession => ({
  id: row.id,
  clientId: row.client_id,
  status: row.status,
  proposal: row.proposal,
  response: row.response,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  submittedAt: row.submitted_at ?? undefined
});

// Fire-and-forget persistence: UI updates optimistically, errors are logged.
const persist = (
  label: string,
  run: () => PromiseLike<{ error: unknown }>
) => {
  Promise.resolve(run())
    .then(({ error }) => {
      if (error) console.error(`[store] ${label} failed`, error);
    })
    .catch((error) => console.error(`[store] ${label} threw`, error));
};

const PlanningStoreContext = createContext<PlanningStoreContextValue | undefined>(
  undefined
);

export function PlanningStoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(clone(normalizedInitialSeed.clients));
  const [sessions, setSessions] = useState<PlanningSession[]>(
    clone(normalizedInitialSeed.sessions)
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [clientsRes, sessionsRes] = await Promise.all([
          supabase.from(CLIENTS_TABLE).select("*"),
          supabase.from(SESSIONS_TABLE).select("*")
        ]);

        if (clientsRes.error) throw clientsRes.error;
        if (sessionsRes.error) throw sessionsRes.error;

        const clientRows = (clientsRes.data ?? []) as ClientRow[];
        const sessionRows = (sessionsRes.data ?? []) as SessionRow[];

        if (clientRows.length === 0 && sessionRows.length === 0) {
          // Empty DB: seed it once with the template data.
          const seed = clone(normalizedInitialSeed);
          await supabase.from(CLIENTS_TABLE).insert(seed.clients.map(clientToRow));
          await supabase.from(SESSIONS_TABLE).insert(seed.sessions.map(sessionToRow));
          if (!active) return;
          setClients(seed.clients);
          setSessions(seed.sessions);
        } else {
          const loaded = normalizeSeedState({
            clients: clientRows.map(rowToClient),
            sessions: sessionRows.map(rowToSession)
          });
          if (!active) return;
          setClients(loaded.clients);
          setSessions(loaded.sessions);
        }
      } catch (error) {
        console.error("[store] load failed, using seed data", error);
      } finally {
        if (active) setHydrated(true);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const getClientById = useCallback(
    (id: string) => clients.find((client) => client.id === id),
    [clients]
  );

  const getSessionById = useCallback(
    (id: string) => sessions.find((session) => session.id === id),
    [sessions]
  );

  const getSessionBySlug = useCallback(
    (slug: string) => {
      const client = clients.find((entry) => entry.slug === slug);
      if (!client) return undefined;
      return sessions.find((session) => session.clientId === client.id);
    },
    [clients, sessions]
  );

  const isSlugAvailable = useCallback(
    (slug: string, excludeClientId?: string) => {
      return !clients.some(
        (client) => client.slug === slug && client.id !== excludeClientId
      );
    },
    [clients]
  );

  const updateClient = useCallback(async (clientId: string, patch: Partial<Client>) => {
    const client = clients.find((entry) => entry.id === clientId);
    if (!client) throw new Error("Client not found");
    const next = { ...client, ...patch };
    const { error, data } = await supabase.from(CLIENTS_TABLE).update(clientToRow(next)).eq("id", clientId).select("id").single();
    if (error || !data) throw error ?? new Error("Client not saved");
    setClients((prev) => prev.map((entry) => entry.id === clientId ? next : entry));
  }, [clients]);

  const createPlanning = useCallback(
    async (input: NewPlanningInput) => {
      const baseSlug = slugify(input.slug || input.clientName);
      let uniqueSlug = baseSlug;
      let counter = 1;

      // Ensure slug is unique
      while (clients.some((c) => c.slug === uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const client: Client = {
        id: uid("client"),
        name: input.clientName,
        slug: uniqueSlug,
        logoUrl: input.logoUrl || undefined
      };

      const templateProposal = input.proposal ?? clone(initialSeed.sessions[0].proposal);
      const session: PlanningSession = {
        id: uid("plan"),
        clientId: client.id,
        status: "in_review",
        proposal: templateProposal,
        response: createEmptyClientResponse(templateProposal),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const clientRes = await supabase.from(CLIENTS_TABLE).insert(clientToRow(client));
      if (clientRes.error) throw clientRes.error;
      const sessionRes = await supabase.from(SESSIONS_TABLE).insert(sessionToRow(session));
      if (sessionRes.error) {
        await supabase.from(CLIENTS_TABLE).delete().eq("id", client.id);
        throw sessionRes.error;
      }
      setClients((prev) => [client, ...prev]);
      setSessions((prev) => [session, ...prev]);

      return session;
    },
    [clients]
  );

  const updateSessionProposal = useCallback(
    async (sessionId: string, proposal: PlanningProposal) => {
      const updatedAt = new Date().toISOString();
      const patch = { proposal, updated_at: updatedAt };
      const { error, data } = await supabase.from(SESSIONS_TABLE).update(patch).eq("id", sessionId).select("id").single();
      if (error || !data) throw error ?? new Error("Planning not saved");
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId ? { ...session, proposal, updatedAt } : session
        )
      );
    },
    []
  );

  const updateSessionResponse = useCallback(
    async (sessionId: string, response: ClientResponse, status?: PlanningStatus) => {
      const updatedAt = new Date().toISOString();
      const patch = { response, updated_at: updatedAt, ...(status ? { status } : {}) };
      const { error, data } = await supabase.from(SESSIONS_TABLE).update(patch).eq("id", sessionId).select("id").single();
      if (error || !data) throw error ?? new Error("Planning not saved");
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                response,
                status: status ?? session.status,
                updatedAt
              }
            : session
        )
      );
    },
    []
  );

  const submitSession = useCallback(async (sessionId: string, response: ClientResponse) => {
    const now = new Date().toISOString();
    const patch = { response, status: "submitted", submitted_at: now, updated_at: now };
    const { error, data } = await supabase.from(SESSIONS_TABLE).update(patch).eq("id", sessionId).select("id").single();
    if (error || !data) throw error ?? new Error("Planning not saved");
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              response,
              status: "submitted",
              submittedAt: now,
              updatedAt: now
            }
          : session
      )
    );
  }, []);

  const deletePlanning = useCallback(
    (sessionId: string) => {
      const session = sessions.find((entry) => entry.id === sessionId);
      const clientId = session?.clientId;

      setSessions((prev) => prev.filter((entry) => entry.id !== sessionId));
      if (clientId) {
        setClients((prev) => prev.filter((entry) => entry.id !== clientId));
      }

      // Deleting the client cascades the session row (FK on delete cascade).
      persist("deletePlanning", async () => {
        if (clientId) {
          return supabase.from(CLIENTS_TABLE).delete().eq("id", clientId);
        }
        return supabase.from(SESSIONS_TABLE).delete().eq("id", sessionId);
      });
    },
    [sessions]
  );

  const resetSeedData = useCallback(() => {
    const seed = clone(normalizedInitialSeed);
    setClients(seed.clients);
    setSessions(seed.sessions);

    persist("resetSeedData", async () => {
      // Wipe everything (cascade removes sessions), then re-insert seed.
      const del = await supabase
        .from(CLIENTS_TABLE)
        .delete()
        .neq("id", "");
      if (del.error) return del;
      const clientsRes = await supabase
        .from(CLIENTS_TABLE)
        .insert(seed.clients.map(clientToRow));
      if (clientsRes.error) return clientsRes;
      return supabase.from(SESSIONS_TABLE).insert(seed.sessions.map(sessionToRow));
    });
  }, []);

  const value = useMemo(
    () => ({
      clients,
      sessions,
      hydrated,
      getClientById,
      getSessionById,
      getSessionBySlug,
      updateClient,
      createPlanning,
      updateSessionProposal,
      updateSessionResponse,
      submitSession,
      deletePlanning,
      resetSeedData,
      isSlugAvailable
    }),
    [
      clients,
      sessions,
      hydrated,
      getClientById,
      getSessionById,
      getSessionBySlug,
      updateClient,
      createPlanning,
      updateSessionProposal,
      updateSessionResponse,
      submitSession,
      deletePlanning,
      resetSeedData,
      isSlugAvailable
    ]
  );

  return (
    <PlanningStoreContext.Provider value={value}>
      {children}
    </PlanningStoreContext.Provider>
  );
}

export function usePlanningStore() {
  const context = useContext(PlanningStoreContext);
  if (!context) {
    throw new Error("usePlanningStore must be used within PlanningStoreProvider");
  }
  return context;
}
