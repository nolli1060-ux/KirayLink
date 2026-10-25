export type PropertyType =
  | "Apartment"
  | "Penthouse"
  | "Townhouse"
  | "Villa"
  | "Studio";

export type PropertyStatus = "available" | "pending" | "rented";

export interface PropertyLandlord {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  responseTime: string;
}

export interface Property {
  id: string;
  title: string;
  tagline: string;
  description: string;
  price: number;
  rentPeriod: "month" | "year";
  location: string;
  neighborhood: string;
  city: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  imageUrl: string;
  images: string[];
  amenities: string[];
  featured: boolean;
  status: PropertyStatus;
  yearBuilt: number;
  furnished: boolean;
  landlord: PropertyLandlord;
  createdAt: string;
}

export interface PropertyFiltersState {
  searchQuery: string;
  propertyType: string;
  neighborhood: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string; // "any" | "1" | "2" | "3" | "4"
  sortBy: "featured" | "price-asc" | "price-desc" | "newest" | "size-desc";
}
