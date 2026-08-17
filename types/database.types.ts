/**
 * Hand-written to match supabase/migrations/0001_init.sql.
 * Once your Supabase project is linked, regenerate the real thing with:
 *   npx supabase gen types typescript --project-id <your-project-id> > types/database.types.ts
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: "admin" | "staff";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          full_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      services: {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_description: string;
          description: string;
          image_url: string | null;
          is_enabled: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["services"]["Row"]> & {
          slug: string;
          name: string;
          short_description: string;
          description: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Row"]>;
      };
      products: {
        Row: {
          id: string;
          sku: string | null;
          name: string;
          slug: string;
          description: string;
          category_id: string | null;
          material: string | null;
          size: string | null;
          weight_kg: number | null;
          price: number | null;
          price_type: "fixed" | "starting_from" | "contact";
          stock_status: "in_stock" | "out_of_stock" | "made_to_order";
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          name: string;
          slug: string;
          description: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      quotes: {
        Row: {
          id: string;
          quote_number: string;
          customer_id: string | null;
          customer_name: string;
          phone: string;
          whatsapp: string | null;
          email: string | null;
          city: string | null;
          address: string | null;
          service_type: string | null;
          product_or_project: string | null;
          material: string | null;
          approximate_size: string | null;
          quantity: number | null;
          budget: number | null;
          required_date: string | null;
          description: string | null;
          status:
            | "new"
            | "contacted"
            | "quotation_sent"
            | "negotiation"
            | "approved"
            | "rejected"
            | "completed";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["quotes"]["Row"]> & {
          customer_name: string;
          phone: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotes"]["Row"]>;
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]> & {
          name: string;
          phone: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]>;
      };
      website_settings: {
        Row: {
          id: boolean;
          company_name: string;
          logo_path: string | null;
          phone: string;
          whatsapp: string;
          email: string;
          address: string;
          google_maps_url: string | null;
          business_hours: string | null;
          social_instagram: string | null;
          social_facebook: string | null;
          hero_title: string | null;
          hero_description: string | null;
          footer_text: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["website_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["website_settings"]["Row"]>;
      };
      // orders, order_items, customers, projects, project_images, gallery,
      // categories, reviews, product_images, quote_files follow the same
      // shape as their SQL definitions in supabase/migrations/0001_init.sql —
      // add them here as each admin page is built in Phase 3/4.
    };
  };
}
