import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dog, Heart, GraduationCap, Calendar, Star, ArrowRight, CheckCircle } from "lucide-react";

const services = [
  {
    title: "Dog Training",
    description: "One-on-one training sessions for basic manners, puppy socialization, or behavior issues.",
    price: "$140/hour",
    icon: GraduationCap,
    href: "/services#training",
  },
  {
    title: "Social Day Hike",
    description: "Group hikes for socialized dogs. A great way for your pup to exercise and make friends.",
    price: "$55/session",
    icon: Dog,
    href: "/services#hiking",
  },
  {
    title: "Pet Sitting & Boarding",
    description: "Loving care for your dog while you're away. Your pet stays in a home environment.",
    price: "$100/day",
    icon: Heart,
    href: "/services#boarding",
  },
  {
    title: "Grooming",
    description: "Brush, bath, and nail trimming to keep your dog looking and feeling their best.",
    price: "From $20",
    icon: Star,
    href: "/services#grooming",
  },
];

const trainingTiers = [
  {
    name: "Foundation",
    price: "$29",
    description: "Essential puppy training basics",
    features: ["Basic commands", "House training", "Socialization tips", "Bite inhibition"],
  },
  {
    name: "Intermediate",
    price: "$49",
    description: "Build on the basics with advanced skills",
    features: ["Leash manners", "Recall training", "Impulse control", "Real-world scenarios"],
    popular: true,
  },
  {
    name: "Advanced",
    price: "$79",
    description: "Master level training for exceptional dogs",
    features: ["Off-leash reliability", "Advanced commands", "Behavior modification", "Competition prep"],
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "Mill Valley",
    text: "Samantha transformed our anxious rescue into a confident, happy dog. Her patience and expertise are unmatched.",
    rating: 5,
  },
  {
    name: "Michael R.",
    location: "Sausalito",
    text: "The puppy training course was exactly what we needed. Clear, practical advice that actually works!",
    rating: 5,
  },
  {
    name: "Jennifer L.",
    location: "Tiburon",
    text: "We've used Magic Paws for boarding several times. Our dog loves it there and we have complete peace of mind.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Serving Mill Valley & Marin County
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              Transform Your Dog's Life with{" "}
              <span className="text-primary">Expert Training</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional dog training, walking, and care services with over 10 years of experience.
              Build a stronger bond with your furry family member.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">
                  Book a Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/training">Explore Training Programs</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Services Tailored to Your Dog's Needs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From training to daily care, we offer comprehensive services to keep your dog happy and healthy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card key={service.title} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary">{service.price}</span>
                    <Link
                      href={service.href}
                      className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      Learn more →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Training Programs Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Online Training</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Puppy Training Programs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn at your own pace with our comprehensive video training courses.
              Real-world techniques that integrate into your daily life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {trainingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative ${tier.popular ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">{tier.price}</span>
                    <span className="text-muted-foreground ml-1">one-time</span>
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-6"
                    variant={tier.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/training">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Add monthly <span className="font-medium">Live Support</span> for just $19/month
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">About Samantha</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Over 10 Years of Passion for Dogs
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Hi, I'm Samantha Merlin, and dogs have been my life's work and greatest joy.
                Based in beautiful Mill Valley, California, I've dedicated over a decade to
                understanding canine behavior and helping families build stronger bonds with their pets.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                My approach focuses on positive reinforcement and real-world integration—because
                training shouldn't just work in a classroom, it should work in your daily life.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>10+ years professional experience</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>50+ happy client families</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Bilingual: English & French</span>
                </li>
              </ul>
              <Button asChild>
                <Link href="/about">Read My Story</Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                <Dog className="h-32 w-32 text-primary/40" />
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-xl bg-primary/10 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Clients Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't just take my word for it—hear from the families I've had the pleasure to work with.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Dog's Journey?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Whether you need training, daily walks, or a trusted sitter, I'm here to help.
            Let's create a happier, healthier life for your furry friend.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule a Call
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/training">Browse Training Programs</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
