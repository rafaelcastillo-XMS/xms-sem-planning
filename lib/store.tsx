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

const STORAGE_KEY = "sem_planning_mvp_state_v1";
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
  updateClient: (clientId: string, patch: Partial<Client>) => void;
  createPlanning: (input: NewPlanningInput) => PlanningSession;
  updateSessionProposal: (sessionId: string, proposal: PlanningProposal) => void;
  updateSessionResponse: (
    sessionId: string,
    response: ClientResponse,
    status?: PlanningStatus
  ) => void;
  submitSession: (sessionId: string, response: ClientResponse) => void;
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
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlanningSeedState;
        if (parsed?.clients && parsed?.sessions) {
          const normalized = normalizeSeedState(parsed);
          setClients(normalized.clients);
          setSessions(normalized.sessions);
        }
      }
    } catch {
      // Keep seed data if parsing fails.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: PlanningSeedState = { clients, sessions };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [clients, sessions, hydrated]);

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

  const updateClient = useCallback((clientId: string, patch: Partial<Client>) => {
    setClients((prev) =>
      prev.map((client) => (client.id === clientId ? { ...client, ...patch } : client))
    );
  }, []);

  const createPlanning = useCallback(
    (input: NewPlanningInput) => {
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

      const templateProposal = clone(initialSeed.sessions[0].proposal);
      const session: PlanningSession = {
        id: uid("plan"),
        clientId: client.id,
        status: "draft",
        proposal: templateProposal,
        response: createEmptyClientResponse(templateProposal),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setClients((prev) => [client, ...prev]);
      setSessions((prev) => [session, ...prev]);

      return session;
    },
    [clients]
  );


  const updateSessionProposal = useCallback(
    (sessionId: string, proposal: PlanningProposal) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                proposal,
                updatedAt: new Date().toISOString()
              }
            : session
        )
      );
    },
    []
  );

  const updateSessionResponse = useCallback(
    (sessionId: string, response: ClientResponse, status?: PlanningStatus) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                response,
                status: status ?? session.status,
                updatedAt: new Date().toISOString()
              }
            : session
        )
      );
    },
    []
  );

  const submitSession = useCallback((sessionId: string, response: ClientResponse) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              response,
              status: "submitted",
              submittedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : session
      )
    );
  }, []);

  const resetSeedData = useCallback(() => {
    const clientsSeed = clone(initialSeed.clients);
    const sessionsSeed = clone(initialSeed.sessions);
    setClients(clientsSeed);
    setSessions(sessionsSeed);
    localStorage.removeItem(STORAGE_KEY);
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
