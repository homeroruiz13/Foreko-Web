import React from "react";

import { BlogLayout } from "@/components/blog-layout";
import { mockArticles } from "@/lib/mock-data";

import ClientSlugHandler from "../../ClientSlugHandler";

export default async function SingleArticlePage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const article = mockArticles.data.find(a => a.slug === params.slug);

  if (!article) {
    return <div>Blog not found</div>;
  }

  const localizedSlugs = { [params.locale]: params.slug };

  return (
    <BlogLayout article={article} locale={params.locale}>
      <ClientSlugHandler localizedSlugs={localizedSlugs} />
      <div className="prose prose-invert max-w-none">
        {typeof article.content === 'string' ? article.content : 'Content will be displayed here'}
      </div>
    </BlogLayout>
  );
}
