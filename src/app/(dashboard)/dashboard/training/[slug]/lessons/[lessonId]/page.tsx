"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Lock,
  Play,
} from "lucide-react";

interface LessonProgress {
  isCompleted: boolean;
  lastPosition: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  youtubeVideoId: string | null;
  videoDuration: number | null;
  content: string | null;
  isFreePreview: boolean;
  sortOrder: number;
  module: {
    id: string;
    title: string;
    tier: {
      name: string;
      slug: string;
      price: string;
    };
  };
}

interface NavigationLesson {
  id: string;
  title: string;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousLesson, setPreviousLesson] = useState<NavigationLesson | null>(null);
  const [nextLesson, setNextLesson] = useState<NavigationLesson | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPositionRef = useRef<number>(0);

  const saveProgress = useCallback(async (position: number, completed?: boolean) => {
    if (!hasAccess) return;

    try {
      await fetch(`/api/content/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastPosition: Math.floor(position),
          isCompleted: completed,
        }),
      });
      lastSavedPositionRef.current = position;
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }, [lessonId, hasAccess]);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/content/lessons/${lessonId}`);
        const data = await response.json();

        if (response.ok) {
          setLesson(data.lesson);
          setHasAccess(data.hasAccess);
          setProgress(data.progress);
          setPreviousLesson(data.previousLesson);
          setNextLesson(data.nextLesson);
        }
      } catch (error) {
        console.error("Failed to fetch lesson:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [lessonId]);

  const handleMarkComplete = async () => {
    setMarkingComplete(true);
    try {
      await fetch(`/api/content/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true }),
      });
      setProgress((prev) => prev ? { ...prev, isCompleted: true } : { isCompleted: true, lastPosition: 0 });
    } catch (error) {
      console.error("Failed to mark complete:", error);
    } finally {
      setMarkingComplete(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href={`/dashboard/training/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Lesson Not Found</h3>
            <p className="text-muted-foreground">
              This lesson doesn&apos;t exist or is no longer available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href={`/dashboard/training/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{lesson.title}</CardTitle>
            {lesson.description && (
              <CardDescription>{lesson.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Premium Content</h3>
                <p className="text-muted-foreground mb-4">
                  Purchase the {lesson.module.tier.name} tier to access this lesson.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/training/${lesson.module.tier.slug}`}>
                    <Lock className="mr-2 h-4 w-4" />
                    View & Purchase (${parseFloat(lesson.module.tier.price).toFixed(0)})
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startTime = progress?.lastPosition ? Math.floor(progress.lastPosition) : 0;

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/dashboard/training/${slug}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {previousLesson && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/training/${slug}/lessons/${previousLesson.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Link>
            </Button>
          )}
          {nextLesson && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/training/${slug}/lessons/${nextLesson.id}`}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {lesson.module.tier.name} &bull; {lesson.module.title}
              </p>
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
              {lesson.description && (
                <CardDescription className="mt-2">{lesson.description}</CardDescription>
              )}
            </div>
            {progress?.isCompleted && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Player */}
          {lesson.youtubeVideoId ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}?start=${startTime}&rel=0&modestbranding=1`}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No video available for this lesson</p>
              </div>
            </div>
          )}

          {/* Lesson Text Content */}
          {lesson.content && (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </div>
          )}

          {/* Mark Complete Button */}
          {!progress?.isCompleted && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                size="lg"
              >
                {markingComplete ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="flex justify-between pt-6 border-t">
            {previousLesson ? (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/training/${slug}/lessons/${previousLesson.id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {previousLesson.title}
                </Link>
              </Button>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Button asChild>
                <Link href={`/dashboard/training/${slug}/lessons/${nextLesson.id}`}>
                  {nextLesson.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/dashboard/training/${slug}`}>
                  Back to Course
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
