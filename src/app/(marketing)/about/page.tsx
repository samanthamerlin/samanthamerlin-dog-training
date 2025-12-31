import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Award, Users, MapPin, Languages, CheckCircle } from "lucide-react";

export const metadata = {
  title: "About Samantha Merlin | Magic Paws Dog Training",
  description: "Learn about Samantha Merlin's journey and passion for dog training in Mill Valley, California. Over 10 years of experience helping dogs and families thrive.",
};

const milestones = [
  { year: "2014", title: "Started Magic Paws", description: "Launched professional dog training services in Marin County" },
  { year: "2016", title: "Expanded Services", description: "Added dog walking and pet sitting to meet client needs" },
  { year: "2020", title: "50+ Clients", description: "Reached milestone of serving over 50 families" },
  { year: "2024", title: "Online Training Launch", description: "Launched comprehensive online puppy training programs" },
];

const values = [
  {
    icon: Heart,
    title: "Compassion First",
    description: "Every dog is unique. I take the time to understand each dog's personality, needs, and challenges.",
  },
  {
    icon: Award,
    title: "Positive Reinforcement",
    description: "Training should be enjoyable. I use reward-based methods that build confidence and trust.",
  },
  {
    icon: Users,
    title: "Family Involvement",
    description: "Dogs learn best when the whole family is on the same page. I train families, not just dogs.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">About Me</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Hi, I'm Samantha Merlin
            </h1>
            <p className="text-xl text-muted-foreground">
              Dog trainer, behaviorist, and lifelong animal lover based in Mill Valley, California
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center">
                <Heart className="h-32 w-32 text-primary/40" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-foreground mb-6">My Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  My love affair with dogs began in childhood, but it wasn't until I moved to the
                  beautiful Marin County that I turned that passion into my profession. There's
                  something magical about watching a dog and their human click—that moment when
                  communication finally flows both ways.
                </p>
                <p>
                  Over the past decade, I've had the privilege of working with hundreds of dogs,
                  from energetic puppies to senior rescues, each one teaching me something new.
                  I believe that every dog has the potential to be a wonderful companion—they
                  just need the right guidance and a human who understands them.
                </p>
                <p>
                  When I'm not training, you'll find me hiking the trails of Mount Tam with my
                  own dogs, or helping at local rescue organizations. Dogs have given me so much
                  joy and purpose; helping others experience that same connection is what drives
                  me every day.
                </p>
              </div>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Mill Valley, CA</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Languages className="h-5 w-5 text-primary" />
                  <span>English & French</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">My Training Philosophy</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every training session is built on these core principles
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="pt-8">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">The Journey So Far</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {milestone.year}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="text-lg font-semibold">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Credentials Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Experience & Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "10+ years professional dog training",
                "Specialization in puppy development",
                "Behavior modification expertise",
                "Fear and anxiety rehabilitation",
                "Positive reinforcement certified",
                "Pet first aid certified",
                "Rescue dog rehabilitation",
                "Service dog training experience",
              ].map((credential) => (
                <div key={credential} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>{credential}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Let's Work Together</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            I'd love to meet you and your dog. Whether you're starting with a new puppy or
            working through challenges with your current companion, I'm here to help.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
