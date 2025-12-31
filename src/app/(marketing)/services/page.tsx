import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Dog, Heart, Scissors, Clock, MapPin, CheckCircle, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Services | Magic Paws Dog Training",
  description: "Professional dog training, walking, sitting, and grooming services in Mill Valley and Marin County. Personalized care for your furry family member.",
};

const services = [
  {
    id: "training",
    icon: GraduationCap,
    title: "Private Dog Training",
    price: "$140",
    unit: "per hour",
    description: "One-on-one training sessions tailored to your dog's specific needs and your family's goals.",
    features: [
      "Personalized training plan",
      "Basic obedience commands",
      "Puppy socialization",
      "Behavior problem solving",
      "Leash manners and recall",
      "Real-world scenario training",
    ],
    details: "Sessions take place at your home or in environments where your dog needs to learn. I work with dogs of all ages, from puppies to seniors, and address everything from basic manners to complex behavioral issues.",
    available: true,
  },
  {
    id: "hiking",
    icon: Dog,
    title: "Social Day Hike",
    price: "$55",
    unit: "per session",
    description: "Group hikes for well-socialized dogs. Great exercise and socialization in one adventure.",
    features: [
      "4-hour adventure (8:30am - 12:30pm)",
      "Small group sizes",
      "Beautiful Marin trails",
      "Pick-up and drop-off",
      "Photo updates",
      "Fresh water and treats included",
    ],
    details: "Our social hikes explore the beautiful trails of Marin County. Dogs must pass a temperament assessment to ensure they're a good fit for group activities.",
    available: false,
    unavailableReason: "Not currently accepting new dogs",
  },
  {
    id: "boarding",
    icon: Heart,
    title: "Boarding & Pet Sitting",
    price: "$100",
    unit: "per day",
    description: "Your dog stays in a loving home environment while you're away. Peace of mind guaranteed.",
    features: [
      "Home environment (not a kennel)",
      "24/7 supervision",
      "Daily exercise and play",
      "Medication administration",
      "Regular photo updates",
      "Meet-and-greet required",
    ],
    details: "Your dog becomes part of my family while you travel. Limited availability ensures each guest receives individual attention and care.",
    available: false,
    unavailableReason: "Not currently accepting new clients",
  },
  {
    id: "grooming",
    icon: Scissors,
    title: "Grooming Services",
    price: "From $20",
    unit: "varies by service",
    description: "Keep your dog looking and feeling their best with our grooming services.",
    features: [
      "Brushing and de-matting",
      "Bathing and drying",
      "Nail trimming ($20)",
      "Ear cleaning",
      "Sanitary trim",
      "Available for training clients",
    ],
    details: "Grooming services are available for current training and boarding clients. Prices vary based on dog size and coat type.",
    available: true,
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Professional Services</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Complete Care for Your Dog
            </h1>
            <p className="text-xl text-muted-foreground">
              From training to daily care, I offer personalized services to meet your dog's unique needs.
              All services are available in Mill Valley and surrounding Marin County areas.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className={`scroll-mt-24 ${index % 2 === 1 ? "bg-muted/30 -mx-4 px-4 py-12 rounded-2xl" : ""}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <service.icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{service.title}</h2>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">{service.price}</span>
                          <span className="text-muted-foreground">{service.unit}</span>
                        </div>
                      </div>
                    </div>

                    {!service.available && (
                      <div className="flex items-center gap-2 mb-4 p-3 bg-destructive/10 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <span className="text-sm font-medium text-destructive">
                          {service.unavailableReason}
                        </span>
                      </div>
                    )}

                    <p className="text-lg text-muted-foreground mb-6">
                      {service.description}
                    </p>
                    <p className="text-muted-foreground mb-6">
                      {service.details}
                    </p>

                    {service.available && (
                      <Button asChild>
                        <Link href="/contact">Book This Service</Link>
                      </Button>
                    )}
                  </div>

                  <Card className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <CardHeader>
                      <CardTitle>What's Included</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Policies & Information
            </h2>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Cancellation Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-2">
                  <p>
                    <strong>Training Sessions:</strong> 24-hour notice required for cancellations.
                    Late cancellations may be charged 50% of the session fee.
                  </p>
                  <p>
                    <strong>Boarding:</strong> 48-hour notice required. Deposits are non-refundable
                    for cancellations within 48 hours of the scheduled stay.
                  </p>
                  <p>
                    <strong>Day Hikes:</strong> Same-day cancellations will be charged the full rate.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Service Area
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  <p className="mb-4">
                    I primarily serve Mill Valley and the surrounding Marin County communities:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {["Mill Valley", "Sausalito", "Tiburon", "Corte Madera", "Larkspur", "San Rafael"].map((area) => (
                      <div key={area} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Have questions about my services? I'd love to chat about how I can help you and your dog.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Contact Me</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/training">View Training Programs</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
