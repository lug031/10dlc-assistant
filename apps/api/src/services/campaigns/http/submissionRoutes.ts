import { Hono } from "hono";
import { jsonValidator } from "../../../middleware/validate.js";
import { NotFoundError } from "../../../utils/errors.js";
import {
  cloneSubmission,
  getSubmissionById,
  markSubmissionReady,
  markSubmissionSubmitted,
  markSubmissionRejected,
  markSubmissionApproved,
  updateSubmission,
  validateSubmission,
} from "../domain/campaignService.js";
import { toSubmissionDto } from "./mappers.js";
import {
  cloneSubmissionSchema,
  markSubmittedSchema,
  updateSubmissionSchema,
} from "./schemas.js";

export const submissionRoutes = new Hono();

submissionRoutes.get("/:submissionId", async (c) => {
  const submission = await getSubmissionById(c.req.param("submissionId"));
  if (!submission) throw new NotFoundError("Envio de campana no encontrado");
  return c.json(toSubmissionDto(submission));
});

submissionRoutes.patch(
  "/:submissionId",
  jsonValidator(updateSubmissionSchema),
  async (c) => {
    const body = c.req.valid("json");
    const submission = await updateSubmission(c.req.param("submissionId"), body);
    return c.json(toSubmissionDto(submission));
  },
);

submissionRoutes.post("/:submissionId/validate", async (c) => {
  const result = await validateSubmission(c.req.param("submissionId"));
  if (!result) throw new NotFoundError("Envio de campana no encontrado");
  return c.json(result);
});

submissionRoutes.post("/:submissionId/mark-ready", async (c) => {
  const { submission, validation } = await markSubmissionReady(
    c.req.param("submissionId"),
  );

  if (!validation) {
    throw new NotFoundError("Envio de campana no encontrado");
  }

  if (!validation.valid || !submission) {
    return c.json(validation, 400);
  }

  return c.json({
    ...toSubmissionDto(submission),
    validatedAt: submission.updatedAt,
  });
});

submissionRoutes.post(
  "/:submissionId/mark-submitted",
  jsonValidator(markSubmittedSchema),
  async (c) => {
    const body = c.req.valid("json");
    const { submission, validation } = await markSubmissionSubmitted(
      c.req.param("submissionId"),
      body,
    );

    if (!validation) {
      throw new NotFoundError("Envio de campana no encontrado");
    }

    if (!validation.valid || !submission) {
      return c.json(validation, 400);
    }

    return c.json(toSubmissionDto(submission));
  },
);

submissionRoutes.post("/:submissionId/mark-rejected", async (c) => {
  const submission = await markSubmissionRejected(c.req.param("submissionId"));
  return c.json(toSubmissionDto(submission));
});

submissionRoutes.post("/:submissionId/mark-approved", async (c) => {
  const submission = await markSubmissionApproved(c.req.param("submissionId"));
  return c.json(toSubmissionDto(submission));
});

submissionRoutes.post(
  "/:submissionId/clone",
  jsonValidator(cloneSubmissionSchema),
  async (c) => {
    const body = c.req.valid("json");
    const submission = await cloneSubmission(c.req.param("submissionId"), body);
    return c.json(toSubmissionDto(submission), 201);
  },
);
