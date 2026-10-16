import { describe, expect, it } from "vitest";

import {
  durationLabel,
  episodeCode,
  episodeLabel,
  isoDuration,
  ordinalFa,
} from "./labels";

describe("episode labels", () => {
  it("spells ordinals in Persian", () => {
    expect(ordinalFa(1)).toBe("اول");
    expect(ordinalFa(2)).toBe("دوم");
    expect(ordinalFa(10)).toBe("دهم");
    expect(ordinalFa(27)).toBe("۲۷ام");
  });

  it("labels an episode", () => {
    expect(episodeLabel(1)).toBe("قسمت اول");
    expect(episodeLabel(30)).toBe("قسمت ۳۰ام");
  });

  it("writes the episode number in 8-bit binary, like the issues", () => {
    expect(episodeCode(1)).toBe("EP.00000001");
    expect(episodeCode(10)).toBe("EP.00001010");
  });

  it("rounds the duration to whole minutes", () => {
    expect(durationLabel(1300.64)).toBe("۲۲ دقیقه");
    expect(durationLabel(40)).toBe("۱ دقیقه");
    expect(durationLabel(3900)).toBe("۱ ساعت و ۵ دقیقه");
  });

  it("formats an ISO 8601 duration for structured data", () => {
    expect(isoDuration(1300.64)).toBe("PT21M41S");
    expect(isoDuration(3725)).toBe("PT1H2M5S");
  });
});
