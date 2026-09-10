import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ALL_NAV_ITEMS } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center">
      <p
        className="font-mono text-5xl font-black tracking-[0.2em] text-muted-foreground/40"
        dir="ltr"
      >
        01000100
      </p>
      <h1 className="mt-8 text-3xl font-black">این صفحه پیدا نشد</h1>
      <p className="mt-4 leading-9 text-muted-foreground">
        شاید نشانی تغییر کرده باشد. از آرشیو یا فهرست مقاله‌ها ادامه دهید.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button render={<Link href="/mags/intro">آرشیو بایت</Link>} />
        <Button
          variant="outline"
          render={<Link href="/articles">مقاله‌ها</Link>}
        />
      </div>

      <nav className="mt-12 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
        {ALL_NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
