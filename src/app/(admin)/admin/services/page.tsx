"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Dog, User, DollarSign, Plus, Loader2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ServiceRecord {
  id: string;
  serviceDate: string;
  duration: number;
  unitPrice: string;
  quantity: string;
  total: string;
  notes: string | null;
  invoiceItems: Array<{ id: string }>;
  serviceType: {
    id: string;
    name: string;
  };
  dog: {
    id: string;
    name: string;
    client: {
      id: string;
      user: {
        name: string | null;
        email: string | null;
      };
    };
  } | null;
  bookingRequest: {
    id: string;
    client: {
      id: string;
      user: {
        name: string | null;
        email: string | null;
      };
    };
  } | null;
}

interface ServiceType {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface DogProfile {
  id: string;
  name: string;
  client: {
    id: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
}

export default function AdminServicesPage() {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedDogId, setSelectedDogId] = useState("");
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState("");
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [unitPrice, setUnitPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    try {
      const [recordsRes, servicesRes, dogsRes] = await Promise.all([
        fetch("/api/service-records"),
        fetch("/api/services"),
        fetch("/api/dogs"),
      ]);

      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords(recordsData.records || []);
      }
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServiceTypes(Array.isArray(servicesData) ? servicesData : servicesData.services || []);
      }
      if (dogsRes.ok) {
        const dogsData = await dogsRes.json();
        setDogs(dogsData.dogs || []);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleServiceTypeChange = (serviceTypeId: string) => {
    setSelectedServiceTypeId(serviceTypeId);
    const service = serviceTypes.find((s) => s.id === serviceTypeId);
    if (service) {
      setUnitPrice(service.price.toString());
      setDuration(service.duration.toString());
    }
  };

  const handleSubmit = async () => {
    if (!selectedServiceTypeId || !serviceDate || !unitPrice || !duration) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/service-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceTypeId: selectedServiceTypeId,
          dogId: selectedDogId || undefined,
          serviceDate,
          unitPrice: parseFloat(unitPrice),
          duration: parseInt(duration),
          quantity: 1,
          adjustments: 0,
          notes: notes || undefined,
        }),
      });

      if (response.ok) {
        await fetchData();
        setDialogOpen(false);
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create service record");
      }
    } catch {
      setError("Failed to create service record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDogId("");
    setSelectedServiceTypeId("");
    setServiceDate(new Date().toISOString().split("T")[0]);
    setUnitPrice("");
    setDuration("");
    setNotes("");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getClientName = (record: ServiceRecord): string => {
    if (record.dog?.client?.user?.name) {
      return record.dog.client.user.name;
    }
    if (record.bookingRequest?.client?.user?.name) {
      return record.bookingRequest.client.user.name;
    }
    if (record.dog?.client?.user?.email) {
      return record.dog.client.user.email;
    }
    if (record.bookingRequest?.client?.user?.email) {
      return record.bookingRequest.client.user.email;
    }
    return "Unknown";
  };

  // Calculate stats
  const uninvoicedRecords = records.filter((r) => r.invoiceItems.length === 0);
  const totalUninvoiced = uninvoicedRecords.reduce((sum, r) => sum + parseFloat(r.total), 0);
  const thisMonthRecords = records.filter((r) => {
    const recordDate = new Date(r.serviceDate);
    const now = new Date();
    return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
  });

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
          <h1 className="text-3xl font-bold tracking-tight">Service Records</h1>
          <p className="text-muted-foreground">
            Track completed services for invoicing
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Service Record</DialogTitle>
              <DialogDescription>
                Record a completed service for invoicing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Service Type *</Label>
                <Select value={selectedServiceTypeId} onValueChange={handleServiceTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dog (optional)</Label>
                <Select value={selectedDogId} onValueChange={setSelectedDogId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dog" />
                  </SelectTrigger>
                  <SelectContent>
                    {dogs.map((dog) => (
                      <SelectItem key={dog.id} value={dog.id}>
                        {dog.name} ({dog.client?.user?.name || dog.client?.user?.email || "Unknown owner"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Date *</Label>
                  <Input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes) *</Label>
                <Input
                  type="number"
                  placeholder="60"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Session notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Uninvoiced Amount</CardDescription>
            <CardTitle className="text-4xl">${totalUninvoiced.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {uninvoicedRecords.length} records pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-4xl">{thisMonthRecords.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ${thisMonthRecords.reduce((sum, r) => sum + parseFloat(r.total), 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>All Time</CardDescription>
            <CardTitle className="text-4xl">{records.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              ${records.reduce((sum, r) => sum + parseFloat(r.total), 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Service Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No service records yet. Add one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Dog</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(record.serviceDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {getClientName(record)}
                      </div>
                    </TableCell>
                    <TableCell>{record.serviceType.name}</TableCell>
                    <TableCell>
                      {record.dog ? (
                        <div className="flex items-center gap-2">
                          <Dog className="h-4 w-4 text-muted-foreground" />
                          {record.dog.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {parseFloat(record.total).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.invoiceItems.length > 0 ? "secondary" : "outline"}>
                        {record.invoiceItems.length > 0 ? "Invoiced" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
