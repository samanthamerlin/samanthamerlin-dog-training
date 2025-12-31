"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Play,
  Clock,
  BookOpen,
  Check,
  Lock,
  CheckCircle,
  XCircle,
  Headphones,
  Loader2,
  Calendar,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  isFreePreview: boolean;
  videoDuration: number | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
}

interface ContentTier {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  isPurchased: boolean;
  moduleCount: number;
  lessonCount: number;
  totalDuration: number;
  modules: Module[];
}

interface Subscription {
  status: string;
  type: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export default function TrainingPage() {
  const searchParams = useSearchParams();
  const [tiers, setTiers] = useState<ContentTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const purchaseStatus = searchParams.get("purchase");
  const subscriptionStatus = searchParams.get("subscription");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiersRes, subRes] = await Promise.all([
          fetch("/api/content/tiers"),
          fetch("/api/subscriptions"),
        ]);

        const tiersData = await tiersRes.json();
        const subData = await subRes.json();

        if (tiersRes.ok) {
          setTiers(tiersData.tiers || []);
        }
        if (subRes.ok) {
          setHasSubscription(subData.hasSubscription);
          setSubscription(subData.subscription);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start subscription");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to start subscription");
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to live support.")) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
      });
      if (response.ok) {
        setHasSubscription(false);
        setSubscription(null);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training Library</h1>
        <p className="text-muted-foreground">
          Professional dog training courses at your own pace
        </p>
      </div>

      {purchaseStatus === "cancelled" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Purchase cancelled</p>
                <p className="text-sm text-yellow-600">
                  You can purchase a tier when you&apos;re ready.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {subscriptionStatus === "success" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Subscription activated!</p>
                <p className="text-sm text-green-600">
                  You now have access to live training support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {subscriptionStatus === "cancelled" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Subscription cancelled</p>
                <p className="text-sm text-yellow-600">
                  You can subscribe when you&apos;re ready.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Support Subscription Card */}
      <Card className={hasSubscription ? "border-primary/50 bg-primary/5" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                Live Support
              </CardTitle>
              {hasSubscription && (
                <Badge variant="default" className="mt-2">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            {!hasSubscription && (
              <div className="text-right">
                <div className="text-2xl font-bold">$19</div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
            )}
          </div>
          <CardDescription className="mt-2">
            Get personalized training support with monthly Q&A sessions and direct access to expert guidance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Weekly live Q&A sessions
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Priority email support
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              Personalized training feedback
            </li>
          </ul>

          {hasSubscription && subscription ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancelSubscription}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={handleSubscribe}
              disabled={subscribing}
            >
              {subscribing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Headphones className="mr-2 h-4 w-4" />
                  Subscribe for $19/month
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {tiers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">
              Training content is being prepared. Check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.id}
              className={tier.isPurchased ? "border-primary/50 bg-primary/5" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      {tier.name}
                    </CardTitle>
                    {tier.isPurchased && (
                      <Badge variant="default" className="mt-2">
                        <Check className="h-3 w-3 mr-1" />
                        Owned
                      </Badge>
                    )}
                  </div>
                  {!tier.isPurchased && (
                    <div className="text-right">
                      <div className="text-2xl font-bold">${parseFloat(tier.price).toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">one-time</div>
                    </div>
                  )}
                </div>
                {tier.description && (
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {tier.moduleCount} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    {tier.lessonCount} lessons
                  </span>
                  {tier.totalDuration > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(tier.totalDuration)}
                    </span>
                  )}
                </div>

                {/* Module preview */}
                {tier.modules.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">What you&apos;ll learn:</h4>
                    <ul className="space-y-1">
                      {tier.modules.slice(0, 3).map((module) => (
                        <li key={module.id} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Check className="h-3 w-3 text-primary" />
                          {module.title}
                        </li>
                      ))}
                      {tier.modules.length > 3 && (
                        <li className="text-sm text-muted-foreground">
                          + {tier.modules.length - 3} more modules
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <Button className="w-full" asChild>
                  <Link href={`/dashboard/training/${tier.slug}`}>
                    {tier.isPurchased ? (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Continue Learning
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        View & Purchase
                      </>
                    )}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
