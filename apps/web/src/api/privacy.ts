import { apiClient } from "@/config/apiClient";
import type {
  CreatePrivacyReviewPayload,
  PrivacyReview,
  PrivacyValidationResult,
  UpdatePrivacyReviewPayload,
} from "@/types/privacy";

export async function fetchPrivacyReviews(brandId: string) {
  const { data } = await apiClient.get<{ items: PrivacyReview[] }>(
    `/brands/${brandId}/privacy-reviews`,
  );
  return data.items;
}

export async function fetchCurrentPrivacyReview(brandId: string) {
  const { data } = await apiClient.get<PrivacyReview | null>(
    `/brands/${brandId}/privacy-reviews/current`,
  );
  return data;
}

export async function createPrivacyReview(
  brandId: string,
  payload: CreatePrivacyReviewPayload,
) {
  const { data } = await apiClient.post<PrivacyReview>(
    `/brands/${brandId}/privacy-reviews`,
    payload,
  );
  return data;
}

export async function fetchPrivacyReview(reviewId: string) {
  const { data } = await apiClient.get<PrivacyReview>(
    `/privacy-reviews/${reviewId}`,
  );
  return data;
}

export async function updatePrivacyReview(
  reviewId: string,
  payload: UpdatePrivacyReviewPayload,
) {
  const { data } = await apiClient.patch<PrivacyReview>(
    `/privacy-reviews/${reviewId}`,
    payload,
  );
  return data;
}

export async function setCurrentPrivacyReview(reviewId: string) {
  const { data } = await apiClient.post<PrivacyReview>(
    `/privacy-reviews/${reviewId}/set-current`,
  );
  return data;
}

export async function validatePrivacyReview(reviewId: string) {
  const { data } = await apiClient.post<PrivacyValidationResult>(
    `/privacy-reviews/${reviewId}/validate`,
  );
  return data;
}

export async function markPrivacyInitialEmailSent(reviewId: string) {
  const { data } = await apiClient.post<PrivacyReview>(
    `/privacy-reviews/${reviewId}/privacy-email/initial-sent`,
  );
  return data;
}

export async function markPrivacyFollowupSent(reviewId: string) {
  const { data } = await apiClient.post<PrivacyReview>(
    `/privacy-reviews/${reviewId}/privacy-email/followup-sent`,
  );
  return data;
}

export async function markPrivacyClientResponded(reviewId: string) {
  const { data } = await apiClient.post<PrivacyReview>(
    `/privacy-reviews/${reviewId}/privacy-email/client-responded`,
  );
  return data;
}
