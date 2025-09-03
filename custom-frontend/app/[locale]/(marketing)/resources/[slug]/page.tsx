import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    return <div>Article not found</div>;
  }

  const localizedSlugs = { [params.locale]: params.slug };

  return (
    <BlogLayout article={article} locale={params.locale}>
      <ClientSlugHandler localizedSlugs={localizedSlugs} />
      <div className="prose prose-invert max-w-none prose-headings:text-neutral-200 prose-p:text-neutral-300 prose-strong:text-neutral-100 prose-li:text-neutral-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {typeof article.content === 'string' ? article.content : 'Content will be displayed here'}
        </ReactMarkdown>
      </div>
    </BlogLayout>
  );
}