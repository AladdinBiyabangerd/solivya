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
  zone_note: string;
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
  /** Pre-gallery-crop original; used when promoting to main. */
  original_path: string | null;
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
        Update: {
          email?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Property, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "owners";
            referencedColumns: ["id"];
          },
        ];
      };
      photos: {
        Row: Photo;
        Insert: Omit<Photo, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Photo, "id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "photos_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
