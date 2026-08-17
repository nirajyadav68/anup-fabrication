export interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  imageAlt: string;
  enabled: boolean;
}

export interface TrustPoint {
  title: string;
  description: string;
}
