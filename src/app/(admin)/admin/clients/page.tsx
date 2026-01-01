"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Dog,
  Calendar,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface Dog {
  id: string;
  name: string;
  breed: string | null;
  trainingLevel: string;
}

interface Booking {
  id: string;
  status: string;
  requestedDate: string;
  serviceType: { name: string };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: string;
}

interface Client {
  id: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
  };
  dogs: Dog[];
  bookingRequests: Booking[];
  invoices: Invoice[];
  _count: {
    dogs: number;
    bookingRequests: number;
    invoices: number;
  };
}

const bookingStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  CONFIRMED: { label: "Confirmed", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
  COMPLETED: { label: "Completed", variant: "secondary" },
  NO_SHOW: { label: "No Show", variant: "destructive" },
};

const invoiceStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "outline" },
  SENT: { label: "Sent", variant: "secondary" },
  PAID: { label: "Paid", variant: "default" },
  PARTIAL: { label: "Partial", variant: "secondary" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        const data = await response.json();
        if (response.ok) {
          setClients(data.clients);
        } else {
          setError(data.error || "Failed to load clients");
        }
      } catch {
        setError("Failed to load clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.user.name?.toLowerCase().includes(query) ||
      client.user.email.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      client.city?.toLowerCase().includes(query) ||
      client.dogs.some((dog) => dog.name.toLowerCase().includes(query))
    );
  });

  const toggleExpand = (clientId: string) => {
    setExpandedClient(expandedClient === clientId ? null : clientId);
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
        <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
        <p className="text-muted-foreground">
          View and manage all clients and their dogs
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Clients</CardDescription>
            <CardTitle className="text-4xl">{clients.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Dogs</CardDescription>
            <CardTitle className="text-4xl">
              {clients.reduce((sum, c) => sum + c._count.dogs, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-4xl">
              {clients.reduce((sum, c) => sum + c._count.bookingRequests, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className="text-4xl">
              {clients.reduce((sum, c) => sum + c._count.invoices, 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name, email, phone, city, or dog name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clients found</h3>
              <p className="text-muted-foreground text-center">
                {searchQuery
                  ? "Try a different search term"
                  : "Clients will appear here when they sign up"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredClients.map((client) => (
            <Collapsible
              key={client.id}
              open={expandedClient === client.id}
              onOpenChange={() => toggleExpand(client.id)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 rounded-full p-3">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {client.user.name || "Unnamed Client"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {client.user.email}
                            </span>
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </span>
                            )}
                            {client.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {client.city}, {client.state}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Dog className="h-4 w-4" />
                            {client._count.dogs} dogs
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {client._count.bookingRequests} bookings
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {client._count.invoices} invoices
                          </span>
                        </div>
                        {expandedClient === client.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="border-t pt-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Dogs */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Dog className="h-4 w-4" />
                          Dogs ({client.dogs.length})
                        </h4>
                        {client.dogs.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No dogs registered</p>
                        ) : (
                          <div className="space-y-2">
                            {client.dogs.map((dog) => (
                              <div
                                key={dog.id}
                                className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                              >
                                <div>
                                  <p className="font-medium">{dog.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {dog.breed || "Unknown breed"}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {dog.trainingLevel.toLowerCase()}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recent Bookings */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Recent Bookings
                        </h4>
                        {client.bookingRequests.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No bookings yet</p>
                        ) : (
                          <div className="space-y-2">
                            {client.bookingRequests.map((booking) => {
                              const status = bookingStatusConfig[booking.status] || {
                                label: booking.status,
                                variant: "outline" as const,
                              };
                              return (
                                <div
                                  key={booking.id}
                                  className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                                >
                                  <div>
                                    <p className="font-medium text-sm">
                                      {booking.serviceType.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(booking.requestedDate)}
                                    </p>
                                  </div>
                                  <Badge variant={status.variant} className="text-xs">
                                    {status.label}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Recent Invoices */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Recent Invoices
                        </h4>
                        {client.invoices.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No invoices yet</p>
                        ) : (
                          <div className="space-y-2">
                            {client.invoices.map((invoice) => {
                              const status = invoiceStatusConfig[invoice.status] || {
                                label: invoice.status,
                                variant: "outline" as const,
                              };
                              return (
                                <div
                                  key={invoice.id}
                                  className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                                >
                                  <div>
                                    <p className="font-medium text-sm">
                                      {invoice.invoiceNumber}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      ${parseFloat(invoice.total).toFixed(2)}
                                    </p>
                                  </div>
                                  <Badge variant={status.variant} className="text-xs">
                                    {status.label}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {client.notes && (
                      <div className="mt-6 pt-4 border-t">
                        <h4 className="font-semibold mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{client.notes}</p>
                      </div>
                    )}

                    {/* Meta */}
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      Client since {formatDate(client.user.createdAt)}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
}
