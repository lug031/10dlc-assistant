import { brandRepository } from "../data-access/brandRepository.js";
import type { CreateBrandDto, UpdateBrandDto } from "../http/schemas.js";

export async function createBrand(data: CreateBrandDto) {
  return brandRepository.create(data);
}

export async function getBrandById(id: string) {
  return brandRepository.findById(id);
}

export async function listBrands(params: {
  search?: string;
  archived?: boolean;
  limit: number;
  offset: number;
}) {
  return brandRepository.list(params);
}

export async function updateBrand(id: string, data: UpdateBrandDto) {
  return brandRepository.update(id, data);
}

export async function archiveBrand(id: string) {
  return brandRepository.archive(id);
}

export async function unarchiveBrand(id: string) {
  return brandRepository.unarchive(id);
}
