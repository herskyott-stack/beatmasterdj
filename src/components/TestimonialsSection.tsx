import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import SectionHeader from "@/components/SectionHeader";

// Real reviews from the HERSKY - DJ & AV Google Business Profile.
// 5.0 average, 17 reviews, every single one 5 stars. Wording is verbatim.
import sydneyFeatureImg from "@/assets/real/weddings/sydney-blake-dance-floor.jpg";

const GoogleG = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-label="Google">
    <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.6 2.8c2.2-2 3.8-5 3.8-8.6z" />
    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-3.6 2.8C3.5 21.4 7.5 24 12 24z" />
    <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4L1.4 6.9C.5 8.5 0 10.2 0 12s.5 3.5 1.4 5.1l3.8-2.7z" />
    <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.6 1.4 6.9l3.8 2.8c1-2.9 3.7-5 6.8-5z" />
  </svg>
);

const Stars = () => (
  <div className="flex gap-1 mb-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
    ))}
  </div>
);

const sydneyReview = {
  name: "Sydney Senechal",
  event: "Wedding",
  avatar: "SS",
  quote:
    "We hired DJ Hersky for our wedding this past weekend and he was phenomenal! He kept the energy going on the dance floor all night long and even incorporated live remixes & transitions. He is also very skilled at reading the room & selecting the best songs to keep the energy up! This level of performance is what makes hiring a DJ worth it compared to just making a Spotify playlist yourself! In addition, his lighting equipment was top tier. Even though it was a tented wedding, it felt like I was in a club! He also rushed to help when one of my groomsmen passed out during the ceremony (I had no idea that I would also get on site first aid when I hired him!). I would definitely recommend DJ Hersky for a wedding!!",
};

const testimonials = [
  {
    name: "Brianna Prekob",
    event: "Wedding",
    avatar: "BP",
    quote:
      "We hired Jacob to DJ our wedding last weekend. He did an absolutely amazing job! The dance floor was packed the entire night — our guests are still raving about how great the music was! He took the time to meet with us multiple times before the wedding to make sure he understood exactly what we wanted, and he absolutely nailed it. Everything from the ceremony to the cocktail hour to the reception was perfect. We honestly could not have asked for a better DJ. If you are looking for someone who will make your wedding day unforgettable, look no further!!",
  },
  {
    name: "Matt Brisson",
    event: "Event",
    avatar: "MB",
    quote:
      "Hersky is one of the most knowledgeable and hardest working DJs in the game. Highly recommend!",
  },
  {
    name: "Joseph Kasaji",
    event: "Event",
    avatar: "JK",
    quote: "The team is great to work with. You won't regret it!",
  },
  {
    name: "Jordan White",
    event: "Event",
    avatar: "JW",
    quote:
      "Couldn't have been better, made the night amazing and was extremely easy to work with! Thanks for everything guys will recommend to everyone!",
  },
  {
    name: "Mat Madore",
    event: "Party",
    avatar: "MM",
    quote:
      "Hersky will take care of your party needs no matter the situation! He's very good at what he does.",
  },
  {
    name: "Anthony Cole",
    event: "Event",
    avatar: "AC",
    quote: "Amazing and professional work, would highly recommend!!!",
  },
  {
    name: "Sean Chi",
    event: "Event",
    avatar: "SC",
    quote:
      "Jake is the epitome of a DJ and AV professional. He is such a master at his craft that he literally taught me top to bottom how to run events myself. With a kind and funny demeanor - you should have no doubts for booking Jake for your next event. His years of experience are bar none one of the best in the business!",
  },
  {
    name: "Jazz Chatelain",
    event: "Family Reunion",
    avatar: "JC",
    quote:
      "Jacob Herscovitch DJ Hersky for is a great entertainer. I saw him at Calypso DJing years ago, saw him DJing at Belvedere Venue at my friends wedding. I also saw DJ Hersky at the Red bull festival a few years ago. He knows how to entertain the crowd he certainly did it at our family reunion. I will definitely recommend DJ HERSKY to my friends and clients. Thanks again Jacob Herscovitch...",
  },
  {
    name: "Catherine Trahair",
    event: "Event",
    avatar: "CT",
    quote: "Jacob is very talented and always extremely professional. Highly recommend.",
  },
  {
    name: "Benjamin Allingham",
    event: "Event",
    avatar: "BA",
    quote:
      "One of the hardest working DJs I know. Always putting in the work to make sure the crowd is bouncing and having fun!",
  },
  {
    name: "Jake Martin",
    event: "Event",
    avatar: "JM",
    quote:
      "Hersky is a very talented, skilled and knowledgeable DJ who knows how to keep the dance floor packed! Polite, professional and punctual, he's a sure bet to ensure your event is a success!",
  },
  {
    name: "Trev S.",
    event: "Event",
    avatar: "TS",
    quote: "Great dj!",
  },
  {
    name: "Ivan Hughes",
    event: "Party",
    avatar: "IH",
    quote:
      "Thank you for such a memorable experience. Thanks to Dj Hersky our party was a hit!",
  },
];

const TestimonialsSection = () => {
  const ref = useRevealOnScroll<HTMLElement>();
  return (
    <section ref={ref} className="py-20 md:py-28 relative overflow-hidden bass-drop">
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          index="07"
          eyebrow="Google Reviews"
          title="What our clients say"
          sub="5.0 average from 17 verified Google reviews — every single one 5 stars."
        />

        {/* Featured review — Sydney Senechal */}
        <Card variant="featured" className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[280px] md:min-h-[360px]">
                <img
                  src={sydneyFeatureImg}
                  alt="Packed dance floor at Sydney and Blake's tented wedding"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />
                <span className="absolute bottom-3 left-3 text-[10px] text-white/80 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                  Yash Patel Photography
                </span>
              </div>
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <Quote className="w-8 h-8 text-primary/40 mb-4" />
                <Stars />
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  &ldquo;{sydneyReview.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary font-display font-bold">
                      {sydneyReview.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-display font-semibold text-white">
                      {sydneyReview.name}
                    </p>
                    <p className="text-sm text-primary">{sydneyReview.event}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground border border-white/10 rounded-full px-3 py-1.5">
                    <GoogleG /> Google review
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              variant="glass"
              className="lift-hover hover:border-primary/40"
            >
              <CardContent className="p-6 flex flex-col h-full">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/40 mb-4" />

                {/* Rating */}
                <Stars />

                {/* Quote */}
                <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary/20 text-primary font-display font-bold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-display font-semibold text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-primary">{testimonial.event}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GoogleG />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Link to Google profile */}
        <div className="text-center mt-12">
          <a
            href="https://share.google/6XYmNKt9sWG9diOwt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-display uppercase tracking-wider text-sm"
          >
            <GoogleG /> See all 17 reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
