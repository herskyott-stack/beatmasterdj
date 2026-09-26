import { Card, CardContent } from "@/components/ui/card";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

import evSub from "@/assets/gear/ev-sub.jpg";
import mackieTop from "@/assets/gear/mackie-top.jpg";
import denonMcx8000 from "@/assets/gear/denon-mcx8000.jpg";
import movingHead from "@/assets/gear/moving-head.jpg";
import pixelBar from "@/assets/gear/pixel-bar.jpg";
import dmxConsole from "@/assets/gear/dmx-console.jpg";

// Every package on this site runs on gear Jake actually owns — no rental
// roulette, no stock-photo rigs. Models and quantities below are the real
// inventory (verified from purchase history, Sep 2026).
const gear = [
  {
    image: evSub,
    name: "Electro-Voice ELX200-12SP",
    spec: '12" 1200W powered subwoofers',
    qty: "× 3 in the rig",
  },
  {
    image: mackieTop,
    name: "Mackie SRM450v3",
    spec: "1000W powered loudspeakers",
    qty: "Mains that punch",
  },
  {
    image: denonMcx8000,
    name: "Denon DJ MCX8000",
    spec: "Standalone 4-channel Serato controller",
    qty: "The booth workhorse",
  },
  {
    image: movingHead,
    name: "90W Moving Heads",
    spec: "LED moving-head stage fixtures",
    qty: "× 2",
  },
  {
    image: pixelBar,
    name: "LED Pixel Bars",
    spec: "60W RGB wash bars — DMX + sound-active",
    qty: "× 5",
  },
  {
    image: dmxConsole,
    name: "192-Channel DMX Console",
    spec: "Full DMX512 lighting control",
    qty: "Every fixture, wireless",
  },
];

const alsoInTheRig = [
  "Denon SC6000 media players",
  "ADJ WMX1 lighting controller",
  "Wireless DMX — 1 transmitter + 10 receivers",
  "Laser projector + dual fog machines",
  "Behringer 12\" powered sub",
  "Truss clamps, speaker stands, lighting T-bar",
  "Full XLR + power distribution kit",
];

const GearSection = () => {
  const ref = useRevealOnScroll<HTMLElement>();
  return (
    <section ref={ref} className="py-20 md:py-28 relative overflow-hidden bass-drop">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14 md:mb-20">
          <p className="eyebrow mb-4">No rentals. No guesswork.</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">The real rig</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4 text-base md:text-lg">
            Every package runs on gear Jake actually owns — the same rig you see
            in the photos. Here&rsquo;s what&rsquo;s in the truck.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {gear.map((item) => (
            <Card key={item.name} variant="glass" className="overflow-hidden group hover:border-primary/40 hover:-translate-y-1">
              <div className="aspect-square bg-white/[0.03] flex items-center justify-center p-6 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain image-zoom"
                  loading="lazy"
                />
              </div>
              <CardContent className="p-5">
                <p className="font-display font-semibold text-white">{item.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.spec}</p>
                <p className="text-xs text-primary mt-2 font-display uppercase tracking-wider">
                  {item.qty}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-10">
          <p className="text-center text-sm font-display uppercase tracking-widest text-muted-foreground mb-4">
            Also in the rig
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {alsoInTheRig.map((item) => (
              <span
                key={item}
                className="text-sm text-muted-foreground border border-white/10 bg-card/50 rounded-full px-4 py-2"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GearSection;
