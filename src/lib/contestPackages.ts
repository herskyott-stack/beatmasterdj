// Full contest package catalog — mirrors PackagesPage.tsx so contestants can pick from every offering.
export type ContestPackage = {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  price: number;
  blurb: string;
};

export const CONTEST_PACKAGES: ContestPackage[] = [
  // Weddings
  { id: "weddings-essential",   category: "weddings",  categoryLabel: "Weddings",     name: "Essential",     price: 1800, blurb: "Intimate ceremonies · 4 hrs" },
  { id: "weddings-classic",     category: "weddings",  categoryLabel: "Weddings",     name: "Classic",       price: 2500, blurb: "Most popular · 6 hrs" },
  { id: "weddings-premium",     category: "weddings",  categoryLabel: "Weddings",     name: "Premium",       price: 3500, blurb: "Full-day · uplighting" },
  { id: "weddings-ultimate",    category: "weddings",  categoryLabel: "Weddings",     name: "Ultimate",      price: 5000, blurb: "Luxury · 10 hrs · live remixes" },
  // Corporate
  { id: "corporate-starter",    category: "corporate", categoryLabel: "Corporate",    name: "Starter",       price: 1800, blurb: "Small gatherings · 4 hrs" },
  { id: "corporate-professional", category: "corporate", categoryLabel: "Corporate", name: "Professional",  price: 2800, blurb: "Corporate celebrations · 6 hrs" },
  { id: "corporate-executive",  category: "corporate", categoryLabel: "Corporate",    name: "Executive",     price: 3500, blurb: "High-end · 8 hrs" },
  { id: "corporate-enterprise", category: "corporate", categoryLabel: "Corporate",    name: "Enterprise",    price: 5000, blurb: "Large-scale · full AV" },
  // Schools
  { id: "schools-basic",        category: "schools",   categoryLabel: "Schools",      name: "Basic",         price: 1200, blurb: "Dances · assemblies · 3 hrs" },
  { id: "schools-standard",     category: "schools",   categoryLabel: "Schools",      name: "Standard",      price: 1600, blurb: "Enhanced school events · 4 hrs" },
  { id: "schools-prom",         category: "schools",   categoryLabel: "Schools",      name: "Prom Package",  price: 2160, blurb: "Prom night · 5 hrs" },
  { id: "schools-homecoming",   category: "schools",   categoryLabel: "Schools",      name: "Homecoming",    price: 3000, blurb: "Ultimate homecoming · 6 hrs" },
  // Private
  { id: "private-party",        category: "private",   categoryLabel: "Private",      name: "Party Starter", price: 1500, blurb: "Birthdays · 3 hrs" },
  { id: "private-celebration",  category: "private",   categoryLabel: "Private",      name: "Celebration",   price: 1800, blurb: "Milestones · 4 hrs" },
  { id: "private-vip",          category: "private",   categoryLabel: "Private",      name: "VIP Party",     price: 2500, blurb: "Exclusive · 6 hrs" },
  { id: "private-extravaganza", category: "private",   categoryLabel: "Private",      name: "Extravaganza",  price: 4000, blurb: "Luxury · 8 hrs" },
  // EDM
  { id: "edm-club",             category: "edm",       categoryLabel: "EDM",          name: "Club Night",    price: 1500, blurb: "Club-style · 4 hrs" },
  { id: "edm-rave",             category: "edm",       categoryLabel: "EDM",          name: "Rave Ready",    price: 2500, blurb: "Festival energy · 6 hrs" },
  { id: "edm-festival",         category: "edm",       categoryLabel: "EDM",          name: "Festival",      price: 4000, blurb: "Full production · 8 hrs" },
  { id: "edm-ultra",            category: "edm",       categoryLabel: "EDM",          name: "Ultra",         price: 5000, blurb: "Stadium-grade · 10 hrs" },
  // Karaoke
  { id: "karaoke-basic",        category: "karaoke",   categoryLabel: "Karaoke",      name: "Basic",         price: 400,  blurb: "Small gatherings · 2 hrs" },
  { id: "karaoke-standard",     category: "karaoke",   categoryLabel: "Karaoke",      name: "Standard",      price: 600,  blurb: "Parties · 3 hrs" },
  { id: "karaoke-premium",      category: "karaoke",   categoryLabel: "Karaoke",      name: "Premium",       price: 850,  blurb: "Enhanced · 4 hrs" },
  { id: "karaoke-ultimate",     category: "karaoke",   categoryLabel: "Karaoke",      name: "Ultimate",      price: 1200, blurb: "Full production · 5 hrs" },
  // AV
  { id: "av-basic",             category: "av",        categoryLabel: "AV Production", name: "Basic AV",     price: 3625, blurb: "Essential AV" },
];

export const getPackageById = (id: string) =>
  CONTEST_PACKAGES.find((p) => p.id === id);
