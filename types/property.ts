export type PropertyType = "sale" | "rent";
export type PropertyCategory = "house" | "apartment" | "villa" | "penthouse";

export interface PropertyLocation {
  address: string;
  city: string;
  state?: string;
  country?: string;
}

export interface PropertyFeatures {
  beds: number;
  baths: number;
  sqm: number;
}

export interface Property {
  id: string;
  title: string;
  price: number;
  pricePeriod?: "month" | "year";
  type: PropertyType;
  category: PropertyCategory;
  location: PropertyLocation;
  features: PropertyFeatures;
  imageUrl: string;
  imageAlt: string;
  badge?: string;
  isFeatured?: boolean;
}
