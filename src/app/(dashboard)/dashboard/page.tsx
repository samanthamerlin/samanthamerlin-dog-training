import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dog, Calendar, GraduationCap, Plus } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Fetch user's client profile
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      dogs: true,
      bookingRequests: {
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          confirmedDate: { gte: new Date() },
        },
      },
    },
  });

  const dogCount = clientProfile?.dogs.length || 0;
  const upcomingBookings = clientProfile?.bookingRequests.length || 0;

  // Get training progress
  const totalLessons = await prisma.contentLesson.count({
    where: { isPublished: true },
  });
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId: session.user.id,
      isCompleted: true,
    },
  });
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Dogs</CardTitle>
            <Dog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dogCount}</div>
            <p className="text-xs text-muted-foreground">registered dog{dogCount !== 1 ? "s" : ""}</p>
            <Button size="sm" className="mt-4" asChild>
              <Link href="/dashboard/dogs">
                <Plus className="mr-2 h-4 w-4" />
                {dogCount > 0 ? "Manage Dogs" : "Add a Dog"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">scheduled session{upcomingBookings !== 1 ? "s" : ""}</p>
            <Button size="sm" variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/bookings">View Bookings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercent}%</div>
            <p className="text-xs text-muted-foreground">{completedLessons} of {totalLessons} lessons completed</p>
            <Button size="sm" variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/training">Start Learning</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Complete these steps to get the most out of Magic Paws
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">Complete your profile</p>
                <p className="text-sm text-muted-foreground">
                  Add your contact information and preferences
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/settings">Update Profile</Link>
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">Add your dog(s)</p>
                <p className="text-sm text-muted-foreground">
                  Register your furry friends to book services
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/dogs">Add Dog</Link>
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">Book your first session</p>
                <p className="text-sm text-muted-foreground">
                  Schedule a training session or service
                </p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href="/dashboard/bookings/new">Book Now</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
