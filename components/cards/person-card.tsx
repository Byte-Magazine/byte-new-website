import Image from "next/image";
import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";

import { toPersianDigits } from "@/lib/persian";
import { cn } from "@/lib/utils";

export interface PersonCardProps {
  name: string;
  title?: string;
  image?: string;
  href?: string;
  articleCount?: number;
  socials?: Record<string, string | undefined>;
  className?: string;
}

/** Simple Icons no longer ships a LinkedIn mark, so it is inlined here. */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const SOCIAL_ICONS = {
  github: { icon: SiGithub, label: "گیت‌هاب" },
  linkedin: { icon: LinkedInIcon, label: "لینکدین" },
  x: { icon: SiX, label: "ایکس" },
  website: { icon: Globe, label: "وب‌سایت" },
  email: { icon: Mail, label: "ایمیل" },
} as const;

export function SocialLinks({
  socials,
  className,
}: {
  socials?: Record<string, string | undefined>;
  className?: string;
}) {
  const entries = Object.entries(socials ?? {}).filter(
    (entry): entry is [keyof typeof SOCIAL_ICONS, string] =>
      Boolean(entry[1]) && entry[0] in SOCIAL_ICONS,
  );
  if (entries.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-2.5", className)}>
      {entries.map(([key, value]) => {
        const { icon: Icon, label } = SOCIAL_ICONS[key];
        const href = key === "email" ? `mailto:${value}` : value;
        return (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function PersonCard({
  name,
  title,
  image,
  href,
  articleCount,
  socials,
  className,
}: PersonCardProps) {
  const body = (
    <>
      <div className="relative mx-auto size-20 overflow-hidden rounded-full border bg-muted">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            unoptimized
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-xl text-muted-foreground/50">
            {name.slice(0, 1)}
          </span>
        )}
      </div>

      <p className="mt-3 font-bold leading-7">{name}</p>
      {title ? (
        <p className="text-xs text-muted-foreground">{title}</p>
      ) : null}
      {articleCount !== undefined && articleCount > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          {toPersianDigits(articleCount)} مطلب
        </p>
      ) : null}
    </>
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border bg-card p-5 text-center transition-colors",
        href && "hover:border-accent",
        className,
      )}
    >
      {href ? (
        <Link href={href} className="flex flex-col items-center">
          {body}
        </Link>
      ) : (
        body
      )}
      <SocialLinks socials={socials} className="mt-3" />
    </div>
  );
}
