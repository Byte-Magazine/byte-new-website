"use client";

import { useState } from "react";
import { Check, Rss } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Podcast apps subscribe by feed address, so this copies it rather than
 * opening the XML. `path` is resolved against the current origin.
 */
export function CopyFeedButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = new URL(path, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("آدرس فید RSS", url);
    }
  };

  return (
    <Button size="lg" variant="outline" onClick={copy}>
      {copied ? <Check className="size-4" /> : <Rss className="size-4" />}
      <span aria-live="polite">{copied ? "آدرس کپی شد" : "RSS"}</span>
    </Button>
  );
}
