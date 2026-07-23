// Minimal package catalog for the contest entry form.
// Kept flat so it's independent from the full packages page.
// NOTE: This contest is for DJ packages only; AV/production packages are excluded.
export type ContestPackage = {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  price: number;
  blurb: string;
};

export const CONTEST_PACKAGES: ContestPackage[] = [
  { id: "weddings-essential",  category: "weddings",  categoryLabel: "Wedding DJ",        name: "Essential",   price: 1800, blurb: "Intimate ceremonies · 4 hrs" },
  { id: "weddings-classic",    category: "weddings",  categoryLabel: "Wedding DJ",        name: "Classic",     price: 2500, blurb: "Most popular · 6 hrs + lighting" },
  { id: "weddings-premium",    category: "weddings",  categoryLabel: "Wedding DJ",        name: "Premium",     price: 3500, blurb: "Full-day · uplighting + effects" },
  { id: "corporate-standard",  category: "corporate", categoryLabel: "Corporate DJ",      name: "Standard",    price: 2200, blurb: "Galas · conferences" },
  { id: "schools-basic",       category: "schools",   categoryLabel: "School DJ",         name: "Basic",       price: 1200, blurb: "School dances · assemblies" },
  { id: "schools-standard",    category: "schools",   categoryLabel: "School DJ",         name: "Standard",    price: 1600, blurb: "Proms · larger events" },
  { id: "private-party",       category: "private",   categoryLabel: "Private DJ",        name: "Party Starter", price: 1500, blurb: "Birthdays · anniversaries" },
  { id: "private-celebration", category: "private",   categoryLabel: "Private DJ",        name: "Celebration",   price: 1800, blurb: "Full-service private event" },
];

export const getPackageById = (id: string) =>
  CONTEST_PACKAGES.find((p) => p.id === id);
