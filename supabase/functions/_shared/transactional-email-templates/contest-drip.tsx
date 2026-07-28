import * as React from 'npm:react@18.3.1'
import type { TemplateEntry } from './registry.ts'
import { ContestGeneric } from './contest-generic.tsx'

const SITE = 'https://beatmasterdj.ca'

type D = { name?: string; winnerFirstName?: string }

export const day1: TemplateEntry = {
  component: (d: D) => (
    <ContestGeneric
      name={d.name}
      preview="Here's what you could win"
      heading="Here's what you could win"
      paragraphs={[
        "Just wanted to give you a closer look at what's included in the free wedding DJ package you're entered to win.",
        'This is a full wedding experience — ceremony, cocktail hour, reception, lighting, MC services, everything.',
        'Value: $1,600–$5,000 depending on your setup.',
        'If you have any questions about your date or venue, reply anytime.',
      ]}
      signoff="Cheers,"
    />
  ),
  subject: "Here's what you could win",
  displayName: 'Contest drip · Day 1',
}

export const day3: TemplateEntry = {
  component: (d: D) => (
    <ContestGeneric
      name={d.name}
      preview="What other couples say"
      heading="What other couples say"
      paragraphs={["Thought I'd share a few quick testimonials from couples I've worked with:"]}
      quotes={[
        'BeatMaster DJ made our wedding unforgettable — the dance floor was packed all night.',
        'Jake was incredible. Professional, fun, and the music was perfect.',
        'Best DJ in Ottawa. Period.',
      ]}
      signoff="Talk soon,"
    />
  ),
  subject: 'What other couples say',
  displayName: 'Contest drip · Day 3',
}

export const day7: TemplateEntry = {
  component: (d: D) => (
    <ContestGeneric
      name={d.name}
      preview="A mix for your wedding night"
      heading="A mix for your wedding night"
      paragraphs={[
        "Here's a sample wedding mix I put together — gives you a feel for the energy I bring to receptions.",
        'If you want something custom for your wedding, I can build it.',
      ]}
      ctaLabel="Listen at beatmasterdj.ca"
      ctaHref={SITE}
      signoff="Catch you soon,"
    />
  ),
  subject: 'A mix for your wedding night',
  displayName: 'Contest drip · Day 7',
}

export const day14: TemplateEntry = {
  component: (d: D) => (
    <ContestGeneric
      name={d.name}
      preview="Quick question about your wedding date"
      heading="Quick question about your wedding date"
      paragraphs={[
        "Just checking in — are you still finalizing your wedding date and venue?",
        "I'm booking 2026–2027 weddings now, and dates fill up fast. If you want me to pencil you in while the contest is running, I can do that.",
      ]}
      signoff="Let me know,"
    />
  ),
  subject: 'Quick question about your wedding date',
  displayName: 'Contest drip · Day 14',
}

export const day21: TemplateEntry = {
  component: (d: D) => (
    <ContestGeneric
      name={d.name}
      preview="Here's what most couples ask me"
      heading="Here's what most couples ask me"
      paragraphs={['I get a lot of the same questions, so here are quick answers:']}
      bullets={[
        'Do you travel? Yes — Ottawa + 100km radius.',
        'Do you handle ceremony audio? Absolutely. Wireless mics + music cues.',
        'Do you MC? Yes — full reception hosting.',
        'Do you take requests? Of course.',
      ]}
      signoff="Cheers,"
    />
  ),
  subject: "Here's what most couples ask me",
  displayName: 'Contest drip · Day 21',
}

export const day30: TemplateEntry = {
  component: (d: D) => (
    <ContestGeneric
      name={d.name}
      preview="Your wedding timeline (free resource)"
      heading="Your wedding timeline"
      paragraphs={["Here's a free wedding reception timeline template I give to couples:"]}
      bullets={[
        '5:00 — Cocktail hour',
        '6:00 — Grand entrance',
        '6:15 — Dinner',
        '7:30 — Speeches',
        '8:00 — First dances',
        '8:15 — Dance floor opens',
        '10:00 — Late-night music',
        '11:30 — Final songs',
      ]}
      signoff="Talk soon,"
    />
  ),
  subject: 'Your wedding timeline (free resource)',
  displayName: 'Contest drip · Day 30',
}

export const day45: TemplateEntry = {
  component: (d: D) => (
    <ContestGeneric
      name={d.name}
      preview="Your wedding date might fill soon"
      heading="Your wedding date might fill soon"
      paragraphs={[
        "Just a heads up — I've had a few inquiries for dates around yours.",
        'If you want me to hold your date while the contest is running, I can do that at no cost.',
      ]}
      signoff="Let me know,"
    />
  ),
  subject: 'Your wedding date might fill soon',
  displayName: 'Contest drip · Day 45',
}

export const winner: TemplateEntry = {
  component: (d: D) => (
    <ContestGeneric
      name={d.name}
      preview="You won the BeatMaster DJ giveaway"
      heading="And the winner is… you!"
      paragraphs={[
        'Thanks again for entering the BeatMaster DJ wedding giveaway.',
        `The winner of the free wedding DJ package is: ${d.name || 'you'} — that's you!`,
        "Reply to this email within 5 business days and we'll lock in your date.",
      ]}
      signoff="Congratulations,"
    />
  ),
  subject: 'And the winner is… you!',
  displayName: 'Contest · Winner',
}

export const loser: TemplateEntry = {
  component: (d: D) => (
    <ContestGeneric
      name={d.name}
      preview="Giveaway results"
      heading="And the winner is…"
      paragraphs={[
        'Thanks again for entering the BeatMaster DJ wedding giveaway.',
        `The winner of the free wedding DJ package is: ${d.winnerFirstName || 'our lucky winner'}.`,
        "But I've got something for you — watch your inbox for the next note.",
      ]}
      signoff="— Jake"
    />
  ),
  subject: 'And the winner is…',
  displayName: 'Contest · Non-winner',
}

export const discountOffer: TemplateEntry = {
  component: (d: D) => (
    <ContestGeneric
      name={d.name}
      preview="Something for you"
      heading="You didn't win… but I have something for you"
      paragraphs={[
        "You didn't win the free wedding — but here's $200 off any wedding package if you book by October 7th, 2026.",
        'This discount applies to:',
      ]}
      bullets={['Ceremony', 'Cocktail hour', 'Reception', 'MC services', 'Lighting', 'Custom playlists']}
      ctaLabel="Book your date"
      ctaHref={SITE}
      signoff="Talk soon,"
    />
  ),
  subject: "You didn't win… but I have something for you",
  displayName: 'Contest · Discount offer',
}
