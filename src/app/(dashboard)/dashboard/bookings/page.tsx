"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Calendar, Clock, Dog, AlertCircle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface BookingDog {
  dog: {
    id: string;
    name: string;
    breed: string | null;
  };
}

interface Booking {
  id: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  requestedDate: string;
  requestedTime: string | null;
  confirmedDate: string | null;
  confirmedTime: string | null;
  duration: number | null;
  notes: string | null;
  rejectionReason: string | null;
  serviceType: {
    id: string;
    name: string;
    price: number;
  };
  dogs: BookingDog[];
  createdAt: string;
}

const statusConfig = {
  PENDING: { label: "Pending", variant: "secondary" as const, color: "text-yellow-600" },
  CONFIRMED: { label: "Confirmed", variant: "default" as const, color: "text-green-600" },
  REJECTED: { label: "Rejected", variant: "destructive" as const, color: "text-red-600" },
  CANCELLED: { label: "Cancelled", variant: "outline" as const, color: "text-gray-500" },
  COMPLETED: { label: "Completed", variant: "secondary" as const, color: "text-blue-600" },
  NO_SHOW: { label: "No Show", variant: "destructive" as const, color: "text-red-600" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings);
      } else {
        setError(data.error || "Failed to load bookings");
      }
    } catch {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  const upcomingBookings = bookings.filter(
    (b) => ["PENDING", "CONFIRMED"].includes(b.status)
  );

  const pastBookings = bookings.filter(
    (b) => ["COMPLETED", "REJECTED", "CANCELLED", "NO_SHOW"].includes(b.status)
  );

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const status = statusConfig[booking.status];
    const displayDate = booking.confirmedDate || booking.requestedDate;
    const displayTime = booking.confirmedTime || booking.requestedTime;

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{booking.serviceType.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {formatDate(displayDate)}
                {displayTime && (
                  <>
                    <Clock className="h-4 w-4 ml-2" />
                    {formatTime(displayTime)}
                  </>
                )}
              </CardDescription>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Dog className="h-4 w-4 text-muted-foreground" />
              <span>
                {booking.dogs.map((d) => d.dog.name).join(", ")}
              </span>
            </div>

            {booking.duration && (
              <div className="text-sm text-muted-foreground">
                Duration: {booking.duration} minutes
              </div>
            )}

            {booking.notes && (
              <div className="text-sm text-muted-foreground">
                Notes: {booking.notes}
              </div>
            )}

            {booking.status === "REJECTED" && booking.rejectionReason && (
              <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{booking.rejectionReason}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                ${booking.serviceType.price.toFixed(2)}
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/bookings/${booking.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your service bookings
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/bookings/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming bookings</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Schedule a training session or other service
                </p>
                <Button asChild>
                  <Link href="/dashboard/bookings/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Book a Service
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No past bookings</h3>
                <p className="text-muted-foreground text-center">
                  Your completed and cancelled bookings will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
