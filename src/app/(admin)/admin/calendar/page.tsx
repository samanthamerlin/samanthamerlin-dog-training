"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Dog, User, Clock, MapPin, Home, GraduationCap, Scissors } from "lucide-react";
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
    slug: string;
    basePrice: string | number;
  };
  dogs: BookingDog[];
  client: {
    id: string;
    phone: string | null;
    user: {
      name: string | null;
      email: string | null;
    };
  };
}

// Service type colors for visual distinction
const serviceColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  "day-hike": { bg: "bg-emerald-500", text: "text-emerald-700", icon: MapPin },
  "boarding": { bg: "bg-purple-500", text: "text-purple-700", icon: Home },
  "training": { bg: "bg-blue-500", text: "text-blue-700", icon: GraduationCap },
  "grooming": { bg: "bg-pink-500", text: "text-pink-700", icon: Scissors },
};

const defaultServiceColor = { bg: "bg-gray-500", text: "text-gray-700", icon: Dog };

const statusBadges = {
  PENDING: { label: "Pending", variant: "secondary" as const },
  CONFIRMED: { label: "Confirmed", variant: "default" as const },
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
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings?limit=200");
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

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

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

  const handleBookingClick = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleDayClick = (day: number) => {
    const dayBookings = getBookingsForDay(day);
    if (dayBookings.length > 0) {
      setSelectedDay(day);
      setDayDialogOpen(true);
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    if (timeStr.includes(":")) {
      if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
      const date = new Date(timeStr);
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    return timeStr;
  };

  const getServiceStyle = (slug: string) => {
    return serviceColors[slug] || defaultServiceColor;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const selectedDayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

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
            View your schedule at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[180px] text-center font-semibold text-lg">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span>Day Hike</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Boarding</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Training</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500"></div>
          <span>Grooming</span>
        </div>
        <div className="border-l pl-4 ml-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-yellow-500"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-current opacity-100"></div>
            <span>Confirmed</span>
          </div>
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
                return <div key={`empty-${index}`} className="min-h-[120px] p-1"></div>;
              }

              const dayBookings = getBookingsForDay(day);

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "min-h-[120px] p-2 border rounded-lg transition-colors",
                    isToday(day) && "bg-primary/5 border-primary",
                    dayBookings.length > 0 && "cursor-pointer hover:bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium mb-2",
                      isToday(day) && "text-primary"
                    )}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 4).map((booking) => {
                      const style = getServiceStyle(booking.serviceType.slug);
                      const isPending = booking.status === "PENDING";
                      return (
                        <button
                          key={booking.id}
                          onClick={(e) => handleBookingClick(booking, e)}
                          className={cn(
                            "w-full text-left text-xs p-1.5 rounded truncate text-white transition-opacity hover:opacity-80",
                            style.bg,
                            isPending && "opacity-70 border-2 border-dashed border-white/50"
                          )}
                          title={`${booking.serviceType.name} - ${booking.client.user.name} (${booking.dogs.map((d) => d.dog.name).join(", ")})`}
                        >
                          <div className="flex items-center gap-1">
                            {booking.requestedTime && (
                              <span className="font-semibold">{formatTime(booking.requestedTime)}</span>
                            )}
                          </div>
                          <div className="truncate">
                            {booking.dogs.map((d) => d.dog.name).join(", ")}
                          </div>
                        </button>
                      );
                    })}
                    {dayBookings.length > 4 && (
                      <div className="text-xs text-muted-foreground font-medium">
                        +{dayBookings.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
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
                <p className="text-muted-foreground text-center py-6">
                  No bookings scheduled for today
                </p>
              );
            }

            return (
              <div className="space-y-3">
                {todayBookings.map((booking) => {
                  const style = getServiceStyle(booking.serviceType.slug);
                  const IconComponent = style.icon;
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-full text-white", style.bg)}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {booking.serviceType.name}
                            <Badge variant={statusBadges[booking.status as keyof typeof statusBadges]?.variant || "secondary"}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {booking.client.user.name} - {booking.dogs.map((d) => d.dog.name).join(", ")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {booking.requestedTime || "Time TBD"}
                        </div>
                        {booking.duration && (
                          <div className="text-sm text-muted-foreground">
                            {booking.duration} min
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedDay && `${MONTHS[currentDate.getMonth()]} ${selectedDay}, ${currentDate.getFullYear()}`}
            </DialogTitle>
            <DialogDescription>
              {selectedDayBookings.length} booking{selectedDayBookings.length !== 1 ? "s" : ""} scheduled
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDayBookings.map((booking) => {
              const style = getServiceStyle(booking.serviceType.slug);
              const IconComponent = style.icon;
              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setDayDialogOpen(false);
                    setSelectedBooking(booking);
                    setDialogOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full text-white", style.bg)}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{booking.serviceType.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {booking.client.user.name} - {booking.dogs.map((d) => d.dog.name).join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={statusBadges[booking.status as keyof typeof statusBadges]?.variant || "secondary"} className="text-xs">
                      {booking.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {booking.requestedTime || "Time TBD"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

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

          {selectedBooking && (() => {
            const style = getServiceStyle(selectedBooking.serviceType.slug);
            const IconComponent = style.icon;
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-full text-white", style.bg)}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedBooking.serviceType.name}</h3>
                    <Badge variant={statusBadges[selectedBooking.status as keyof typeof statusBadges]?.variant || "secondary"}>
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{selectedBooking.client.user.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedBooking.client.user.email}</div>
                      {selectedBooking.client.phone && (
                        <div className="text-sm text-muted-foreground">{selectedBooking.client.phone}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Dog className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {selectedBooking.dogs.map((d) => d.dog.name).join(", ")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedBooking.dogs.map((d) => d.dog.breed || "Mixed").join(", ")}
                      </div>
                    </div>
                  </div>

                  {selectedBooking.requestedTime && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{formatTime(selectedBooking.requestedTime)}</div>
                        {selectedBooking.duration && (
                          <div className="text-sm text-muted-foreground">{selectedBooking.duration} minutes</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedBooking.notes && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm">
                    <p className="font-medium text-amber-800 mb-1">Client Notes:</p>
                    <p className="text-amber-700">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-semibold text-lg">
                    ${parseFloat(String(selectedBooking.serviceType.basePrice)).toFixed(2)}
                  </span>
                  <Button asChild>
                    <a href="/admin/bookings">Manage Booking</a>
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
