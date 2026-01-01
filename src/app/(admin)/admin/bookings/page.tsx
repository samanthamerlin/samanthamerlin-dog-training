"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Dog, User, Mail, Check, X, MessageSquare, Loader2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  adminNotes: string | null;
  rejectionReason: string | null;
  serviceType: {
    id: string;
    name: string;
    basePrice: string | number;
  };
  dogs: BookingDog[];
  client: {
    id: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
  createdAt: string;
}

const statusConfig = {
  PENDING: { label: "Pending", variant: "secondary" as const },
  CONFIRMED: { label: "Confirmed", variant: "default" as const },
  REJECTED: { label: "Rejected", variant: "destructive" as const },
  CANCELLED: { label: "Cancelled", variant: "outline" as const },
  COMPLETED: { label: "Completed", variant: "secondary" as const },
  NO_SHOW: { label: "No Show", variant: "destructive" as const },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"confirm" | "reject" | null>(null);
  const [confirmDate, setConfirmDate] = useState("");
  const [confirmTime, setConfirmTime] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

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

  const handleConfirm = async () => {
    if (!selectedBooking) return;
    setProcessingId(selectedBooking.id);

    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CONFIRMED",
          confirmedDate: confirmDate || undefined,
          confirmedTime: confirmTime || undefined,
          adminNotes: adminNotes || undefined,
        }),
      });

      if (response.ok) {
        await fetchBookings();
        setDialogOpen(false);
        resetDialog();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to confirm booking");
      }
    } catch {
      setError("Failed to confirm booking");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedBooking) return;
    setProcessingId(selectedBooking.id);

    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason: rejectionReason || undefined,
          adminNotes: adminNotes || undefined,
        }),
      });

      if (response.ok) {
        await fetchBookings();
        setDialogOpen(false);
        resetDialog();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to reject booking");
      }
    } catch {
      setError("Failed to reject booking");
    } finally {
      setProcessingId(null);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setProcessingId(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchBookings();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update booking");
      }
    } catch {
      setError("Failed to update booking");
    } finally {
      setProcessingId(null);
    }
  };

  const resetDialog = () => {
    setSelectedBooking(null);
    setDialogAction(null);
    setConfirmDate("");
    setConfirmTime("");
    setAdminNotes("");
    setRejectionReason("");
  };

  const openConfirmDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogAction("confirm");
    setConfirmDate(booking.requestedDate.split("T")[0]);
    setConfirmTime(booking.requestedTime || "");
    setDialogOpen(true);
  };

  const openRejectDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setDialogAction("reject");
    setDialogOpen(true);
  };

  const pendingBookings = bookings.filter((b) => b.status === "PENDING");
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED");
  const allBookings = bookings;

  const BookingCard = ({ booking, showActions = true }: { booking: Booking; showActions?: boolean }) => {
    const status = statusConfig[booking.status];

    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{booking.serviceType.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4" />
                {booking.client.user.name || "Unknown"}
              </CardDescription>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{booking.client.user.email}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Requested: {formatDate(booking.requestedDate)}
                {booking.requestedTime && ` at ${booking.requestedTime}`}
              </span>
            </div>

            {booking.confirmedDate && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>
                  Confirmed: {formatDate(booking.confirmedDate)}
                  {booking.confirmedTime && ` at ${new Date(booking.confirmedTime).toLocaleTimeString()}`}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Dog className="h-4 w-4 text-muted-foreground" />
              <span>{booking.dogs.map((d) => d.dog.name).join(", ")}</span>
            </div>

            {booking.notes && (
              <div className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <span>{booking.notes}</span>
              </div>
            )}

            {booking.adminNotes && (
              <div className="flex items-start gap-2 text-sm bg-blue-50 p-2 rounded">
                <MessageSquare className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                <span className="text-blue-700">Admin: {booking.adminNotes}</span>
              </div>
            )}

            {booking.rejectionReason && (
              <div className="flex items-start gap-2 text-sm bg-red-50 p-2 rounded">
                <X className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                <span className="text-red-700">Reason: {booking.rejectionReason}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="font-semibold">${parseFloat(String(booking.serviceType.basePrice)).toFixed(2)}</span>

              {showActions && booking.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openRejectDialog(booking)}
                    disabled={processingId === booking.id}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openConfirmDialog(booking)}
                    disabled={processingId === booking.id}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                </div>
              )}

              {showActions && booking.status === "CONFIRMED" && (
                <Select
                  value={booking.status}
                  onValueChange={(value) => handleStatusChange(booking.id, value)}
                  disabled={processingId === booking.id}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              )}
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <p className="text-muted-foreground">
          Review and manage booking requests
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Requests</CardDescription>
            <CardTitle className="text-4xl">{pendingBookings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Confirmed Upcoming</CardDescription>
            <CardTitle className="text-4xl">{confirmedBookings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-4xl">{allBookings.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            Confirmed ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({allBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Check className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground text-center">
                  No pending booking requests to review
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          {confirmedBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming bookings</h3>
                <p className="text-muted-foreground text-center">
                  Confirmed bookings will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {confirmedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {allBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground text-center">
                  Bookings will appear here once clients submit requests
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions={booking.status !== "COMPLETED"} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirm/Reject Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetDialog();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "confirm" ? "Confirm Booking" : "Reject Booking"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "confirm"
                ? "Confirm the booking date and time for this request."
                : "Provide a reason for rejecting this booking request."}
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium">{selectedBooking.serviceType.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.client.user.name} • {selectedBooking.dogs.map((d) => d.dog.name).join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Requested: {formatDate(selectedBooking.requestedDate)}
                  {selectedBooking.requestedTime && ` at ${selectedBooking.requestedTime}`}
                </p>
              </div>

              {dialogAction === "confirm" && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="confirmDate">Confirmed Date</Label>
                      <Input
                        id="confirmDate"
                        type="date"
                        value={confirmDate}
                        onChange={(e) => setConfirmDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmTime">Confirmed Time</Label>
                      <Input
                        id="confirmTime"
                        type="time"
                        value={confirmTime}
                        onChange={(e) => setConfirmTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminNotes">Notes to Client (Optional)</Label>
                    <Textarea
                      id="adminNotes"
                      placeholder="Any notes for the client..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                </>
              )}

              {dialogAction === "reject" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Reason for Rejection</Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Please provide a reason for the client..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminNotesReject">Internal Notes (Optional)</Label>
                    <Textarea
                      id="adminNotesReject"
                      placeholder="Notes for your records (not shown to client)..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {dialogAction === "confirm" ? (
              <Button onClick={handleConfirm} disabled={processingId !== null}>
                {processingId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Booking
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleReject} disabled={processingId !== null}>
                {processingId && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
