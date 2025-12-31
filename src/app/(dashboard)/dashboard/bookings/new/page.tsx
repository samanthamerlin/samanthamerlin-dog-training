"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Loader2, Dog, Clock, DollarSign, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ServiceType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string;
}

interface DogProfile {
  id: string;
  name: string;
  breed: string | null;
}

const bookingFormSchema = z.object({
  serviceTypeId: z.string().min(1, "Please select a service"),
  requestedDate: z.date({ error: "Please select a date" }),
  requestedTime: z.string().optional(),
  dogIds: z.array(z.string()).min(1, "Please select at least one dog"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function NewBookingPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceType[]>([]);
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      serviceTypeId: "",
      requestedTime: "",
      dogIds: [],
      notes: "",
    },
  });

  const selectedServiceId = form.watch("serviceTypeId");
  const selectedService = services.find((s) => s.id === selectedServiceId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, dogsRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/dogs"),
        ]);

        const servicesData = await servicesRes.json();
        const dogsData = await dogsRes.json();

        if (servicesRes.ok) {
          setServices(Array.isArray(servicesData) ? servicesData : servicesData.services || []);
        }
        if (dogsRes.ok) {
          setDogs(dogsData.dogs || []);
        }
      } catch {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          requestedDate: format(data.requestedDate, "yyyy-MM-dd"),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push("/dashboard/bookings");
      } else {
        setError(result.error || "Failed to create booking");
      }
    } catch {
      setError("Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Request a Booking</h1>
          <p className="text-muted-foreground">
            Submit a booking request for review
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {dogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dog className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Add a dog first</h3>
            <p className="text-muted-foreground text-center mb-4">
              You need to add at least one dog to your profile before booking
            </p>
            <Button asChild>
              <Link href="/dashboard/dogs/new">Add Your Dog</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select a Service</CardTitle>
                <CardDescription>Choose the service you would like to book</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="serviceTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid gap-4 md:grid-cols-2">
                          {services.map((service) => (
                            <div
                              key={service.id}
                              className={cn(
                                "relative flex cursor-pointer rounded-lg border p-4 transition-colors",
                                field.value === service.id
                                  ? "border-primary bg-primary/5"
                                  : "hover:border-primary/50"
                              )}
                              onClick={() => field.onChange(service.id)}
                            >
                              <div className="flex-1">
                                <h4 className="font-semibold">{service.name}</h4>
                                {service.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {service.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    ${service.price}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {service.duration} min
                                  </span>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-full border-2",
                                  field.value === service.id
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground/30"
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Dog Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Your Dog(s)</CardTitle>
                <CardDescription>Which dog(s) will be attending?</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="dogIds"
                  render={() => (
                    <FormItem>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {dogs.map((dog) => (
                          <FormField
                            key={dog.id}
                            control={form.control}
                            name="dogIds"
                            render={({ field }) => (
                              <FormItem
                                className={cn(
                                  "flex items-center space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer transition-colors",
                                  field.value?.includes(dog.id)
                                    ? "border-primary bg-primary/5"
                                    : "hover:border-primary/50"
                                )}
                                onClick={() => {
                                  const current = field.value || [];
                                  const updated = current.includes(dog.id)
                                    ? current.filter((id) => id !== dog.id)
                                    : [...current, dog.id];
                                  field.onChange(updated);
                                }}
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(dog.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      const updated = checked
                                        ? [...current, dog.id]
                                        : current.filter((id) => id !== dog.id);
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <div>
                                  <FormLabel className="font-medium cursor-pointer">
                                    {dog.name}
                                  </FormLabel>
                                  {dog.breed && (
                                    <p className="text-sm text-muted-foreground">
                                      {dog.breed}
                                    </p>
                                  )}
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Preferred Date & Time</CardTitle>
                <CardDescription>
                  Select your preferred date. We&apos;ll confirm the exact time with you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="requestedDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Preferred Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requestedTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time (Optional)</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map((time) => (
                              <Button
                                key={time}
                                type="button"
                                variant={field.value === time ? "default" : "outline"}
                                size="sm"
                                onClick={() => field.onChange(field.value === time ? "" : time)}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Select a preferred time slot or leave blank for any time
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>
                  Any special requests or information we should know?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., My dog is nervous around other dogs, please schedule a private session..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Summary */}
            {selectedService && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{selectedService.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold">${selectedService.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Your booking request will be reviewed and you&apos;ll receive a confirmation email once approved.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/bookings">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Booking Request
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
