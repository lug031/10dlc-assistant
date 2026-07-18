import { createBrand } from "../../brands/domain/brandService.js";
import type { CreateBrandDto } from "../../brands/http/schemas.js";
import { toBrandDto } from "../../brands/http/mappers.js";
import { intakeRepository } from "../data-access/intakeRepository.js";
import {
  buildIntakeEmailBody,
  buildIntakeEmailSubject,
} from "./intakeEmailTemplate.js";
import type {
  CreateIntakeRequestDto,
  UpdateIntakeRequestDto,
} from "../http/schemas.js";
import { ValidationError } from "../../../utils/errors.js";

export async function listIntakeRequests(params?: {
  status?: string;
  search?: string;
}) {
  return intakeRepository.list(params);
}

export async function getIntakeRequestById(id: string) {
  return intakeRepository.findById(id);
}

export async function getIntakeSummary() {
  return intakeRepository.getStatusSummary();
}

export async function createIntakeRequest(data: CreateIntakeRequestDto) {
  return intakeRepository.create(data);
}

export async function updateIntakeRequest(
  id: string,
  data: UpdateIntakeRequestDto,
) {
  const existing = await intakeRepository.findById(id);
  if (!existing) return null;

  if (existing.status === "CONVERTED" || existing.status === "CANCELLED") {
    throw new ValidationError(
      "No se puede editar un intake convertido o cancelado",
    );
  }

  if (data.status && data.status !== existing.status) {
    throw new ValidationError("Use los endpoints de estado para cambiar status");
  }

  return intakeRepository.update(id, data);
}

export async function generateIntakeEmail(id: string) {
  const existing = await intakeRepository.findById(id);
  if (!existing) return null;

  if (existing.status === "CONVERTED" || existing.status === "CANCELLED") {
    throw new ValidationError(
      "No se puede generar correo para intake convertido o cancelado",
    );
  }

  const emailSubject = buildIntakeEmailSubject(existing.brandName);
  const emailBody = buildIntakeEmailBody({
    brandName: existing.brandName,
    contactName: existing.contactName,
  });

  return intakeRepository.update(id, {
    emailSubject,
    emailBody,
  });
}

export async function markIntakeSent(id: string) {
  const existing = await intakeRepository.findById(id);
  if (!existing) return null;

  intakeRepository.assertStatus(existing.status, ["DRAFT", "SENT"]);

  const now = new Date().toISOString();
  return intakeRepository.update(id, {
    status: "SENT",
    requestedAt: existing.requestedAt ?? now,
  });
}

export async function markIntakeResponded(id: string) {
  const existing = await intakeRepository.findById(id);
  if (!existing) return null;

  intakeRepository.assertStatus(existing.status, ["SENT", "RESPONDED"]);

  return intakeRepository.update(id, { status: "RESPONDED" });
}

export async function deleteIntakeRequest(id: string) {
  const existing = await intakeRepository.findById(id);
  if (!existing) return null;

  if (existing.status === "CONVERTED") {
    throw new ValidationError(
      "No se puede eliminar un intake que ya fue convertido a marca",
    );
  }

  return intakeRepository.delete(id);
}

export async function convertIntakeToBrand(
  id: string,
  brandData: CreateBrandDto,
) {
  const existing = await intakeRepository.findById(id);
  if (!existing) return null;

  if (existing.status === "CONVERTED") {
    throw new ValidationError("Este intake ya fue convertido a marca");
  }

  if (existing.status === "CANCELLED") {
    throw new ValidationError("No se puede convertir un intake cancelado");
  }

  intakeRepository.assertStatus(existing.status, ["RESPONDED"]);

  const brand = await createBrand(brandData);
  const intake = await intakeRepository.update(id, {
    status: "CONVERTED",
    convertedBrandId: brand.id,
  });

  return {
    intake,
    brand,
    brandDto: toBrandDto(brand),
  };
}
