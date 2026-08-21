export type HeroSettings = {
  welcome: string;
  schoolName: string;
  tagline: string;
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  imageUrl?: string | null;
  imageHeight: string;
  imageObjectFit: "cover" | "contain";
  imageObjectPosition: string;
};

export type SiteSettings = {
  hero: HeroSettings;
  about: {
    description: string;
    vision: string;
    mission: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    footerTagline: string;
  };
  registration: {
    showNotes: boolean;
    showBirthDate: boolean;
  };
  programs?: Array<{ grade: string; description: string }>;
};

export const HERO_HEIGHT_OPTIONS = [
  { value: "100dvh", label: "كامل الشاشة (100dvh)" },
  { value: "90vh", label: "90% من الشاشة" },
  { value: "80vh", label: "80% من الشاشة" },
  { value: "700px", label: "700 بكسل" },
  { value: "600px", label: "600 بكسل" },
  { value: "500px", label: "500 بكسل" },
];

export const HERO_POSITION_OPTIONS = [
  { value: "center top", label: "أعلى الوسط" },
  { value: "center center", label: "الوسط" },
  { value: "center bottom", label: "أسفل الوسط" },
  { value: "right top", label: "أعلى اليمين" },
  { value: "left top", label: "أعلى اليسار" },
  { value: "right center", label: "يمين الوسط" },
  { value: "left center", label: "يسار الوسط" },
];

export function normalizeSiteSettings(raw: SiteSettings): SiteSettings {
  return {
    ...raw,
    hero: {
      ...raw.hero,
      imageHeight: raw.hero?.imageHeight || "100dvh",
      imageObjectFit: raw.hero?.imageObjectFit || "cover",
      imageObjectPosition: raw.hero?.imageObjectPosition || "center top",
    },
  };
}
