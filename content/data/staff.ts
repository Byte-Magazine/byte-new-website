import type { StaffSection } from "@/lib/content/schema";

/**
 * Editorial staff roster — section order and membership only.
 * Profile fields (name, title, image, socials) live in `authors.ts`
 * and are resolved via `authorId`.
 */
export const STAFF_SECTIONS: StaffSection[] = [
  {
    name: "مدیر مسئول و سردبیر",
    members: [
      { authorId: "AmirHosseinShahidi" },
      { authorId: "ArashShahhosseini" },
    ],
  },
  {
    name: "تحریریه",
    members: [
      { authorId: "ArmanTahmasebi" },
      { authorId: "Alinejad" },
      // { authorId: "ArvinTaheri" },
      { authorId: "AHMZ" },
      { authorId: "AmirHosseinShayan" },
      { authorId: "ArvinBaghal" },
      { authorId: "SorenaKia" },
    ],
  },
  {
    name: "ویراستاری ادبی",
    members: [
      { authorId: "AmirHosseinSouri" },
      { authorId: "AmirmahdiNamjoo" },
      // { authorId: "MatinGhiasi" },
      { authorId: "SohaibSadeqi" },
    ],
  },
  {
    name: "صفحه‌آرایی و گرافیک",
    members: [
      { authorId: "AmirrezaInanloo" },
      // { authorId: "SAhmadMousaviAvval" },
      { authorId: "FatemehNilforoushan" },
      { authorId: "NargesKari" },
      { authorId: "AmirrezaJafari" },
      { authorId: "MohammadParsaArani" },
    ],
  },
  {
    name: "ارتباط با صنعت",
    members: [{ authorId: "OmidHeydari" }],
  },
  {
    name: "فنی",
    members: [{ authorId: "Moeein" }, { authorId: "aj" }],
  },
];
