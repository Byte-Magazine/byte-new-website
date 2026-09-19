import type { AuthorRecord } from "@/lib/content/schema";

/**
 * People with a `/authors/[id]` profile — writers and staff.
 * Referenced by `id` from article frontmatter and staff `authorId`.
 * Staff roster order lives in `staff.ts`; profile fields live here.
 * Article counts are derived at build time, never stored here.
 */
export const AUTHORS: AuthorRecord[] = [
  {
    id: "AHMZ",
    name: "امیرحسین محمدزاده",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/staff/AmirHosseinMohammadZadeh.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/ahmz1833",
      github: "https://github.com/ahmz1833",
    },
  },
  {
    id: "aj",
    name: "حسین زاهدی ادیب",
    title: "کارشناسی ۱۴۰۳",
    image: "/img/staff/aj.jpg",
    socials: {},
  },
  {
    id: "aidaJabbari",
    name: "آیدا جباری",
    title: "کارشناسی ۱۴۰۳ مهندسی شیمی اراک",
    image: "/img/authors/aidaJabbari.png",
    socials: {},
  },
  {
    id: "AliAlmasi",
    name: "علی الماسی",
    title: "کارشناسی ۱۴۰۳",
    image: "/img/authors/alialmasi.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/ali-almasi-9277a5385/",
      github: "https://github.com/AliAlmasiZ",
    },
  },
  {
    id: "aliGhamari",
    name: "علی قمری",
    title: "کارشناسی ۱۴۰۳ مهندسی شیمی اراک",
    image: "/img/authors/aliGhamari.png",
    socials: {},
  },
  {
    id: "AliMoghadasi",
    name: "علی مقدسی",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/authors/aliMoghadasi.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/ali-moghadasi",
      github: "https://github.com/ali0083moi",
    },
  },
  {
    id: "Alinejad",
    name: "مهدی علی‌نژاد",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/staff/MahdiAlinejhad.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/mahdi-alinejad-ba97b6256",
      github: "https://github.com/soilorian",
    },
  },
  {
    id: "AlirezaTofighi",
    name: "علیرضا توفیقی",
    title: "کارشناسی علوم‌ کامپیوتر ۱۳۹۶",
    image: "/img/authors/AlirezaTofighi.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/atofighi",
    },
  },
  {
    id: "AmirHosseinAnsari",
    name: "امیرحسین انصاری",
    title: "کارشناسی ارشد ۱۴۰۱",
    image: "/img/authors/AmirHosseinAnsari.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/amir-hossein-ansari-b4bba5241",
    },
  },
  {
    id: "AmirHosseinHasanZadeh",
    name: "امیرحسین حسن‌زاده",
    title: '" "',
    image: "/img/authors/noone.svg",
    socials: {},
  },
  {
    id: "AmirHosseinRavanNakhjavani",
    name: "امیرحسین روان‌نخجوانی",
    title: "کارشناسی ۱۴۰۰",
    image: "/img/authors/amirhosseinravan.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/amir-ravan",
    },
  },
  {
    id: "AmirHosseinRazlighi",
    name: "امیرحسین رازلیقی",
    title: "کارشناسی ۱۳۹۹",
    image: "/img/authors/AmirHosseinRazlighi.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/amirhossein-razlighi",
      github: "https://github.com/amirhossein-razlighi",
    },
  },
  {
    id: "AmirHosseinShahidi",
    name: "امیرحسین شهیدی",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/staff/ahsh.jpg",
    socials: {},
  },
  {
    id: "AmirHosseinShayan",
    name: "امیرحسین شایان",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/staff/AmirHosseinShayan.jpg",
    socials: {},
  },
  {
    id: "AmirHosseinSouri",
    name: "امیرحسین صوری",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/staff/AmirHosseinSouri.jpg",
    socials: {
      github: "https://github.com/Amir14Souri",
      linkedin: "https://www.linkedin.com/in/amirhossein-souri",
    },
  },
  {
    id: "AmirMahdiHedayati",
    name: "امیرمهدی هدایتی‌پور",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/authors/amirmahdiHedayatiPour.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/amirmahdi-hedayatipoor-129519349",
    },
  },
  {
    id: "AmirmahdiNamjoo",
    name: "امیرمهدی نامجو",
    title: "کارشناسی ۱۳۹۷",
    image: "/img/staff/AmirMahdiNamjoo.jpg",
    socials: {
      github: "https://github.com/titansarus",
      linkedin: "https://www.linkedin.com/in/amirmahdi-namjoo-23b4b9192",
      website: "https://amirmahdinamjoo.com/",
    },
  },
  {
    id: "AmirrezaInanloo",
    name: "امیررضا اینانلو",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/staff/AmirrezaInanloo.jpg",
    socials: {
      github: "https://github.com/oAmirrezao",
      linkedin: "https://www.linkedin.com/in/amirreza-inanloo-00576425b",
    },
  },
  {
    id: "AmirrezaJafari",
    name: "امیررضا جعفری",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/staff/jafar.png",
    socials: {},
  },
  {
    id: "Amnam",
    name: "Amnam",
    title: "کارشناسی ۱۴XX",
    image: "/img/authors/amnam.png",
    socials: {},
  },
  {
    id: "Amshz",
    name: "امیرمحمد شاهرضایی",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/amshz.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/amshz",
    },
  },
  {
    id: "ArashMarioriyad",
    name: "آرش ماری‌اوریاد",
    title: "کارشناسی ارشد ۱۴۰۱",
    image: "/img/authors/arashmarioriyad.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/arash-mari-oriyad",
    },
  },
  {
    id: "ArashShahhosseini",
    name: "آرش شاه‌حسینی",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/authors/ArashShahhosseini.png",
    socials: {
      github: "https://github.com/arashShahhoseini",
    },
  },
  {
    id: "arefshahbakhsh",
    name: "عارف شه‌بخش",
    title: "کارشناسی ارشد ۱٤۰۰",
    image: "/img/authors/arefshahbakhsh.png",
    socials: {},
  },
  {
    id: "ArefZareZadeh",
    name: "عارف زارع‌زاده",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/arefZarezadeh.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/arefzarezadeh",
    },
  },
  {
    id: "ArmanTahmasebi",
    name: "آرمان طهماسبی‌زاده",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/staff/ArmanTahmasbi.jpg",
    socials: {
      github: "https://github.com/OstadTahmasb",
      linkedin: "https://www.linkedin.com/in/ostadtahmasb",
    },
  },
  {
    id: "ArshiaAkhavan",
    name: "عرشیا اخوان",
    title: "کارشناسی ۱۳۹۷",
    image: "/img/authors/arshiaakhavan.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/arshia-akhavan",
      github: "https://github.com/ArshiAAkhavan",
    },
  },
  {
    id: "ArvinBaghal",
    name: "آروین بقال اصل",
    title: "کارشناسی ۱۴۰۳",
    image: "/img/staff/baghal.png",
    socials: {
      github: "https://github.com/arvinasli",
      linkedin: "https://www.linkedin.com/in/arvin-baghal-asl",
    },
  },
  {
    id: "ArashYadegari",
    name: "آرش یادگاری",
    title: "کارشناسی ۱۳۹۹",
    image: "/img/authors/ArashYadegari.png",
    socials: {},
  },
  {
    id: "ArvinTaheri",
    name: "آروین طاهری",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/authors/ArvinTaheri.png",
    socials: {},
  },
  {
    id: "AsalMeskin",
    name: "عسل مسکین",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/asalmeskin.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/asal-meskin-2144a025b",
    },
  },
  {
    id: "AynazRahmani",
    name: "آیناز رحمانی",
    title: "کارشناسی ۱۴۰۳",
    image: "/img/authors/aynazrahmani.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/aynaz-rahmani",
    },
  },
  {
    id: "BaharDibaeinia",
    name: "بهار دیبایی‌نیا",
    title: '" "',
    image: "/img/authors/noone.svg",
    socials: {},
  },
  {
    id: "BardiaRezaei",
    name: "بردیا رضایی کلانتری",
    title: "کارشناسی ۱۳۹۹",
    image: "/img/authors/BardiaRezaei.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/bardia-rezaei-kalantari-0a0921219",
    },
  },
  {
    id: "dutchman",
    name: "امیرمهدی کوششی",
    title: "کارشناسی ۱۳۹۸",
    image: "/img/authors/dutchman.png",
    socials: {
      github: "https://github.com/amkamir82",
      linkedin: "https://www.linkedin.com/in/amirmahdi-kousheshi-344326166",
    },
  },
  {
    id: "EmadEmamJome",
    name: "عماد امام‌ جمعه",
    title: "کارشناسی ۱۴۰۰",
    image: "/img/authors/EmadEmamJome.png",
    socials: {
      github: "https://github.com/EmadEJ",
      linkedin: "https://www.linkedin.com/in/emad-emamjomeh",
    },
  },
  {
    id: "ErfanAsadi",
    name: "مرحوم عرفان اسدی",
    title: "کارشناسی ۱۳۹۹",
    image: "/img/authors/ErfanAsadi.jpg",
    socials: {},
  },
  {
    id: "FarzamKoohi",
    name: "فرزام کوهی",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/farzamKoohi.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/farzam-koohi",
    },
  },
  {
    id: "FatemeHarirforoush",
    name: "فاطمه حریرفروش",
    title: '" "',
    image: "/img/authors/noone.svg",
    socials: {},
  },
  {
    id: "FatemehNilforoushan",
    name: "فاطمه نیلفروشان",
    title: "کارشناسی ۱۴۰۳",
    image: "/img/authors/fatemehnilforoushan.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/fatemeh-nilforoushan-903620325",
    },
  },
  {
    id: "HirbodBehnam",
    name: "هیربد بهنام",
    title: "کارشناسی ۱۳۹۹",
    image: "/img/authors/hirbodbehnam.jpg",
    socials: {
      github: "https://github.com/hirbodbehnam",
      linkedin: "https://www.linkedin.com/in/hirbod-behnam-155a84206",
    },
  },
  {
    id: "HosseinGoli",
    name: "حسین گلی",
    title: "کارشناسی ۱۳۹۹",
    image: "/img/authors/HosseinGoli.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/hosseingoli",
      github: "https://github.com/hgoli02",
    },
  },
  {
    id: "ImanMohammadi",
    name: "ایمان محمدی",
    title: "کارشناسی ۱۳۹۹",
    image: "/img/authors/imanmohammadi.jpg",
    socials: {},
  },
  {
    id: "LeilaSadatAlavi",
    name: "لیلا سادات علوی",
    title: "کارشناسی ارشد نرم‌افزار ۱۴۰۱",
    image: "/img/authors/LeilaSadatAlavi.png",
    socials: {},
  },
  {
    id: "MaedehHeydari",
    name: "مائده حیدری",
    title: "کارشناسی ۱۴۰۰",
    image: "/img/authors/maedehheydari.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/maedeh-heydari-b84613232",
    },
  },
  {
    id: "MahdiBahramian",
    name: "مهدی بهرامیان",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/MahdiBahramian.jpg",
    socials: {
      github: "https://github.com/MahdiGMK",
    },
  },
  {
    id: "MahdiBahreyni",
    name: "مهدی بحرینی",
    title: "دکترا ۱۴۰۱",
    image: "/img/authors/MahdiBahreyni.png",
    socials: {},
  },
  {
    id: "MahdiLotfian",
    name: "مهدی لطفیان",
    title: "کارشناسی ۱۳۹۹",
    image: "/img/authors/mahdilotfian.png",
    socials: {},
  },
  {
    id: "MahdiMohammadi",
    name: "مهدی محمدی",
    title: "کارشناسی ۱۴۰۰",
    image: "/img/authors/mahdimohammadi.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/mahdi-mohammadi-766262260",
    },
  },
  {
    id: "MahdiSamiei",
    name: "محمد مهدی سمیعی",
    title: "کارشناسی ۱۳۹۳",
    image: "/img/authors/MahdiSamiei.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/mmsamiei",
    },
  },
  {
    id: "MahdiShahmoradi",
    name: "مهدی شاه‌مرادی",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/MahdiShahmoradi.png",
    socials: {},
  },
  {
    id: "MahdyarMostashar",
    name: "مهدیار مستشار",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/authors/mahmostashar.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/mahdyar-mostashar-279aaa287",
      github: "https://github.com/MahMosTash",
    },
  },
  {
    id: "MatinGhiasi",
    name: "متین غیاثی",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/authors/MatinGhiasi.png",
    socials: {},
  },
  {
    id: "mehrab",
    name: "محراب مرادزاده",
    title: "کارشناسی ارشد ۱۴۰۱",
    image: "/img/authors/mehrab.png",
    socials: {},
  },
  {
    id: "MHasanBayatiani",
    name: "محمدحسن بیاتیانی",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/mhasanbayatiani.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/mowhby",
    },
  },
  {
    id: "MHEslami",
    name: "محمدحسین اسلامی",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/mheslami.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/mohammad-hossein-eslami-152586330",
      github: "https://github.com/Mohammad-Hossein-Eslami",
    },
  },
  {
    id: "MobinRavan",
    name: "مبین روان‌نخجوانی",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/authors/noone.svg",
    socials: {},
  },
  {
    id: "Moeein",
    name: "معین آعلی",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/staff/moeein.jpg",
    socials: {
      website: "https://moeein.me",
      github: "https://github.com/moeeinaali",
      linkedin: "https://www.linkedin.com/in/moeein",
    },
  },
  {
    id: "MohammadAminAbbasfar",
    name: "محمدامین عباسفر",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/maminabbasfar.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/abbasfar",
    },
  },
  {
    id: "MohammadMosayebi",
    name: "محمد مصیبی",
    title: "کارشناسی ۱۳۹۹",
    image: "/img/authors/MohammadMosayebi.png",
    socials: {},
  },
  {
    id: "MohammadParsaArani",
    name: "محمدپارسا آرانی",
    title: "کارشناسی ۱۴۰۳",
    image: "/img/staff/arani.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/mohammad-parsa-arani-397072382",
      github: "https://github.com/MParsa-0684",
    },
  },
  {
    id: "MohsenPiri",
    name: "محسن پیری",
    title: "کارشناسی ارشد ۱۴۰۳",
    image: "/img/authors/mohsenpiri.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/mohsen-piri",
    },
  },
  {
    id: "NimaShirzadi",
    name: "نیما شیرزادی",
    title: "کارشناسی ارشد ۱۴۰۱",
    image: "/img/authors/NimaShirzadi.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/shirzady",
      github: "https://github.com/shirzady1934",
    },
  },
  {
    id: "NargesKari",
    name: "نرگس کاری",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/staff/nargesKari.jpg",
    socials: {
      linkedin: "https://www.linkedin.com/in/narges-kari-dolatabadi-a30348291",
      github: "https://github.com/NargesKari",
    },
  },
  {
    id: "OmidHeydari",
    name: "امید حیدری",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/staff/omidheidari.jpg",
    socials: {
      github: "https://github.com/omid-hdr",
      linkedin: "https://www.linkedin.com/in/omid-hdr",
    },
  },
  {
    id: "ParisaJalali",
    name: "پریسا جلالی",
    title: "کارشناسی ۱۴۰۳",
    image: "/img/authors/parisajalali.png",
    socials: {},
  },
  {
    id: "Rajabi",
    name: "محمدمهدی رجبی",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/authors/rajabi.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/rajabi-m",
    },
  },
  {
    id: "RomanRodomansky",
    name: "Roman Rodomansky",
    title: "هم‌بنیان‌گذار Relabs",
    image: "/img/authors/RomanRodomansky.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/rodomansky",
    },
  },
  {
    id: "SaeidForatiK",
    name: "سعید فراتی کاشانی",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/SaeidForatiK.png",
    socials: {
      github: "https://github.com/foratik",
      linkedin: "https://www.linkedin.com/in/saeed-foratikashani",
    },
  },
  {
    id: "SAhmadMousaviAvval",
    name: "سیداحمد موسوی‌اول",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/authors/sahmadmousaviaval.png",
    socials: {
      github: "https://github.com/seyedahmadmosaviawal",
    },
  },
  {
    id: "SaminAkbari",
    name: "ثمین اکبری",
    title: "کارشناسی ۱۴۰۱",
    image: "/img/authors/saminakbari.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/samin-akbari-83583a312",
    },
  },
  {
    id: "saraYounesi",
    name: "سارا یونسی",
    title: "کارشناسی ارشد ۱۴۰۳",
    image: "/img/authors/saraYounesi.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/sara-younesi-660a79220",
      github: "https://github.com/Sarayounesi",
    },
  },
  {
    id: "SohaibSadeqi",
    name: "صهیب صادقی",
    title: "کارشناسی ۱۴۰۲",
    image: "/img/staff/SohaibSadeqi.jpg",
    socials: {
      github: "https://github.com/sohaib-sadeqi",
    },
  },
  {
    id: "SorenaKia",
    name: "سورنا کیا",
    title: "کارشناسی ۱۴۰۳",
    image: "/img/authors/SorenaKia.png",
    socials: {},
  },
  {
    id: "SParsaNeshaei",
    name: "سید پارسا نشایی",
    title: "کارشناسی ۱۳۹۸",
    image: "/img/authors/SParsaNeshaei.jpg",
    socials: {
      github: "https://github.com/spneshaei",
      linkedin: "https://www.linkedin.com/in/spneshaei",
    },
  },
  {
    id: "SteveFeldstein",
    name: "Steve Feldstein",
    title: "Carnegie Endowment for International Peace",
    image: "/img/authors/SteveFeldstein.png",
    socials: {},
  },
  {
    id: "YasaminBakooei",
    name: "شهید یاسمین باکویی",
    title: "کارشناسی ارشد معماری کامپیوتر ۱۴۰۲",
    image: "/img/authors/YasaminBakooei.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/yasaminbakouee",
    },
  },
  {
    id: "YazdanBahadori",
    name: "یزدان  بهادری‌منش",
    title: "کارشناسی ۱۴۰۰ مهندسی کامپیوتر خوارزمی",
    image: "/img/authors/yazdanBahadori.png",
    socials: {
      linkedin: "https://www.linkedin.com/in/yazdanbahadori",
      github: "https://github.com/yazdanbhd",
    },
  },
];
