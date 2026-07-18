import { randomUUID } from "node:crypto";
import { and, count, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import {
  BRAND_ENTITY_TYPE,
  BRAND_VERTICAL_TYPE,
} from "../../../constants/enums.js";
import { db } from "../../../infrastructure/db/client.js";
import { brands } from "../../../infrastructure/db/schema.js";
import { NotFoundError, ValidationError } from "../../../utils/errors.js";
import type { CreateBrandDto, UpdateBrandDto } from "../http/schemas.js";

export const brandRepository = {
  async create(data: CreateBrandDto) {
    const now = new Date().toISOString();
    const id = randomUUID();

    const [brand] = await db
      .insert(brands)
      .values({
        id,
        internalAlias: data.internalAlias ?? null,
        legalName: data.legalName,
        dbaName: data.dbaName ?? null,
        entityType: BRAND_ENTITY_TYPE,
        einOrTaxId: data.einOrTaxId,
        registrationCountry: data.registrationCountry,
        taxIdIssuingCountry: data.taxIdIssuingCountry,
        legalAddressLine1: data.legalAddressLine1,
        legalAddressLine2: data.legalAddressLine2 ?? null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.registrationCountry,
        verticalType: BRAND_VERTICAL_TYPE,
        businessDescription: data.businessDescription ?? "",
        supportPhoneNumber: data.supportPhoneNumber,
        supportEmailAddress: data.supportEmailAddress,
        websiteUrl: data.websiteUrl ?? null,
        primaryLanguage: data.primaryLanguage ?? "EN",
        intakeNotes: data.intakeNotes ?? null,
        intakeStatus: data.intakeStatus ?? "PENDING",
        brandRegistrationStatus: "DRAFT",
        workflowStage: "LEGAL_COLLECTION",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return brand;
  },

  async findById(id: string) {
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);

    return brand ?? null;
  },

  async requireById(id: string) {
    const brand = await brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundError("Marca no encontrada");
    }
    return brand;
  },

  async requireActiveById(id: string) {
    const brand = await brandRepository.requireById(id);
    if (brand.archivedAt) {
      throw new NotFoundError("Marca archivada");
    }
    return brand;
  },

  async list(params: {
    search?: string;
    archived?: boolean;
    limit: number;
    offset: number;
  }) {
    const conditions = [];

    if (params.archived) {
      conditions.push(sql`${brands.archivedAt} IS NOT NULL`);
    } else {
      conditions.push(isNull(brands.archivedAt));
    }

    if (params.search?.trim()) {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(
          like(brands.legalName, term),
          like(brands.internalAlias, term),
          like(brands.dbaName, term),
        ),
      );
    }

    const whereClause = and(...conditions);

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(brands)
        .where(whereClause)
        .orderBy(desc(brands.updatedAt))
        .limit(params.limit)
        .offset(params.offset),
      db.select({ total: count() }).from(brands).where(whereClause),
    ]);

    return {
      items,
      total: totalResult[0]?.total ?? 0,
    };
  },

  async update(id: string, data: UpdateBrandDto) {
    const existing = await brandRepository.findById(id);
    if (!existing) throw new NotFoundError("Marca no encontrada");
    if (existing.archivedAt) {
      throw new NotFoundError("Marca archivada");
    }

    const now = new Date().toISOString();
    const patch: Record<string, unknown> = {
      updatedAt: now,
      entityType: BRAND_ENTITY_TYPE,
      verticalType: BRAND_VERTICAL_TYPE,
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (key === "entityType" || key === "verticalType") continue;
        patch[key] = value === "" && key === "websiteUrl" ? null : value;
      }
    }

    if (data.registrationCountry !== undefined) {
      patch.country = data.registrationCountry;
    }

    const [brand] = await db
      .update(brands)
      .set(patch)
      .where(eq(brands.id, id))
      .returning();

    return brand;
  },

  async archive(id: string) {
    const existing = await brandRepository.findById(id);
    if (!existing) throw new NotFoundError("Marca no encontrada");
    if (existing.archivedAt) {
      throw new ValidationError("La marca ya esta archivada");
    }

    const now = new Date().toISOString();
    const [brand] = await db
      .update(brands)
      .set({ archivedAt: now, updatedAt: now })
      .where(eq(brands.id, id))
      .returning();

    return brand;
  },

  async unarchive(id: string) {
    const existing = await brandRepository.findById(id);
    if (!existing) throw new NotFoundError("Marca no encontrada");
    if (!existing.archivedAt) {
      throw new ValidationError("La marca no esta archivada");
    }

    const now = new Date().toISOString();
    const [brand] = await db
      .update(brands)
      .set({ archivedAt: null, updatedAt: now })
      .where(eq(brands.id, id))
      .returning();

    return brand;
  },
};
