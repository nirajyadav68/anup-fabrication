import type { MetadataRoute } from "next";
import { getPublishedServices } from "@/lib/data/services";
import { getPublishedProducts } from "@/lib/data/products";
import { getPublishedProjects } from "@/lib/data/projects";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/about", "/services", "/projects", "/gallery", "/products", "/quote", "/contact"].map(
    (path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
    })
  );

  const [services, products, projects] = await Promise.all([
    getPublishedServices(),
    getPublishedProducts(),
    getPublishedProjects(),
  ]);

  const serviceRoutes = services.map((s) => ({
    url: `${siteConfig.url}/services/${s.slug}`,
    lastModified: new Date(),
  }));
  const productRoutes = products.map((p) => ({
    url: `${siteConfig.url}/products/${p.slug}`,
    lastModified: new Date(),
  }));
  const projectRoutes = projects.map((p) => ({
    url: `${siteConfig.url}/projects/${p.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...serviceRoutes, ...productRoutes, ...projectRoutes];
}
