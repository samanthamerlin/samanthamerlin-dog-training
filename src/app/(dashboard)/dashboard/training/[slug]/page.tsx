"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  GraduationCap,
  Play,
  Clock,
  BookOpen,
  Check,
  Lock,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface LessonProgress {
  isCompleted: boolean;
  lastPosition: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  isFreePreview: boolean;
  videoDuration: number | null;
  sortOrder: number;
  progress?: LessonProgress | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  lessons: Lesson[];
}

interface ContentTier {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  isPurchased: boolean;
  modules: Module[];
}

export default function TierDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [tier, setTier] = useState<ContentTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const purchaseStatus = searchParams.get("purchase");

  useEffect(() => {
    const fetchTier = async () => {
      try {
        const response = await fetch(`/api/content/tiers/${slug}`);
        const data = await response.json();
        if (response.ok) {
          setTier(data.tier);
        }
      } catch (error) {
        console.error("Failed to fetch tier:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTier();
  }, [slug]);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const response = await fetch(`/api/content/tiers/${slug}/purchase`, {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start purchase");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Failed to start purchase");
    } finally {
      setPurchasing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getTotalDuration = () => {
    if (!tier) return 0;
    return tier.modules.reduce((total, module) => {
      return total + module.lessons.reduce((lessonTotal, lesson) => {
        return lessonTotal + (lesson.videoDuration || 0);
      }, 0);
    }, 0);
  };

  const getTotalLessons = () => {
    if (!tier) return 0;
    return tier.modules.reduce((total, module) => total + module.lessons.length, 0);
  };

  const getCompletedLessons = () => {
    if (!tier) return 0;
    return tier.modules.reduce((total, module) => {
      return total + module.lessons.filter((l) => l.progress?.isCompleted).length;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!tier) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/training">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Training
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Tier Not Found</h3>
            <p className="text-muted-foreground">
              This training tier doesn&apos;t exist or is no longer available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDuration = getTotalDuration();
  const totalLessons = getTotalLessons();
  const completedLessons = getCompletedLessons();
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/training">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Training
        </Link>
      </Button>

      {purchaseStatus === "success" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Purchase successful!</p>
                <p className="text-sm text-green-600">
                  You now have full access to this training tier.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tier Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <GraduationCap className="h-6 w-6" />
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
                <div className="text-3xl font-bold">${parseFloat(tier.price).toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">one-time purchase</div>
              </div>
            )}
          </div>
          {tier.description && (
            <CardDescription className="mt-2 text-base">{tier.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {tier.modules.length} modules
            </span>
            <span className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              {totalLessons} lessons
            </span>
            {totalDuration > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m
              </span>
            )}
          </div>

          {tier.isPurchased && totalLessons > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{completedLessons} / {totalLessons} lessons completed</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {!tier.isPurchased && (
            <Button onClick={handlePurchase} disabled={purchasing} size="lg" className="w-full">
              {purchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Purchase for ${parseFloat(tier.price).toFixed(0)}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Modules and Lessons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Content</h2>
        <Accordion type="multiple" className="space-y-4">
          {tier.modules
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((module, moduleIndex) => (
              <AccordionItem
                key={module.id}
                value={module.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {moduleIndex + 1}
                    </span>
                    <div>
                      <h3 className="font-medium">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {module.lessons.length} lessons
                        {module.lessons.some((l) => l.videoDuration) && (
                          <> &bull; {formatDuration(
                            module.lessons.reduce((t, l) => t + (l.videoDuration || 0), 0)
                          )}</>
                        )}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {module.lessons
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((lesson, lessonIndex) => {
                        const canAccess = tier.isPurchased || lesson.isFreePreview;
                        const isCompleted = lesson.progress?.isCompleted;

                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              canAccess
                                ? "hover:bg-muted/50 cursor-pointer"
                                : "opacity-60"
                            }`}
                            onClick={() => {
                              if (canAccess) {
                                router.push(`/dashboard/training/${tier.slug}/lessons/${lesson.id}`);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : canAccess ? (
                                <Play className="h-5 w-5 text-primary" />
                              ) : (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              )}
                              <div>
                                <p className="font-medium">
                                  {lessonIndex + 1}. {lesson.title}
                                </p>
                                {lesson.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {lesson.isFreePreview && !tier.isPurchased && (
                                <Badge variant="secondary" className="text-xs">
                                  Free Preview
                                </Badge>
                              )}
                              {lesson.videoDuration && (
                                <span className="text-sm text-muted-foreground">
                                  {formatDuration(lesson.videoDuration)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </div>
    </div>
  );
}
