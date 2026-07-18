import { AppLayout } from "@/components/layout/AppLayout";
import { BrandCreatePage } from "@/views/Brands/BrandCreatePage";
import { BrandDetailPage } from "@/views/Brands/BrandDetailPage";
import { BrandEditPage } from "@/views/Brands/BrandEditPage";
import { BrandsListPage } from "@/views/Brands/BrandsListPage";
import { DashboardPage } from "@/views/Dashboard/DashboardPage";
import { PrivacyDetailPage } from "@/views/Privacy/PrivacyDetailPage";
import { PrivacyFormPage } from "@/views/Privacy/PrivacyFormPage";
import { PrivacyListPage } from "@/views/Privacy/PrivacyListPage";
import { CampaignCreatePage } from "@/views/Campaigns/CampaignCreatePage";
import { CampaignDetailPage } from "@/views/Campaigns/CampaignDetailPage";
import { CampaignListPage } from "@/views/Campaigns/CampaignListPage";
import { SubmissionEditorPage } from "@/views/Campaigns/SubmissionEditorPage";
import { IntakeConvertPage } from "@/views/Intake/IntakeConvertPage";
import { IntakeCreatePage } from "@/views/Intake/IntakeCreatePage";
import { IntakeDetailPage } from "@/views/Intake/IntakeDetailPage";
import { IntakeListPage } from "@/views/Intake/IntakeListPage";
import { CommunicationsPage } from "@/views/Communications/CommunicationsPage";
import { LeadwireCatalogPage } from "@/views/Templates/LeadwireCatalogPage";
import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "intake", element: <IntakeListPage /> },
      { path: "intake/new", element: <IntakeCreatePage /> },
      { path: "intake/:intakeId", element: <IntakeDetailPage /> },
      { path: "intake/:intakeId/convert", element: <IntakeConvertPage /> },
      { path: "brands", element: <BrandsListPage /> },
      { path: "brands/new", element: <BrandCreatePage /> },
      { path: "brands/:brandId", element: <BrandDetailPage /> },
      { path: "brands/:brandId/edit", element: <BrandEditPage /> },
      { path: "brands/:brandId/privacy", element: <PrivacyListPage /> },
      { path: "brands/:brandId/privacy/new", element: <PrivacyFormPage /> },
      {
        path: "brands/:brandId/privacy/:reviewId/edit",
        element: <PrivacyFormPage />,
      },
      {
        path: "brands/:brandId/privacy/:reviewId",
        element: <PrivacyDetailPage />,
      },
      { path: "brands/:brandId/campaigns", element: <CampaignListPage /> },
      { path: "brands/:brandId/campaigns/new", element: <CampaignCreatePage /> },
      { path: "brands/:brandId/communications", element: <CommunicationsPage /> },
      { path: "templates/leadwire", element: <LeadwireCatalogPage /> },
      { path: "campaigns/:campaignId", element: <CampaignDetailPage /> },
      {
        path: "campaigns/:campaignId/submissions/:submissionId",
        element: <SubmissionEditorPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
