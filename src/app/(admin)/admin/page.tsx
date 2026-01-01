import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Calendar, DollarSign, TrendingUp, Clock, AlertCircle, Dog, FileText } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch real stats from database
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [
    totalClients,
    pendingBookings,
    completedThisMonth,
    revenueThisMonth,
    overdueInvoices,
    recentPendingBookings,
    recentActivity,
  ] = await Promise.all([
    // Total clients
    prisma.clientProfile.count(),
    // Pending bookings
    prisma.bookingRequest.count({
      where: { status: "PENDING" },
    }),
    // Sessions completed this month
    prisma.bookingRequest.count({
      where: {
        status: "COMPLETED",
        confirmedDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    }),
    // Revenue this month (paid invoices)
    prisma.invoice.aggregate({
      where: {
        status: "PAID",
        issueDate: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      _sum: {
        amountPaid: true,
      },
    }),
    // Overdue invoices
    prisma.invoice.count({
      where: { status: "OVERDUE" },
    }),
    // Recent pending bookings for the pending actions section
    prisma.bookingRequest.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        serviceType: { select: { name: true } },
      },
    }),
    // Recent activity (all recent bookings)
    prisma.bookingRequest.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        client: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        serviceType: { select: { name: true } },
      },
    }),
  ]);

  const monthlyRevenue = revenueThisMonth._sum.amountPaid?.toNumber() || 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business and pending actions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Active client accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
              Pending Actions
            </CardTitle>
            <CardDescription>Items that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingBookings === 0 && overdueInvoices === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No pending actions</p>
                <p className="text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pending Bookings</span>
                      <Badge variant="secondary">{pendingBookings}</Badge>
                    </div>
                    <div className="space-y-2">
                      {recentPendingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2"
                        >
                          <div>
                            <p className="font-medium">{booking.client.user.name || booking.client.user.email}</p>
                            <p className="text-xs text-muted-foreground">{booking.serviceType.name}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/bookings">Review</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {overdueInvoices > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium">Overdue Invoices</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{overdueInvoices}</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/invoices">View</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/clients">
                <Users className="mr-2 h-4 w-4" />
                View All Clients
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Bookings
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/invoices">
                <DollarSign className="mr-2 h-4 w-4" />
                Generate Invoices
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/admin/reports">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events across your business</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here as you use the system</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const statusColors: Record<string, string> = {
                  PENDING: "text-amber-600",
                  CONFIRMED: "text-green-600",
                  COMPLETED: "text-blue-600",
                  REJECTED: "text-red-600",
                  CANCELLED: "text-gray-500",
                  NO_SHOW: "text-red-500",
                };
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted rounded-full p-2">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {activity.serviceType.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.client.user.name || activity.client.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={activity.status === "CONFIRMED" ? "default" : activity.status === "PENDING" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {activity.status.toLowerCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
