import { Sparkles, Camera, Clock, Mic, Wind, Plus, type LucideIcon } from "lucide-react";

import coldSparklers from "@/assets/addons/cold-sparklers.jpg";
import photoBooth from "@/assets/addons/photo-booth.jpg";
import karaoke from "@/assets/addons/karaoke.jpg";
import dryIce from "@/assets/addons/dry-ice.jpg";
import extraHours from "@/assets/addons/extra-hours.jpg";

export type Addon = {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  shortDescription: string;
  longDescription: string;
  whatsIncluded: string[];
  perfectFor: string[];
  technicalDetails: string[];
  faq: { q: string; a: string }[];
  image: string | null;
  icon: LucideIcon;
  popular: boolean;
  /** When true, "Learn More" routes to /contact instead of a detail page */
  customQuoteOnly?: boolean;
};

export const addons: Addon[] = [
  {
    id: "cold-sparklers",
    name: "Cold Sparklers",
    price: 300,
    priceDisplay: "$300",
    shortDescription:
      "Stunning indoor-safe sparkler fountains for grand entrances, first dances, or finale moments.",
    longDescription:
      "Cold sparklers (also called cold pyro or cold fireworks) create dramatic 8–15 foot fountains of golden sparks that are completely safe for indoor use. Unlike traditional fireworks, the sparks are cool to the touch within inches, smokeless, and odorless — making them perfect for venues with low ceilings, fire codes, or insurance restrictions. The visual impact is unforgettable: imagine your first dance, grand entrance, or cake cutting framed by a curtain of glittering sparks.",
    whatsIncluded: [
      "2 cold spark machines (4 by request)",
      "60–90 seconds of total spark time per machine",
      "Wireless DMX trigger synced to your music cue",
      "Certified operator on-site",
      "Setup, teardown, and cleanup",
      "Liability coverage included",
    ],
    perfectFor: [
      "First dance moments",
      "Grand entrances & introductions",
      "Cake cutting",
      "Bouquet toss finale",
      "Birthday cake reveals",
      "New Year's countdown",
    ],
    technicalDetails: [
      "8 ft minimum ceiling clearance (12 ft recommended)",
      "Zero open flame, zero smoke, indoor-safe",
      "Standard 110V wall power required",
      "Pre-event venue clearance recommended",
      "Operator arrives 60 minutes early for setup",
    ],
    faq: [
      {
        q: "Is it really safe indoors?",
        a: "Yes. The granular metal compound combusts at low temperature — sparks are cool to the touch within 6 inches of the fountain. Approved for use in hotels, ballrooms, and most banquet halls.",
      },
      {
        q: "Will the venue allow it?",
        a: "Most do, but always confirm with your venue first. We can send a spec sheet to your coordinator. A handful of venues require advance notice or a dedicated fire-watch.",
      },
      {
        q: "How long do they last?",
        a: "Each fountain runs ~30 seconds. We typically program two synchronized fountains for a 30-second showpiece moment that times perfectly to a song drop.",
      },
    ],
    image: coldSparklers,
    icon: Sparkles,
    popular: true,
  },
  {
    id: "photo-booth-basic",
    name: "Photo Booth (No Prints)",
    price: 750,
    priceDisplay: "$750",
    shortDescription:
      "Premium photo booth with props and custom backdrops. Digital copies only.",
    longDescription:
      "Our digital photo booth is the perfect way to give your guests a fun keepsake without the cost of unlimited prints. Guests step up, strike a pose, and instantly receive their photos via text or email — plus you get the full gallery delivered after the event. The booth uses a DSLR camera with studio lighting for genuinely sharp, social-ready images, not the grainy phone-camera quality of cheaper rentals.",
    whatsIncluded: [
      "4 hours of unlimited photo sessions",
      "DSLR camera with professional lighting",
      "Choice of backdrop (3+ options)",
      "Premium prop box (hats, signs, glasses, boas)",
      "Instant text/email delivery to guests",
      "Full digital gallery delivered post-event",
      "On-site attendant",
    ],
    perfectFor: [
      "Weddings on a budget",
      "Corporate events with social sharing",
      "Birthday parties",
      "Holiday parties",
      "Brand activations",
    ],
    technicalDetails: [
      "10 ft × 10 ft floor space required",
      "Standard wall outlet",
      "30-minute setup window",
      "Wi-Fi recommended for instant sharing",
    ],
    faq: [
      {
        q: "How is this different from the print package?",
        a: "Same hardware, same camera, same attendant, same 4-hour run time — guests just get digital copies instead of physical strips. You save $150 if you don't need printed keepsakes.",
      },
      {
        q: "Can guests post directly to social?",
        a: "Yes. The instant share screen lets them text, email, or post directly to Instagram and Facebook from the booth.",
      },
    ],
    image: photoBooth,
    icon: Camera,
    popular: false,
  },
  {
    id: "photo-booth-prints",
    name: "Photo Booth (Unlimited Prints)",
    price: 900,
    priceDisplay: "$900",
    shortDescription:
      "Premium photo booth with props, custom backdrops, and unlimited instant prints for your guests.",
    longDescription:
      "Our most popular photo booth package. Same premium DSLR setup as the digital booth, plus a professional dye-sub printer that produces dry, smudge-proof 4×6 or 2×6 prints in under 10 seconds. Each guest walks away with a physical keepsake, and you can add a custom template with your names, monogram, or company logo at no extra charge.",
    whatsIncluded: [
      "4 hours of unlimited sessions and prints",
      "DSLR camera with studio lighting",
      "Professional dye-sub printer",
      "Custom-designed print template (your names/logo)",
      "Choice of backdrop (3+ options)",
      "Premium prop box",
      "Instant digital share + full gallery",
      "On-site attendant",
    ],
    perfectFor: [
      "Weddings (favors guests actually keep)",
      "Sweet 16 / Quinceañeras",
      "Corporate galas with branded prints",
      "Bar / Bat Mitzvahs",
      "Anniversary parties",
    ],
    technicalDetails: [
      "10 ft × 10 ft floor space required",
      "Standard wall outlet",
      "30-minute setup window",
      "Print template designed in advance and proofed with you",
    ],
    faq: [
      {
        q: "Do guests really get unlimited prints?",
        a: "Yes — every session prints. A group of 4 takes 4 prints. We bring enough media for 800+ prints per event, which has never run out.",
      },
      {
        q: "Can I add my logo or wedding monogram?",
        a: "Absolutely — included free. Send us your design or we'll create one for you. You'll approve a proof before the event.",
      },
      {
        q: "What size are the prints?",
        a: "Standard 4×6 photo prints, or classic 2×6 strip-style — your choice.",
      },
    ],
    image: photoBooth,
    icon: Camera,
    popular: true,
  },
  {
    id: "extra-hours",
    name: "Extra Hours (x2)",
    price: 400,
    priceDisplay: "$400",
    shortDescription:
      "Extend the party! Add 2 additional hours of DJ service to keep the dance floor going.",
    longDescription:
      "When the dance floor is packed and nobody wants to leave, extra hours are the difference between a great night and a legendary one. This add-on extends your DJ, MC, sound, and lighting by a full 2 hours past your scheduled end time — no equipment teardown, no awkward goodbye, the music just keeps going.",
    whatsIncluded: [
      "2 additional hours of continuous DJ service",
      "MC services for any late-night announcements",
      "All booked sound and lighting stays running",
      "Same energy, same playlist — just longer",
    ],
    perfectFor: [
      "Wedding receptions that won't quit",
      "Milestone birthdays",
      "After-parties at the same venue",
      "Corporate events with open-bar overruns",
    ],
    technicalDetails: [
      "Must be confirmed at least 7 days before event (last-minute extensions $250/hr if available)",
      "Subject to venue end-time and noise bylaws",
      "Single-rate flat pricing — no surprise overtime",
    ],
    faq: [
      {
        q: "Can I decide on the night of?",
        a: "Yes, but it's $250/hr at the door (cash or e-transfer). Booking in advance at $200/hr saves you money and guarantees we've blocked the time.",
      },
      {
        q: "Does my venue allow late hours?",
        a: "Most do until midnight or 1 AM. We'll check with your coordinator before confirming.",
      },
    ],
    image: extraHours,
    icon: Clock,
    popular: false,
  },
  {
    id: "karaoke",
    name: "Karaoke Package",
    price: 350,
    priceDisplay: "$350",
    shortDescription:
      "Full karaoke setup with thousands of songs, lyrics display, and wireless microphones.",
    longDescription:
      "Add a karaoke segment to any event without committing to a full karaoke booking. Two wireless microphones, a 65-inch lyrics display, and access to a 20,000+ song library covering everything from Sinatra to Sabrina Carpenter. Perfect as a 1–2 hour party block in the middle of a longer event.",
    whatsIncluded: [
      "2 wireless handheld microphones",
      "65\" lyrics display screen",
      "20,000+ song catalog (English, French, Spanish, more)",
      "Digital song request queue (guests scan a QR code)",
      "MC hosting through karaoke segment",
      "Integrates seamlessly with your DJ set",
    ],
    perfectFor: [
      "Corporate team-building events",
      "Birthday parties",
      "Wedding receptions (after dinner segment)",
      "Holiday parties",
      "House parties",
    ],
    technicalDetails: [
      "Add-on to existing DJ booking only",
      "Requires extra 2 ft × 4 ft footprint near DJ booth",
      "Songs added to library on request, free",
    ],
    faq: [
      {
        q: "Can I book karaoke without a DJ?",
        a: "Yes — see our Karaoke Packages section for standalone bookings starting at $400.",
      },
      {
        q: "What if my song isn't in the library?",
        a: "Send us the request 48 hours before the event and we'll add it free of charge.",
      },
    ],
    image: karaoke,
    icon: Mic,
    popular: false,
  },
  {
    id: "dry-ice",
    name: "Dry Ice Effects",
    price: 250,
    priceDisplay: "$250",
    shortDescription:
      "Dramatic low-lying fog effects for first dances, entrances, and special moments.",
    longDescription:
      "Dry ice creates a rolling, ground-hugging cloud of fog that looks like you're dancing on the clouds. Unlike standard fog machines, dry ice fog stays low (knee-height and below) and dissipates in seconds — meaning no haze in the air, no smoke alarms, and stunning photos.",
    whatsIncluded: [
      "Professional dry ice fog generator",
      "Up to 3 minutes of low-lying fog",
      "Operator on-site",
      "Synced to your DJ cue (typically first dance)",
      "Setup, safety brief, and teardown",
    ],
    perfectFor: [
      "First dance \"dancing on clouds\" moment",
      "Bridal entrance",
      "Quinceañera waltz",
      "Special performance reveals",
      "Magic-themed events",
    ],
    technicalDetails: [
      "8 ft minimum ceiling clearance",
      "Will not trigger smoke alarms (low-altitude fog)",
      "Requires near-ground level (no platforms)",
      "Dry ice sourced same-day for max output",
    ],
    faq: [
      {
        q: "Will it set off the fire alarm?",
        a: "No. Dry ice fog is condensed water vapor and CO₂ that stays at floor level — it never reaches ceiling-mounted detectors.",
      },
      {
        q: "How long does the effect last?",
        a: "We can deliver up to 3 minutes of dense fog — typically programmed as a 60-second showpiece for a first dance.",
      },
      {
        q: "Can I combine it with cold sparklers?",
        a: "Yes — and the combination looks incredible. Bundle both for $500 (save $50).",
      },
    ],
    image: dryIce,
    icon: Wind,
    popular: true,
  },
  {
    id: "custom",
    name: "Custom Add-On",
    price: 0,
    priceDisplay: "Contact Us",
    shortDescription:
      "Have something specific in mind? Let us create a custom solution for your event.",
    longDescription:
      "Looking for confetti cannons, CO₂ jets, LED dance floors, monogram projection, live percussion, a saxophonist riding the DJ set, branded uplighting, or something we've never been asked before? We've probably done it. Tell us what you're imagining and we'll quote it.",
    whatsIncluded: [],
    perfectFor: [],
    technicalDetails: [],
    faq: [],
    image: null,
    icon: Plus,
    popular: false,
    customQuoteOnly: true,
  },
];

export const getAddonById = (id: string) => addons.find((a) => a.id === id);
