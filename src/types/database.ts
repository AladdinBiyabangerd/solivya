export type Amenity = {
  title: string;
  subtitle?: string;
};

export type LocaleCode = "az" | "ru";

export type Owner = {
  id: string;
  email: string;
  phone: string | null;
  created_at: string;
};

export type Property = {
  id: string;
  owner_id: string;
  slug: string;
  brand_name: string;
  title_az: string;
  title_ru: string;
  lead_az: string;
  lead_ru: string;
  zone: string;
  rooms: number;
  guests: number;
  price_night: number;
  price_note: string;
  min_nights: number;
  deposit: number;
  amenities: Amenity[];
  rules: string[];
  whatsapp_e164: string;
  locale_default: LocaleCode;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Photo = {
  id: string;
  property_id: string;
  storage_path: string;
  alt: string;
  sort_order: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      owners: {
        Row: Owner;
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Owner, "id" | "created_at">>;
      };
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Property, "id" | "created_at">>;
      };
      photos: {
        Row: Photo;
        Insert: Omit<Photo, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Photo, "id" | "created_at">>;
      };
    };
  };
};
