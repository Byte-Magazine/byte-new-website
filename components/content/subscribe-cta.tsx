import { Rss, Send } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { FEED_PATH, SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * End-of-article invitation to follow Byte. Telegram is where Iranian
 * readers follow publications, so it leads; RSS is offered for the rest.
 * Plain links only: nothing is collected on this site.
 */
export function SubscribeCta({ className }: { className?: string }) {
  return (
    <aside
      data-iv="ignore"
      aria-labelledby="subscribe-title"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-issue/40 bg-issue/5 p-5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <h2 id="subscribe-title" className="text-base font-bold">
          شماره‌ی بعدی بایت را از دست ندهید
        </h2>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          انتشار شماره‌های تازه و مطالب منتخب را در کانال تلگرام بایت اعلام
          می‌کنیم.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <a
          href={SITE.socials.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants()}
        >
          <Send aria-hidden />
          عضویت در کانال
        </a>
        <a
          href={FEED_PATH}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
          aria-label="خوراک RSS"
          title="خوراک RSS"
        >
          <Rss aria-hidden />
        </a>
      </div>
    </aside>
  );
}
