export type TemperatureUnit = "celsius" | "fahrenheit";

export interface SavedCity {
  id: string;
  client_id: string;
  name: string;
  latitude: number;
  longitude: number;
  country: string | null;
  admin1: string | null;
  created_at: string;
}

export interface UserPreferences {
  client_id: string;
  temperature_unit: TemperatureUnit;
  updated_at: string;
}

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      saved_cities: TableDef<
        SavedCity,
        Omit<SavedCity, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        },
        Partial<SavedCity>
      >;
      user_preferences: TableDef<
        UserPreferences,
        Omit<UserPreferences, "updated_at"> & { updated_at?: string },
        Partial<UserPreferences>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
