import { apiClient } from "@/config/apiClient";
import type { Brand, CreateBrandPayload } from "@/types/brand";
import type {
  CreateIntakePayload,
  IntakeRequest,
  IntakeSummary,
  UpdateIntakePayload,
} from "@/types/intake";

export async function fetchIntakeSummary() {
  const { data } = await apiClient.get<IntakeSummary>("/intake/summary");
  return data;
}

export async function fetchIntakeRequests(params?: {
  status?: string;
  search?: string;
}) {
  const { data } = await apiClient.get<{ items: IntakeRequest[] }>("/intake", {
    params,
  });
  return data.items;
}

export async function fetchIntakeRequest(id: string) {
  const { data } = await apiClient.get<IntakeRequest>(`/intake/${id}`);
  return data;
}

export async function createIntakeRequest(payload: CreateIntakePayload) {
  const { data } = await apiClient.post<IntakeRequest>("/intake", payload);
  return data;
}

export async function updateIntakeRequest(
  id: string,
  payload: UpdateIntakePayload,
) {
  const { data } = await apiClient.patch<IntakeRequest>(
    `/intake/${id}`,
    payload,
  );
  return data;
}

export async function generateIntakeEmail(id: string) {
  const { data } = await apiClient.post<IntakeRequest>(
    `/intake/${id}/generate-email`,
  );
  return data;
}

export async function markIntakeSent(id: string) {
  const { data } = await apiClient.post<IntakeRequest>(
    `/intake/${id}/mark-sent`,
  );
  return data;
}

export async function markIntakeResponded(id: string) {
  const { data } = await apiClient.post<IntakeRequest>(
    `/intake/${id}/mark-responded`,
  );
  return data;
}

export async function deleteIntakeRequest(id: string) {
  const { data } = await apiClient.delete<{ id: string }>(`/intake/${id}`);
  return data;
}

export async function convertIntakeToBrand(
  id: string,
  payload: CreateBrandPayload,
) {
  const { data } = await apiClient.post<{ intake: IntakeRequest; brand: Brand }>(
    `/intake/${id}/convert-to-brand`,
    payload,
  );
  return data;
}
