export type Category = {
  slug: string;
  labelEn: string;
  labelBn: string;
  weight: number;
  /**
   * Path to a standalone SVG under public/images/icons/. A path rather than
   * inline markup so the icon is an asset a CMS can replace, not a string
   * buried in TypeScript that only a developer can change.
   */
  icon: string;
};

export const CATEGORIES: Category[] = [
  { slug: "kidney-basic", labelEn: "Kidney Basics", labelBn: "কিডনি বেসিক", weight: 1 , icon: "/images/icons/kidney-basic.svg" },
  { slug: "ckd", labelEn: "Chronic Kidney Disease (CKD)", labelBn: "ক্রনিক কিডনি ডিজিজ", weight: 2 , icon: "/images/icons/ckd.svg" },
  { slug: "aki", labelEn: "Acute Kidney Injury (AKI)", labelBn: "একিউট কিডনি ইনজুরি", weight: 3 , icon: "/images/icons/aki.svg" },
  { slug: "dialysis", labelEn: "Dialysis", labelBn: "ডায়ালাইসিস", weight: 4 , icon: "/images/icons/dialysis.svg" },
  { slug: "renal-transplantation", labelEn: "Renal Transplantation", labelBn: "রেনাল ট্রান্সপ্লান্টেশন", weight: 5 , icon: "/images/icons/renal-transplantation.svg" },
  { slug: "urology", labelEn: "Urology", labelBn: "ইউরোলজি", weight: 6 , icon: "/images/icons/urology.svg" },
  { slug: "paediatric-nephrology", labelEn: "Paediatric Nephrology", labelBn: "শিশু নেফ্রোলজি", weight: 7 , icon: "/images/icons/paediatric-nephrology.svg" },
  { slug: "renal-diet", labelEn: "Renal Diet", labelBn: "রেনাল ডায়েট", weight: 8 , icon: "/images/icons/renal-diet.svg" },
  { slug: "kidney-disease-and-pregnancy", labelEn: "Kidney Disease & Pregnancy", labelBn: "কিডনি রোগ ও গর্ভাবস্থা", weight: 9 , icon: "/images/icons/kidney-disease-and-pregnancy.svg" },
  { slug: "diabetes", labelEn: "Diabetes", labelBn: "ডায়াবেটিস", weight: 10 , icon: "/images/icons/diabetes.svg" },
  { slug: "others", labelEn: "Others", labelBn: "অন্যান্য", weight: 11 , icon: "/images/icons/others.svg" },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export type EmergencyCategory = {
  slug: string;
  labelEn: string;
  labelBn: string;
  /** Same contract as Category.icon — a path under public/images/icons/. */
  icon: string;
};

export const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  { slug: "nephrology-doctors", labelEn: "Nephrology Doctors", labelBn: "নেফ্রোলজি ডাক্তার" , icon: "/images/icons/nephrology-doctors.svg" },
  { slug: "vascular-surgeons", labelEn: "Vascular Surgeons", labelBn: "ভাস্কুলার সার্জন" , icon: "/images/icons/vascular-surgeons.svg" },
  { slug: "dialysis-centers", labelEn: "Dialysis Centers", labelBn: "ডায়ালাইসিস সেন্টার" , icon: "/images/icons/dialysis-centers.svg" },
  { slug: "blood-banks", labelEn: "Blood Banks", labelBn: "ব্লাড ব্যাংক" , icon: "/images/icons/blood-banks.svg" },
];
