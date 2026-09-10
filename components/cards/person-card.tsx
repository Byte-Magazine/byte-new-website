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
  role?: string;
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
    <ul className={cn("flex items-center gap-1", className)}>
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
              title={label}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="size-[0.9rem]" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** Deterministic hue from a name, so an author without a photo still reads as an individual. */
function hueFor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

function Avatar({
  name,
  image,
  size = 56,
}: {
  name: string;
  image?: string;
  size?: number;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={size}
        height={size}
        unoptimized
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full border object-cover"
      />
    );
  }

  const hue = hueFor(name);
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        background: `linear-gradient(140deg, oklch(0.72 0.09 ${hue}), oklch(0.55 0.11 ${(hue + 40) % 360}))`,
      }}
      className="flex shrink-0 items-center justify-center rounded-full text-lg font-bold text-white/95"
    >
      {name.trim().slice(0, 1)}
    </span>
  );
}

/**
 * Person summary, laid out horizontally.
 *
 * A row reads better than a centred tile here: Persian names vary a lot in
 * length, and the row keeps the name, role, and contribution on a single
 * baseline instead of forcing ragged wrapping under a centred portrait.
 */
export function PersonCard({
  name,
  title,
  image,
  href,
  articleCount,
  role,
  socials,
  className,
}: PersonCardProps) {
  const meta = [title, role].filter(Boolean).join(" · ");

  const inner = (
    <>
      <Avatar name={name} image={image} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold leading-7">{name}</span>
        {meta ? (
          <span className="block truncate text-xs text-muted-foreground">
            {meta}
          </span>
        ) : null}
        {articleCount !== undefined && articleCount > 0 ? (
          <span className="mt-0.5 block text-xs text-accent">
            {toPersianDigits(articleCount)} مطلب
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-card p-3.5 transition-all duration-300",
        href && "hover:-translate-y-0.5 hover:border-accent hover:shadow-sm",
        className,
      )}
    >
      {href ? (
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-3">
          {inner}
        </Link>
      ) : (
        <span className="flex min-w-0 flex-1 items-center gap-3">{inner}</span>
      )}
      <SocialLinks socials={socials} className="shrink-0" />
    </div>
  );
}
