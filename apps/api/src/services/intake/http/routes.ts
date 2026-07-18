import { Hono } from "hono";
import {
  jsonValidator,
  queryValidator,
} from "../../../middleware/validate.js";
import { NotFoundError } from "../../../utils/errors.js";
import { createBrandSchema } from "../../brands/http/schemas.js";
import {
  convertIntakeToBrand,
  createIntakeRequest,
  deleteIntakeRequest,
  generateIntakeEmail,
  getIntakeRequestById,
  getIntakeSummary,
  listIntakeRequests,
  markIntakeResponded,
  markIntakeSent,
  updateIntakeRequest,
} from "../domain/intakeService.js";
import { toIntakeRequestDto } from "./mappers.js";
import {
  createIntakeRequestSchema,
  listIntakeQuerySchema,
  updateIntakeRequestSchema,
} from "./schemas.js";

export const intakeRoutes = new Hono();

intakeRoutes.get("/summary", async (c) => {
  const summary = await getIntakeSummary();
  return c.json(summary);
});

intakeRoutes.get("/", queryValidator(listIntakeQuerySchema), async (c) => {
  const query = c.req.valid("query");
  const items = await listIntakeRequests(query);
  return c.json({ items: items.map(toIntakeRequestDto) });
});

intakeRoutes.post("/", jsonValidator(createIntakeRequestSchema), async (c) => {
  const body = c.req.valid("json");
  const intake = await createIntakeRequest(body);
  return c.json(toIntakeRequestDto(intake), 201);
});

intakeRoutes.get("/:intakeId", async (c) => {
  const intake = await getIntakeRequestById(c.req.param("intakeId"));
  if (!intake) throw new NotFoundError("Intake request no encontrado");
  return c.json(toIntakeRequestDto(intake));
});

intakeRoutes.patch(
  "/:intakeId",
  jsonValidator(updateIntakeRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const intake = await updateIntakeRequest(c.req.param("intakeId"), body);
    if (!intake) throw new NotFoundError("Intake request no encontrado");
    return c.json(toIntakeRequestDto(intake));
  },
);

intakeRoutes.post("/:intakeId/generate-email", async (c) => {
  const intake = await generateIntakeEmail(c.req.param("intakeId"));
  if (!intake) throw new NotFoundError("Intake request no encontrado");
  return c.json(toIntakeRequestDto(intake));
});

intakeRoutes.post("/:intakeId/mark-sent", async (c) => {
  const intake = await markIntakeSent(c.req.param("intakeId"));
  if (!intake) throw new NotFoundError("Intake request no encontrado");
  return c.json(toIntakeRequestDto(intake));
});

intakeRoutes.post("/:intakeId/mark-responded", async (c) => {
  const intake = await markIntakeResponded(c.req.param("intakeId"));
  if (!intake) throw new NotFoundError("Intake request no encontrado");
  return c.json(toIntakeRequestDto(intake));
});

intakeRoutes.delete("/:intakeId", async (c) => {
  const result = await deleteIntakeRequest(c.req.param("intakeId"));
  if (!result) throw new NotFoundError("Intake request no encontrado");
  return c.json(result);
});

intakeRoutes.post(
  "/:intakeId/convert-to-brand",
  jsonValidator(createBrandSchema),
  async (c) => {
    const body = c.req.valid("json");
    const result = await convertIntakeToBrand(c.req.param("intakeId"), body);
    if (!result) throw new NotFoundError("Intake request no encontrado");
    return c.json({
      intake: toIntakeRequestDto(result.intake),
      brand: result.brandDto,
    });
  },
);
