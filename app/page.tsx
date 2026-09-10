import { FeaturedArticles } from "@/components/sections/featured-articles";
import { Hero } from "@/components/sections/hero";
import { IssueWall } from "@/components/sections/issue-wall";
import { LatestIssue } from "@/components/sections/latest-issue";
import { StaffStrip } from "@/components/sections/staff-strip";
import { Stats } from "@/components/sections/stats";
import { WorkshopsTeaser } from "@/components/sections/workshops-teaser";
import {
  getAllArticles,
  getAllAuthors,
  getAllIssues,
  getAllWorkshops,
  getLatestIssue,
  getStats,
} from "@/lib/content";

export default function HomePage() {
  const latest = getLatestIssue();
  const stats = getStats();
  const issues = getAllIssues();
  const featured = getAllArticles().slice(0, 6);
  const authors = getAllAuthors().filter((a) => a.articleCount > 0);

  return (
    <>
      <Hero latest={latest} />
      {latest ? <LatestIssue issue={latest} /> : null}
      <Stats stats={stats} />
      <FeaturedArticles articles={featured} />
      <IssueWall issues={issues} />
      <WorkshopsTeaser workshops={getAllWorkshops()} />
      <StaffStrip
        authors={authors.slice(0, 18)}
        totalAuthors={authors.length}
      />
    </>
  );
}
