import type { InferSelectModel } from "drizzle-orm";
import { projects } from "../db/schema";

export type Project = InferSelectModel<typeof projects>;

export function parseList(value: string | null | undefined): string[] {
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/^-|-$/g, "") || crypto.randomUUID().slice(0, 8);
}
