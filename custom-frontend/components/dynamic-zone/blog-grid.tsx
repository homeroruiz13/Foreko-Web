"use client";
import React from "react";
import { Link } from "next-view-transitions";
import { BlurImage } from "@/components/blur-image";
import { truncate } from "@/lib/utils";
import { format } from "date-fns";
import { getImageUrl } from "@/lib/api/imageUtils";
import { Container } from "../container";
import { Heading } from "../elements/heading";
import { Subheading } from "../elements/subheading";

export const BlogGrid = ({ heading, sub_heading, articles, locale }: { 
  heading: string; 
  sub_heading: string; 
  articles: any[], 
  locale: string 
}) => {
  return (
    <div className="pt-40">
      <Container>
        {/* Centered Heading and Search */}
        <div className="text-center mb-16">
          <Heading>{heading}</Heading>
          <Subheading className="max-w-3xl mx-auto">
            {sub_heading}
          </Subheading>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles"
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Article */}
        {articles.length > 0 && (
          <FeaturedArticle article={articles[0]} locale={locale} />
        )}
        
        {/* More Posts Section */}
        {articles.length > 1 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-neutral-200 mb-8">More Posts</h2>
            <div className="space-y-6">
              {articles.slice(1).map((article) => (
                <CompactArticleCard key={article.slug} article={article} locale={locale} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

const FeaturedArticle = ({ article, locale }: { article: any, locale: string }) => {
  return (
    <Link
      className="block group"
      href={`/${locale}/resources/${article.slug}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="order-2 lg:order-1">
          <div className="flex gap-2 flex-wrap mb-4">
            {article.categories?.map((category: any, idx: number) => (
              <span
                key={`category-${idx}`}
                className="text-xs font-medium text-muted px-3 py-1 rounded-full bg-neutral-800 capitalize"
              >
                {category.name}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white group-hover:text-neutral-300 transition-colors">
            {article.title}
          </h1>
          <p className="text-lg text-muted mb-6 leading-relaxed">
            {truncate(article.description, 200)}
          </p>
          <p className="text-sm text-muted">
            {article.publishedAt}
          </p>
        </div>
        <div className="order-1 lg:order-2">
          {article.image ? (
            <BlurImage
              src={getImageUrl(article.image.url)}
              alt={article.title}
              height="600"
              width="600"
              className="h-64 md:h-80 object-cover w-full rounded-2xl group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-64 md:h-80 bg-neutral-800 rounded-2xl flex items-center justify-center">
              <span className="text-muted">No image</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const CompactArticleCard = ({ article, locale }: { article: any, locale: string }) => {
  return (
    <Link
      className="block group border-b border-neutral-800 pb-6 hover:border-neutral-700 transition-colors"
      href={`/${locale}/resources/${article.slug}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="md:col-span-1">
          {article.image ? (
            <BlurImage
              src={getImageUrl(article.image.url)}
              alt={article.title}
              height="200"
              width="300"
              className="h-24 md:h-20 object-cover w-full rounded-lg group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-24 md:h-20 bg-neutral-800 rounded-lg flex items-center justify-center">
              <span className="text-xs text-muted">No image</span>
            </div>
          )}
        </div>
        <div className="md:col-span-3">
          <div className="flex gap-2 flex-wrap mb-2">
            {article.categories?.slice(0, 2).map((category: any, idx: number) => (
              <span
                key={`category-${idx}`}
                className="text-xs font-medium text-muted px-2 py-1 rounded bg-neutral-800 capitalize"
              >
                {category.name}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-neutral-300 transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted mb-2 leading-relaxed">
            {truncate(article.description, 120)}
          </p>
          <p className="text-xs text-muted">
            {article.publishedAt}
          </p>
        </div>
      </div>
    </Link>
  );
};