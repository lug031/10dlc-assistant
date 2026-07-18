import { randomUUID } from "node:crypto";
import { and, count, desc, eq, like, or } from "drizzle-orm";
import { INTAKE_REQUEST_STATUSES } from "../../../constants/enums.js";
import { db } from "../../../infrastructure/db/client.js";
import { intakeRequests } from "../../../infrastructure/db/schema.js";
import { NotFoundError, ValidationError } from "../../../utils/errors.js";
import type {
  CreateIntakeRequestDto,
  UpdateIntakeRequestDto,
} from "../http/schemas.js";

export type IntakeRepositoryPatch = UpdateIntakeRequestDto & {
  emailSubject?: string;
  emailBody?: string;
  requestedAt?: string | null;
  convertedBrandId?: string | null;
  status?: string;
};

export const intakeRepository = {
  async create(data: CreateIntakeRequestDto) {
    const now = new Date().toISOString();
    const id = randomUUID();

    const [row] = await db
      .insert(intakeRequests)
      .values({
        id,
        brandName: data.brandName,
        contactName: data.contactName?.trim() ?? "",
        contactEmail: data.contactEmail,
        status: "DRAFT",
        notes: data.notes ?? null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return row;
  },

  async findById(id: string) {
    const [row] = await db
      .select()
      .from(intakeRequests)
      .where(eq(intakeRequests.id, id))
      .limit(1);

    return row ?? null;
  },

  async list(params?: { status?: string; search?: string }) {
    const conditions = [];

    if (params?.status) {
      conditions.push(eq(intakeRequests.status, params.status));
    }

    if (params?.search?.trim()) {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          like(intakeRequests.brandName, term),
          like(intakeRequests.contactName, term),
          like(intakeRequests.contactEmail, term),
        ),
      );
    }

    const query = db
      .select()
      .from(intakeRequests)
      .orderBy(desc(intakeRequests.updatedAt));

    if (conditions.length > 0) {
      return query.where(and(...conditions));
    }

    return query;
  },

  async update(id: string, data: IntakeRepositoryPatch) {
    const existing = await intakeRepository.findById(id);
    if (!existing) throw new NotFoundError("Intake request no encontrado");

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { updatedAt: now };

    if (data.brandName !== undefined) patch.brandName = data.brandName;
    if (data.contactName !== undefined) {
      patch.contactName = data.contactName.trim();
    }
    if (data.contactEmail !== undefined) patch.contactEmail = data.contactEmail;
    if (data.notes !== undefined) patch.notes = data.notes ?? null;
    if (data.emailSubject !== undefined) patch.emailSubject = data.emailSubject;
    if (data.emailBody !== undefined) patch.emailBody = data.emailBody;
    if (data.status !== undefined) patch.status = data.status;
    if (data.requestedAt !== undefined) patch.requestedAt = data.requestedAt;
    if (data.convertedBrandId !== undefined) {
      patch.convertedBrandId = data.convertedBrandId;
    }

    const [row] = await db
      .update(intakeRequests)
      .set(patch)
      .where(eq(intakeRequests.id, id))
      .returning();

    return row;
  },

  async delete(id: string) {
    const existing = await intakeRepository.findById(id);
    if (!existing) throw new NotFoundError("Intake request no encontrado");

    await db.delete(intakeRequests).where(eq(intakeRequests.id, id));

    return { id };
  },

  async getStatusSummary() {
    const rows = await db
      .select({
        status: intakeRequests.status,
        total: count(),
      })
      .from(intakeRequests)
      .groupBy(intakeRequests.status);

    const summary = {
      draft: 0,
      sent: 0,
      responded: 0,
      converted: 0,
      cancelled: 0,
      total: 0,
    };

    for (const row of rows) {
      const n = row.total;
      summary.total += n;
      switch (row.status) {
        case "DRAFT":
          summary.draft = n;
          break;
        case "SENT":
          summary.sent = n;
          break;
        case "RESPONDED":
          summary.responded = n;
          break;
        case "CONVERTED":
          summary.converted = n;
          break;
        case "CANCELLED":
          summary.cancelled = n;
          break;
      }
    }

    return summary;
  },

  assertStatus(
    current: string,
    allowed: (typeof INTAKE_REQUEST_STATUSES)[number][],
  ) {
    if (!allowed.includes(current as (typeof INTAKE_REQUEST_STATUSES)[number])) {
      throw new ValidationError(
        `Estado actual (${current}) no permite esta operacion`,
      );
    }
  },
};
