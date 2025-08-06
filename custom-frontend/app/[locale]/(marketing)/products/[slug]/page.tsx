import { Metadata } from "next";

import { redirect } from "next/navigation";
import { Container } from "@/components/container";
import { AmbientColor } from "@/components/decorations/ambient-color";
import { SingleProduct } from "@/components/products/single-product";
import DynamicZoneManager from '@/components/dynamic-zone/manager'
import { generateMetadataObject } from '@/lib/shared/metadata';

import { mockProducts } from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: { locale: string, slug: string };
}): Promise<Metadata> {
  const product = mockProducts.data.find(p => p.slug === params.slug);
  
  return {
    title: product?.name || "Product Not Found",
    description: product?.description || "Product details",
  };
}

export default async function SingleProductPage({
  params,
}: {
  params: { slug: string, locale: string };
}) {
  const product = mockProducts.data.find(p => p.slug === params.slug);

  if (!product) {
    redirect("/products");
  }

  return (
    <div className="relative overflow-hidden w-full">
      <AmbientColor />
      <Container className="py-20 md:py-40">
        <SingleProduct product={product} />
        {product?.dynamic_zone && (<DynamicZoneManager dynamicZone={product?.dynamic_zone} locale={params.locale} />)}
      </Container>
    </div>
  );
}
