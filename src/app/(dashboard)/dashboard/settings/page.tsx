"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Mail,
  Calendar,
  FileText,
  GraduationCap,
  Megaphone,
  Loader2,
  CheckCircle,
  User,
  Phone,
  MapPin,
  AlertCircle,
} from "lucide-react";

interface NotificationPreferences {
  bookingReminders: boolean;
  bookingUpdates: boolean;
  invoiceNotifications: boolean;
  marketingEmails: boolean;
  trainingUpdates: boolean;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bookingReminders: true,
    bookingUpdates: true,
    invoiceNotifications: true,
    marketingEmails: true,
    trainingUpdates: true,
  });
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "CA",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: "",
  });
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prefsRes, profileRes] = await Promise.all([
          fetch("/api/notifications/preferences"),
          fetch("/api/profile"),
        ]);

        if (prefsRes.ok) {
          const prefsData = await prefsRes.json();
          if (prefsData.preferences) {
            setPreferences({
              bookingReminders: prefsData.preferences.bookingReminders,
              bookingUpdates: prefsData.preferences.bookingUpdates,
              invoiceNotifications: prefsData.preferences.invoiceNotifications,
              marketingEmails: prefsData.preferences.marketingEmails,
              trainingUpdates: prefsData.preferences.trainingUpdates,
            });
          }
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile) {
            setProfile(profileData.profile);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    setSavedPrefs(false);

    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSavedPrefs(true);
        setTimeout(() => setSavedPrefs(false), 3000);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save preferences");
      }
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert("Failed to save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setSavedProfile(false);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setSavedProfile(true);
        setTimeout(() => setSavedProfile(false), 3000);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save profile");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const updateProfile = (key: keyof ProfileData, value: string) => {
    setProfile({ ...profile, [key]: value });
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
          Manage your profile and account preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your contact information and address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => updateProfile("name", e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => updateProfile("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </Label>
            <Input
              id="address"
              value={profile.address}
              onChange={(e) => updateProfile("address", e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => updateProfile("city", e.target.value)}
                placeholder="Mill Valley"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={profile.state}
                onChange={(e) => updateProfile("state", e.target.value)}
                placeholder="CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={profile.zipCode}
                onChange={(e) => updateProfile("zipCode", e.target.value)}
                placeholder="94941"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Emergency Contact
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Contact Name</Label>
                <Input
                  id="emergencyContact"
                  value={profile.emergencyContact}
                  onChange={(e) => updateProfile("emergencyContact", e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={profile.emergencyPhone}
                  onChange={(e) => updateProfile("emergencyPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            {savedProfile && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Profile Saved
              </span>
            )}
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
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
            {savedPrefs && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Saved
              </span>
            )}
            <Button onClick={handleSavePreferences} disabled={savingPrefs}>
              {savingPrefs ? (
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
