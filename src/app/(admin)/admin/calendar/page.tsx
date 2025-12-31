"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Dog, User, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  serviceType: {
    id: string;
    name: string;
    price: number;
  };
  dogs: BookingDog[];
  client: {
    id: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
}

const statusColors = {
  PENDING: "bg-yellow-500",
  CONFIRMED: "bg-green-500",
  REJECTED: "bg-red-500",
  CANCELLED: "bg-gray-400",
  COMPLETED: "bg-blue-500",
  NO_SHOW: "bg-red-400",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AdminCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (response.ok) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (number | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

    return days;
  }, [currentDate]);

  const getBookingsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];

    return bookings.filter((booking) => {
      const bookingDate = (booking.confirmedDate || booking.requestedDate).split("T")[0];
      return bookingDate === dateStr && ["PENDING", "CONFIRMED"].includes(booking.status);
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    if (timeStr.includes(":")) {
      // Already formatted or is a time string like "9:00 AM"
      if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
      // Is a datetime string
      const date = new Date(timeStr);
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    return timeStr;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
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
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            View scheduled bookings and appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[160px] text-center font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Confirmed</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-[100px] p-1"></div>;
              }

              const dayBookings = getBookingsForDay(day);

              return (
                <div
                  key={day}
                  className={cn(
                    "min-h-[100px] p-1 border rounded-lg",
                    isToday(day) && "bg-primary/5 border-primary"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium mb-1",
                      isToday(day) && "text-primary"
                    )}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => handleBookingClick(booking)}
                        className={cn(
                          "w-full text-left text-xs p-1 rounded truncate text-white",
                          statusColors[booking.status]
                        )}
                        title={`${booking.serviceType.name} - ${booking.client.user.name}`}
                      >
                        {booking.requestedTime && (
                          <span className="font-medium">{formatTime(booking.requestedTime)} </span>
                        )}
                        {booking.serviceType.name}
                      </button>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Today */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const today = new Date();
            const todayBookings = bookings.filter((booking) => {
              const bookingDate = new Date(booking.confirmedDate || booking.requestedDate);
              return (
                bookingDate.toDateString() === today.toDateString() &&
                ["PENDING", "CONFIRMED"].includes(booking.status)
              );
            });

            if (todayBookings.length === 0) {
              return (
                <p className="text-muted-foreground text-center py-4">
                  No bookings scheduled for today
                </p>
              );
            }

            return (
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => handleBookingClick(booking)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", statusColors[booking.status])} />
                      <div>
                        <div className="font-medium">{booking.serviceType.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.client.user.name} • {booking.dogs.map((d) => d.dog.name).join(", ")}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm">
                      {booking.requestedTime || "Time TBD"}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {selectedBooking && (
                <span>
                  {new Date(selectedBooking.confirmedDate || selectedBooking.requestedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{selectedBooking.serviceType.name}</h3>
                <Badge variant={selectedBooking.status === "CONFIRMED" ? "default" : "secondary"}>
                  {selectedBooking.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedBooking.client.user.name}</span>
                  <span className="text-muted-foreground">({selectedBooking.client.user.email})</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Dog className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedBooking.dogs.map((d) => d.dog.name).join(", ")}</span>
                </div>

                {selectedBooking.requestedTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatTime(selectedBooking.requestedTime)}</span>
                    {selectedBooking.duration && (
                      <span className="text-muted-foreground">({selectedBooking.duration} min)</span>
                    )}
                  </div>
                )}
              </div>

              {selectedBooking.notes && (
                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">Notes:</p>
                  <p>{selectedBooking.notes}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">${selectedBooking.serviceType.price.toFixed(2)}</span>
                <Button variant="outline" asChild>
                  <a href={`/admin/bookings`}>View in Bookings</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
