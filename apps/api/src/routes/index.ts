import { Hono } from "hono";
import { generalEnvironment } from "../environments/general.js";
import { brandRoutes } from "../services/brands/http/routes.js";
import { campaignRoutes } from "../services/campaigns/http/campaignRoutes.js";
import { submissionRoutes } from "../services/campaigns/http/submissionRoutes.js";
import { privacyReviewRoutes } from "../services/privacy/http/routes.js";
import { settingsRoutes } from "../services/settings/http/routes.js";
import { intakeRoutes } from "../services/intake/http/routes.js";

export const apiRoutes = new Hono();

apiRoutes.get("/health", (c) => {
  return c.json({
    status: "ok",
    version: generalEnvironment.version,
  });
});

apiRoutes.route("/settings", settingsRoutes);
apiRoutes.route("/brands", brandRoutes);
apiRoutes.route("/campaigns", campaignRoutes);
apiRoutes.route("/campaign-submissions", submissionRoutes);
apiRoutes.route("/privacy-reviews", privacyReviewRoutes);
apiRoutes.route("/intake", intakeRoutes);
