import type { Property } from "@/types/property";
import PropertyCard from "@/components/properties/PropertyCard";

interface PropertyListProps {
  properties: Property[];
}

export default function PropertyList({ properties }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-lg">
        <p className="text-sm text-muted">No properties found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
