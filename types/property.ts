export type PropertyType = "sale" | "rent";
export type PropertyCategory = "house" | "apartment" | "villa" | "penthouse";

export interface PropertyLocation {
  address: string;
  city: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
}

export interface PropertyFeatures {
  beds: number;
  baths: number;
  sqm: number;
  garage?: number;
}

export interface PropertyImage {
  url: string;
  alt?: string;
  label?: string;
}

export interface PropertyAgent {
  name: string;
  role: string;
  photoUrl: string;
  phone?: string;
  email?: string;
}

export interface Property {
  id: string;
  slug?: string;
  title: string;
  price: number;
  pricePeriod?: "month" | "year";
  type: PropertyType;
  category: PropertyCategory;
  location: PropertyLocation;
  features: PropertyFeatures;
  imageUrl: string;
  imageAlt: string;
  images?: PropertyImage[];
  description?: string;
  amenities?: string[];
  agent?: PropertyAgent;
  badge?: string;
  isFeatured?: boolean;
}

