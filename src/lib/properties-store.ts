import fs from "fs";
import path from "path";
import type { Property, PropertyStatus } from "@/types/property";
import { properties as baseProperties } from "@/data/properties";

const customPropertiesPath = path.join(
  process.cwd(),
  "src",
  "data",
  "custom-properties.json"
);

const overridesPath = path.join(
  process.cwd(),
  "src",
  "data",
  "property-overrides.json"
);

interface OverridesData {
  statusOverrides: Record<string, PropertyStatus>;
  deletedIds: string[];
}

function getOverrides(): OverridesData {
  try {
    if (fs.existsSync(overridesPath)) {
      const data = fs.readFileSync(overridesPath, "utf8");
      const parsed = JSON.parse(data) as Partial<OverridesData>;
      return {
        statusOverrides: parsed.statusOverrides ?? {},
        deletedIds: parsed.deletedIds ?? [],
      };
    }
  } catch (err) {
    console.error("Failed to read property overrides:", err);
  }
  return { statusOverrides: {}, deletedIds: [] };
}

function saveOverrides(overrides: OverridesData): void {
  try {
    fs.writeFileSync(overridesPath, JSON.stringify(overrides, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save property overrides:", err);
  }
}

export function getCustomProperties(): Property[] {
  try {
    if (fs.existsSync(customPropertiesPath)) {
      const data = fs.readFileSync(customPropertiesPath, "utf8");
      return JSON.parse(data) as Property[];
    }
  } catch (err) {
    console.error("Failed to read custom properties:", err);
  }
  return [];
}

export function saveCustomProperties(props: Property[]): void {
  try {
    fs.writeFileSync(
      customPropertiesPath,
      JSON.stringify(props, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error("Failed to save custom properties:", err);
  }
}

// Returns all active properties (base + custom, applying overrides and excluding deleted)
export function getAllActiveProperties(): Property[] {
  const custom = getCustomProperties();
  const overrides = getOverrides();

  const combined = [...baseProperties, ...custom];

  return combined
    .filter((prop) => !overrides.deletedIds.includes(prop.id))
    .map((prop) => {
      if (overrides.statusOverrides[prop.id]) {
        return {
          ...prop,
          status: overrides.statusOverrides[prop.id],
        };
      }
      return prop;
    });
}

// Find property by ID from the active collection
export function getActivePropertyById(id: string): Property | undefined {
  return getAllActiveProperties().find((p) => p.id === id);
}

// Record a status change for a property
export function setPropertyStatusOverride(
  id: string,
  status: PropertyStatus
): void {
  const overrides = getOverrides();
  overrides.statusOverrides[id] = status;
  saveOverrides(overrides);
}

// Record a deletion for a property
export function markPropertyDeleted(id: string): void {
  const overrides = getOverrides();
  if (!overrides.deletedIds.includes(id)) {
    overrides.deletedIds.push(id);
    saveOverrides(overrides);
  }
}
