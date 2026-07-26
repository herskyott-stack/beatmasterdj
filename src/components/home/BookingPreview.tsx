import { Check, Star, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { packageData, categoryImages, type Package } from "@/pages/BookingPage";

const BookingPreview = () => {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleSelectPackage = (category: string, pkg: Package) => {
    const id = `${category}-${pkg.name}`.toLowerCase().replace(/\s/g, "-");
    addItem({
      id,
      type: "package",
      category: category.charAt(0).toUpperCase() + category.slice(1),
      name: pkg.name,
      price: pkg.priceNum,
      description: pkg.description,
      features: pkg.features,
    });
    navigate("/checkout");
  };

  return (
    <section id="book" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 dj-heading">
            <span className="text-foreground">BOOK YOUR </span>
            <span className="gradient-text">EVENT</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Select a package to begin. Add-ons and details can be customized at checkout.
          </p>
        </div>

        <Tabs defaultValue="weddings" className="max-w-6xl mx-auto">
          <TabsList className="flex flex-wrap justify-center gap-2 mb-10 bg-transparent h-auto p-0">
            {Object.keys(packageData).map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="font-display uppercase tracking-wider px-5 py-2.5 rounded-full border border-white/10 bg-card/50 backdrop-blur-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:border-transparent transition-all duration-300 text-xs md:text-sm"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(packageData).map(([category, packages]) => (
            <TabsContent key={category} value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {packages.map((pkg) => (
                  <Card
                    key={pkg.name}
                    variant={pkg.featured ? "featured" : "glass"}
                    className={`relative transition-all duration-500 hover:scale-[1.02] overflow-hidden ${
                      pkg.featured ? "lg:-mt-4 lg:mb-4" : ""
                    }`}
                  >
                    <div className="absolute inset-0 z-0">
                      <img src={categoryImages[category]} alt="" className="w-full h-full object-cover opacity-40" />
                      <div className="absolute inset-0 bg-gradient-to-b from-card/60 via-card/80 to-card" />
                    </div>

                    {pkg.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent rounded-full z-10">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs font-display uppercase tracking-wider">Most Popular</span>
                        </div>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4 relative z-10">
                      <CardTitle className="font-display text-xl">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                      <div className="mt-4">
                        <span className="font-display text-4xl font-bold gradient-text">{pkg.price}</span>
                        <span className="ml-2 text-xs text-muted-foreground align-middle">+ 13% tax</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-6 relative z-10">
                      <ul className="space-y-3">
                        {pkg.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="relative z-10">
                      <Button
                        variant={pkg.featured ? "hero" : "outline"}
                        className="w-full"
                        onClick={() => handleSelectPackage(category, pkg)}
                      >
                        Select Package
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-10">
          <Button variant="outline" asChild>
            <Link to="/book">
              Open full booking page <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BookingPreview;
