"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Bell,
  Mail,
  Calendar,
  FileText,
  GraduationCap,
  Megaphone,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface NotificationPreferences {
  bookingReminders: boolean;
  bookingUpdates: boolean;
  invoiceNotifications: boolean;
  marketingEmails: boolean;
  trainingUpdates: boolean;
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bookingReminders: true,
    bookingUpdates: true,
    invoiceNotifications: true,
    marketingEmails: true,
    trainingUpdates: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/notifications/preferences");
        const data = await response.json();
        if (response.ok && data.preferences) {
          setPreferences({
            bookingReminders: data.preferences.bookingReminders,
            bookingUpdates: data.preferences.bookingUpdates,
            invoiceNotifications: data.preferences.invoiceNotifications,
            marketingEmails: data.preferences.marketingEmails,
            trainingUpdates: data.preferences.trainingUpdates,
          });
        }
      } catch (error) {
        console.error("Failed to fetch preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save preferences");
      }
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences({ ...preferences, [key]: value });
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
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and notifications
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which emails you&apos;d like to receive from us.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="bookingReminders" className="font-medium">
                  Booking Reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming appointments
                </p>
              </div>
            </div>
            <Switch
              id="bookingReminders"
              checked={preferences.bookingReminders}
              onCheckedChange={(checked) => updatePreference("bookingReminders", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="bookingUpdates" className="font-medium">
                  Booking Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when bookings are confirmed, changed, or cancelled
                </p>
              </div>
            </div>
            <Switch
              id="bookingUpdates"
              checked={preferences.bookingUpdates}
              onCheckedChange={(checked) => updatePreference("bookingUpdates", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="invoiceNotifications" className="font-medium">
                  Invoice Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when invoices are ready or payment is received
                </p>
              </div>
            </div>
            <Switch
              id="invoiceNotifications"
              checked={preferences.invoiceNotifications}
              onCheckedChange={(checked) => updatePreference("invoiceNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="trainingUpdates" className="font-medium">
                  Training Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  New training content and course updates
                </p>
              </div>
            </div>
            <Switch
              id="trainingUpdates"
              checked={preferences.trainingUpdates}
              onCheckedChange={(checked) => updatePreference("trainingUpdates", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="marketingEmails" className="font-medium">
                  Marketing Emails
                </Label>
                <p className="text-sm text-muted-foreground">
                  Special offers, tips, and news about our services
                </p>
              </div>
            </div>
            <Switch
              id="marketingEmails"
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => updatePreference("marketingEmails", checked)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Saved
              </span>
            )}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
