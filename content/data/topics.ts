/**
 * Topic hubs: the largest tags, given an introduction and a suggested reading
 * order so their pages read as a guide to the subject rather than a bare
 * list. Every other tag page stays a plain listing.
 *
 * `start` lists article URLs (as in the content graph, no trailing slash) in
 * the order a newcomer should read them; each must carry the hub's tag. The
 * build fails on a URL that does not resolve, so a renamed article cannot
 * leave a dead link here.
 */
export interface Topic {
  /** Tag name exactly as used in frontmatter. */
  tag: string;
  /** Persian page title; falls back to the tag name. */
  title: string;
  intro: string;
  start: string[];
}

export const topics: Topic[] = [
  {
    tag: "ورودی",
    title: "راهنمای ورودی‌های مهندسی کامپیوتر شریف",
    intro:
      "راهنمای بایت برای ورودی‌های تازهٔ دانشکده‌ی مهندسی کامپیوتر دانشگاه صنعتی شریف؛ از خوش‌آمدگویی اساتید و حرف‌های سال‌بالایی‌ها تا معرفی گرایش‌ها، فعالیت دانشجویی، تی‌ای شدن، کارآموزی، کوآپ، اپلای و نوشتن رزومه.",
    start: [
      "/mags/00000111/professors-welcoming",
      "/mags/00000111/upperyear",
      "/mags/00000001/intro-to-fields",
      "/mags/00000111/student-activity",
      "/mags/00000111/sites-and-channels",
      "/mags/00000111/resume",
    ],
  },
  {
    tag: "AI",
    title: "هوش مصنوعی",
    intro:
      "مطالب بایت دربارهٔ هوش مصنوعی و یادگیری ماشین؛ از مبانی یادگیری ماشین، یادگیری فدرال و هوش مصنوعی توضیح‌پذیر تا اثر هوش مصنوعی بر کار مهندسان نرم‌افزار، آموزش آنلاین و جنگ.",
    start: [
      "/mags/00000111/fieldintro-ai",
      "/mags/00000100/yadgiri-machine",
      "/mags/00000100/negah-digari-baraye-yadgiri-az-dadeha",
      "/mags/00000001/xai",
      "/mags/00000110/federated-learning",
      "/mags/00000010/ai-software-eng",
    ],
  },
  {
    tag: "Internet",
    title: "اینترنت در ایران",
    intro:
      "پروندهٔ بایت دربارهٔ اینترنت در ایران؛ قطعی‌های سراسری و هزینه‌های اقتصادی و اجتماعی آن، فیلترینگ و فناوری‌های عبور از آن، ناشناس ماندن در وب و استارلینک.",
    start: [
      "/mags/00001000/Major-Outage",
      "/mags/00001000/the-great-outage",
      "/mags/00001000/Internet-is-a-fundamental-right",
      "/mags/00001000/how-to-stay-anonymous-on-the-internet",
      "/mags/00001000/engineering-for-censorship-resistance",
      "/mags/00001000/starlink",
    ],
  },
  {
    tag: "Career",
    title: "مسیر شغلی و تحصیلی",
    intro:
      "تجربه‌های دانشجویان و دانش‌آموختگان مهندسی کامپیوتر شریف از مسیرهای پس از دانشگاه: نوشتن رزومه، کارآموزی، کوآپ، ورود به صنعت، مسیر آکادمیک و اپلای.",
    start: [
      "/mags/00000010/first-resume",
      "/mags/00000111/resume",
      "/mags/00000111/internship",
      "/mags/00000111/coop-1",
      "/mags/00000111/work-industry",
      "/mags/00000111/academic-ce",
      "/mags/00000111/apply",
    ],
  },
  {
    tag: "Network",
    title: "شبکه‌های کامپیوتری",
    intro:
      "مطالب بایت دربارهٔ شبکه‌های کامپیوتری؛ از UDP Hole Punching، XDP و محاسبات لبه تا جعل موقعیت GPS، استارلینک و سازوکار قطعی و فیلترینگ اینترنت.",
    start: [
      "/mags/00000111/fieldintro-networks",
      "/mags/00000001/udp-holepuching",
      "/mags/00000110/xdp",
      "/mags/00000011/edge-computing",
      "/mags/00001000/rebellion-in-layer4",
    ],
  },
  {
    tag: "Security",
    title: "امنیت",
    intro:
      "مطالب بایت دربارهٔ امنیت؛ OSINT، احراز هویت دوعاملی با HOTP و TOTP، امنیت ثابت‌افزار، جعل موقعیت GPS، ناشناس ماندن در اینترنت و روایت پاک‌سازی یک بدافزار از سروری واقعی.",
    start: [
      "/mags/00000111/fieldintro-security",
      "/mags/00000001/osint",
      "/mags/00000010/timebased-otp",
      "/mags/00000010/firmware",
      "/mags/00001000/how-to-stay-anonymous-on-the-internet",
      "/mags/00001001/wss-zombie",
    ],
  },
  {
    tag: "Hardware",
    title: "سخت‌افزار و معماری کامپیوتر",
    intro:
      "مطالب بایت دربارهٔ سخت‌افزار و معماری کامپیوتر؛ از منطق کامل و حافظه‌های SSD تا بافر مقصد انشعاب، تاریخچهٔ معماری مجموعه‌دستورالعمل‌ها تا RISC-V، شمارنده‌های کارایی پردازنده و داستان احیای AMD.",
    start: [
      "/mags/00000111/fieldintro-hw",
      "/mags/00000010/complete-logic",
      "/mags/00001001/risc-v",
      "/mags/00000101/btb",
      "/mags/00001001/silicon-spies",
      "/mags/00000010/storages",
    ],
  },
];
