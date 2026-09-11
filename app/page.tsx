import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { VelocityDivider } from "@/components/motion/velocity-divider";
import { BlogTeaser } from "@/components/sections/blog-teaser";
import { Contributors } from "@/components/sections/contributors";
import { FeaturedArticles } from "@/components/sections/featured-articles";
import { Hero } from "@/components/sections/hero";
import { IssueWall } from "@/components/sections/issue-wall";
import { Stats } from "@/components/sections/stats";
import { Topics } from "@/components/sections/topics";
import { WorkshopsTeaser } from "@/components/sections/workshops-teaser";
import {
  getAllArticles,
  getAllAuthors,
  getAllBlogPosts,
  getAllIssues,
  getAllTags,
  getAllWorkshops,
  getLatestIssue,
  getStats,
} from "@/lib/content";

export default function HomePage() {
  const latest = getLatestIssue();
  const authors = getAllAuthors().filter((author) => author.articleCount > 0);

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <Hero latest={latest} />
      <Stats stats={getStats()} />
      <FeaturedArticles articles={getAllArticles().slice(0, 6)} />
      <VelocityDivider />
      <IssueWall issues={getAllIssues()} />
      <Topics tags={getAllTags().slice(0, 28)} />
      <BlogTeaser posts={getAllBlogPosts().slice(0, 2)} />
      <VelocityDivider />
      <Contributors authors={authors.slice(0, 24)} totalAuthors={authors.length} />
      <WorkshopsTeaser workshops={getAllWorkshops()} />
    </>
  );
}
