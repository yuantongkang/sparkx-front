import type { Project } from "@/lib/projects";

type ProjectsListResponse = {
  list: Project[];
  page: {
    page: number;
    pageSize: number;
    total: number;
  };
};

const parseResponseError = async (response: Response): Promise<string> => {
  const text = await response.text();
  if (!text) return `Request failed with status ${response.status}`;
  try {
    const parsed = JSON.parse(text) as { message?: unknown; msg?: unknown };
    if (typeof parsed.message === "string" && parsed.message.trim()) {
      return parsed.message;
    }
    if (typeof parsed.msg === "string" && parsed.msg.trim()) {
      return parsed.msg;
    }
  } catch {
    // fallback to plain text
  }
  return text;
};

const requestJson = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseResponseError(response));
  }

  return (await response.json()) as T;
};

export const listProjects = async (
  page = 1,
  pageSize = 60,
): Promise<Project[]> => {
  const data = await requestJson<ProjectsListResponse>(
    `/api/projects?page=${page}&pageSize=${pageSize}`,
  );
  return data.list;
};

export const getProjectById = async (projectId: string): Promise<Project> =>
  requestJson<Project>(`/api/projects/${projectId}`);

export const createProject = async (input?: {
  name?: string;
  description?: string;
}): Promise<Project> =>
  requestJson<Project>("/api/projects", {
    method: "POST",
    body: JSON.stringify({
      name: input?.name,
      description: input?.description,
    }),
  });

export const deleteProjectById = async (projectId: string): Promise<void> => {
  await requestJson<{ code?: number; msg?: string }>(`/api/projects/${projectId}`, {
    method: "DELETE",
  });
};

export const updateProjectById = async (
  projectId: string,
  updates: {
    name: string;
    description: string;
    status?: "active" | "archived";
  },
): Promise<void> => {
  await requestJson<{ code?: number; msg?: string }>(`/api/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
};
