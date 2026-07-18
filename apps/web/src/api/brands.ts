import { apiClient } from "@/config/apiClient";
import type {
  Brand,
  BrandsListResponse,
  CreateBrandPayload,
  UpdateBrandPayload,
} from "@/types/brand";

export async function fetchHealth() {
  const { data } = await apiClient.get<{ status: string; version: string }>(
    "/health",
  );
  return data;
}

export async function fetchBrands(params?: {
  search?: string;
  archived?: boolean;
}) {
  const { data } = await apiClient.get<BrandsListResponse>("/brands", {
    params,
  });
  return data;
}

export async function fetchBrand(id: string) {
  const { data } = await apiClient.get<Brand>(`/brands/${id}`);
  return data;
}

export async function createBrand(payload: CreateBrandPayload) {
  const { data } = await apiClient.post<Brand>("/brands", payload);
  return data;
}

export async function updateBrand(id: string, payload: UpdateBrandPayload) {
  const { data } = await apiClient.patch<Brand>(`/brands/${id}`, payload);
  return data;
}

export async function archiveBrand(id: string) {
  const { data } = await apiClient.delete<{ id: string; archivedAt: string }>(
    `/brands/${id}`,
  );
  return data;
}

export async function unarchiveBrand(id: string) {
  const { data } = await apiClient.post<Brand>(`/brands/${id}/unarchive`);
  return data;
}
