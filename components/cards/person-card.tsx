import Image from "next/image";
import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";

import { LinkedInIcon } from "@/components/icons/linkedin";

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
