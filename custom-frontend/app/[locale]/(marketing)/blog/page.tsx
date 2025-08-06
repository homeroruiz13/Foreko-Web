import { type Metadata } from "next";

import { Container } from "@/components/container";
import { Heading } from "@/components/elements/heading";
import { Subheading } from "@/components/elements/subheading";
import { BlogCard } from "@/components/blog-card";
import { FeatureIconContainer } from "@/components/dynamic-zone/features/feature-icon-container";
import { IconClipboardText } from "@tabler/icons-react";
import { BlogPostRows } from "@/components/blog-post-rows";
import { AmbientColor } from "@/components/decorations/ambient-color";
import { mockBlogPage, mockArticles } from "@/lib/mock-data";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return {
    title: 'Blog',
    description: 'Latest insights and updates from our team',
  };
}

export default async function Blog({
  params,
}: {
  params: { locale: string, slug: string };
}) {
  return (
    <div className="relative overflow-hidden py-20 md:py-0">
      <AmbientColor />
      <Container className="flex flex-col items-center justify-between pb-20">
        <div className="relative z-20 py-10 md:pt-40">
          <FeatureIconContainer className="flex justify-center items-center overflow-hidden">
            <IconClipboardText className="h-6 w-6 text-white" />
          </FeatureIconContainer>
          <Heading as="h1" className="mt-4">
            {mockBlogPage.heading}
          </Heading>
          <Subheading className="max-w-3xl mx-auto">
            {mockBlogPage.sub_heading}
          </Subheading>
        </div>

        {mockArticles.data.slice(0, 1).map((article: any) => (
          <BlogCard article={article} locale={params.locale} key={article.title} />
        ))}

        <BlogPostRows articles={mockArticles.data} />
      </Container>
    </div>
  );
}
