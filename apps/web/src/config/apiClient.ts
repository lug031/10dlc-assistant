import axios, { type AxiosError } from "axios";
import { generalEnvironment } from "@/environments/general";
import type { ApiErrorBody } from "@/types/brand";

export const apiClient = axios.create({
  baseURL: `${generalEnvironment.apiUrl}/api`,
  headers: { "Content-Type": "application/json" },
});

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const apiMessage = axiosError.response?.data?.error?.message;
    if (apiMessage) return apiMessage;

    const details = axiosError.response?.data?.error?.details;
    if (details?.length) {
      return details.map((d) => d.message).join(". ");
    }
  }

  if (error instanceof Error) return error.message;
  return "Error desconocido";
}
