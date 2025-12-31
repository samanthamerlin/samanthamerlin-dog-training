import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, Users, Clock, Award, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Online Puppy Training Programs | Magic Paws",
  description: "Comprehensive online puppy training courses. Learn at your own pace with video lessons, practical exercises, and optional live support.",
};

const tiers = [
  {
    id: "foundation",
    name: "Foundation",
    price: 29,
    description: "Essential puppy training basics for new dog parents",
    features: [
      "10+ video lessons",
      "Basic commands (sit, stay, come, down)",
      "House training fundamentals",
      "Crate training guide",
      "Socialization tips",
      "Bite inhibition techniques",
      "Downloadable cheat sheets",
      "Lifetime access",
    ],
    ideal: "Perfect for first-time puppy parents or those needing a refresher on the basics.",
    color: "bg-emerald-500",
  },
  {
    id: "intermediate",
    name: "Intermediate",
    price: 49,
    description: "Build on the basics with real-world training skills",
    features: [
      "Everything in Foundation",
      "15+ additional video lessons",
      "Advanced leash manners",
      "Reliable recall training",
      "Impulse control exercises",
      "Distraction training",
      "Public behavior skills",
      "Problem behavior solutions",
      "Priority email support",
    ],
    ideal: "For dogs who have the basics down but need help in real-world situations.",
    popular: true,
    color: "bg-primary",
  },
  {
    id: "advanced",
    name: "Advanced",
    price: 79,
    description: "Master-level training for exceptional dogs",
    features: [
      "Everything in Intermediate",
      "20+ additional video lessons",
      "Off-leash reliability",
      "Advanced command sequences",
      "Behavior modification techniques",
      "Anxiety and fear management",
      "Competition preparation basics",
      "Trick training bonus module",
      "1 free 15-min video consultation",
    ],
    ideal: "For dedicated trainers who want to achieve exceptional results with their dogs.",
    color: "bg-violet-500",
  },
];

const curriculum = [
  {
    module: "Module 1",
    title: "Setting the Foundation",
    lessons: ["Understanding your puppy's mind", "Setting up for success", "Creating routines", "Equipment essentials"],
  },
  {
    module: "Module 2",
    title: "Core Commands",
    lessons: ["Teaching 'Sit'", "The 'Stay' command", "Reliable 'Come'", "Mastering 'Down'"],
  },
  {
    module: "Module 3",
    title: "House Training",
    lessons: ["Potty training basics", "Crate training", "Preventing accidents", "Night-time routines"],
  },
  {
    module: "Module 4",
    title: "Socialization",
    lessons: ["Safe socialization windows", "Meeting new people", "Dog-to-dog introductions", "Novel experiences"],
  },
];

const faqs = [
  {
    question: "How long do I have access to the course?",
    answer: "You have lifetime access to any course you purchase. Once you buy it, it's yours forever. You can revisit the material whenever you need a refresher.",
  },
  {
    question: "What if the training doesn't work for my dog?",
    answer: "Every dog is different, and some techniques may need to be adapted. That's why I offer the Live Support subscription—you can get personalized guidance. If you're not satisfied within 30 days, I offer a full refund.",
  },
  {
    question: "Do I need any special equipment?",
    answer: "Just basic items: a collar or harness, a 6-foot leash, treats your dog loves, and a crate if you plan to crate train. I provide a complete equipment list in the first module.",
  },
  {
    question: "How is this different from YouTube tutorials?",
    answer: "This is a structured, progressive curriculum designed to build skills systematically. Each lesson builds on the previous one, and the techniques are consistent and proven. Plus, you can get personalized support.",
  },
  {
    question: "Can I upgrade to a higher tier later?",
    answer: "Yes! If you start with Foundation and want to continue to Intermediate, you'll only pay the difference. Contact me to upgrade your access.",
  },
];

export default function TrainingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Online Training Programs</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Train Your Puppy from Home
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Comprehensive video courses that fit your schedule. Learn proven techniques
              to build a well-behaved, confident companion.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                <span>45+ Video Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Learn at Your Pace</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span>Lifetime Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Program</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start where you are and grow from there. Each tier builds on the previous one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => (
              <Card
                key={tier.id}
                id={tier.id}
                className={`relative flex flex-col ${tier.popular ? "border-primary shadow-xl scale-[1.02]" : ""}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`h-2 w-20 ${tier.color} rounded-full mx-auto mb-4`} />
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground ml-1">one-time</span>
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mt-6 mb-4 italic">
                    {tier.ideal}
                  </p>
                  <Button
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/login">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Live Support Upsell */}
          <Card className="max-w-2xl mx-auto mt-12 bg-gradient-to-r from-primary/5 to-accent/10">
            <CardContent className="py-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold">Add Live Support</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Get personalized guidance with monthly live Q&A sessions and priority email support.
                Perfect for when you need expert advice on your specific situation.
              </p>
              <div className="text-3xl font-bold text-primary mb-4">
                $19<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <Button variant="outline" asChild>
                <Link href="/login">Add to Any Plan</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Curriculum Preview */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What You'll Learn</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A sample of what's covered in the Foundation course
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {curriculum.map((module) => (
              <Card key={module.module}>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">{module.module}</Badge>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <li key={lesson} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Play className="h-3 w-3 text-primary" />
                        {lesson}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <Card key={faq.question}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Training Today</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Join hundreds of dog parents who have transformed their relationship with their pets.
            Your journey to a well-trained dog starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/login">Get Started Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/contact">Have Questions?</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
