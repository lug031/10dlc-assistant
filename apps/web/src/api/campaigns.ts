import { apiClient } from "@/config/apiClient";
import type {
  Campaign,
  CampaignSubmission,
  CreateCampaignPayload,
  CreateSubmissionPayload,
  SubmissionValidationResult,
  UpdateSubmissionPayload,
} from "@/types/campaign";
import type { CampaignGateResult } from "@/types/campaignGate";

export async function fetchCampaignGate(brandId: string) {
  const { data } = await apiClient.get<CampaignGateResult>(
    `/brands/${brandId}/campaign-gate`,
  );
  return data;
}

export async function fetchCampaigns(brandId: string) {
  const { data } = await apiClient.get<{ items: Campaign[] }>(
    `/brands/${brandId}/campaigns`,
  );
  return data.items;
}

export async function createCampaign(
  brandId: string,
  payload: CreateCampaignPayload,
) {
  const { data } = await apiClient.post<Campaign>(
    `/brands/${brandId}/campaigns`,
    payload,
  );
  return data;
}

export async function fetchCampaign(campaignId: string) {
  const { data } = await apiClient.get<Campaign>(`/campaigns/${campaignId}`);
  return data;
}

export async function fetchSubmissions(campaignId: string) {
  const { data } = await apiClient.get<{ items: CampaignSubmission[] }>(
    `/campaigns/${campaignId}/submissions`,
  );
  return data.items;
}

export async function createSubmission(
  campaignId: string,
  payload?: CreateSubmissionPayload,
) {
  const { data } = await apiClient.post<CampaignSubmission>(
    `/campaigns/${campaignId}/submissions`,
    payload ?? {},
  );
  return data;
}

export async function fetchSubmission(submissionId: string) {
  const { data } = await apiClient.get<CampaignSubmission>(
    `/campaign-submissions/${submissionId}`,
  );
  return data;
}

export async function updateSubmission(
  submissionId: string,
  payload: UpdateSubmissionPayload,
) {
  const { data } = await apiClient.patch<CampaignSubmission>(
    `/campaign-submissions/${submissionId}`,
    payload,
  );
  return data;
}

export async function validateSubmission(submissionId: string) {
  const { data } = await apiClient.post<SubmissionValidationResult>(
    `/campaign-submissions/${submissionId}/validate`,
  );
  return data;
}

export async function markSubmissionReady(submissionId: string) {
  const { data } = await apiClient.post<CampaignSubmission & { validatedAt?: string }>(
    `/campaign-submissions/${submissionId}/mark-ready`,
  );
  return data;
}

export async function markSubmissionSubmitted(
  submissionId: string,
  payload?: { externalPortalReference?: string },
) {
  const { data } = await apiClient.post<CampaignSubmission>(
    `/campaign-submissions/${submissionId}/mark-submitted`,
    payload ?? {},
  );
  return data;
}

export async function markSubmissionRejected(submissionId: string) {
  const { data } = await apiClient.post<CampaignSubmission>(
    `/campaign-submissions/${submissionId}/mark-rejected`,
  );
  return data;
}

export async function markSubmissionApproved(submissionId: string) {
  const { data } = await apiClient.post<CampaignSubmission>(
    `/campaign-submissions/${submissionId}/mark-approved`,
  );
  return data;
}

export async function cloneSubmission(
  submissionId: string,
  payload?: { changeSummary?: string },
) {
  const { data } = await apiClient.post<CampaignSubmission>(
    `/campaign-submissions/${submissionId}/clone`,
    payload ?? {},
  );
  return data;
}
