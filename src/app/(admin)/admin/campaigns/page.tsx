"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Plus,
  Send,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
} from "lucide-react";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  targetAll: boolean;
  targetRoles: string[];
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  _count: {
    recipients: number;
  };
}

const ROLES = [
  { value: "CLIENT", label: "Clients" },
  { value: "SUBSCRIBER", label: "Subscribers" },
];

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<EmailCampaign | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    content: "",
    targetAll: true,
    targetRoles: [] as string[],
  });

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/admin/campaigns");
      const data = await response.json();
      if (response.ok) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSave = async () => {
    try {
      const url = editingCampaign
        ? `/api/admin/campaigns/${editingCampaign.id}`
        : "/api/admin/campaigns";
      const method = editingCampaign ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        await fetchCampaigns();
        setDialogOpen(false);
        resetForm();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save campaign");
      }
    } catch (error) {
      console.error("Failed to save campaign:", error);
      alert("Failed to save campaign");
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCampaigns();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      alert("Failed to delete campaign");
    }
  };

  const handleSend = async (campaignId: string) => {
    if (!confirm("Are you sure you want to send this campaign? This action cannot be undone.")) {
      return;
    }

    setSending(campaignId);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/send`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Campaign sent successfully!\n\nSent: ${data.sentCount}\nFailed: ${data.failedCount}`);
        await fetchCampaigns();
      } else {
        alert(data.error || "Failed to send campaign");
      }
    } catch (error) {
      console.error("Failed to send campaign:", error);
      alert("Failed to send campaign");
    } finally {
      setSending(null);
    }
  };

  const resetForm = () => {
    setEditingCampaign(null);
    setForm({
      name: "",
      subject: "",
      content: "",
      targetAll: true,
      targetRoles: [],
    });
  };

  const openDialog = (campaign?: EmailCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setForm({
        name: campaign.name,
        subject: campaign.subject,
        content: campaign.content,
        targetAll: campaign.targetAll,
        targetRoles: campaign.targetRoles,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "SCHEDULED":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      case "SENDING":
        return <Badge className="bg-blue-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Sending</Badge>;
      case "SENT":
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create and send email campaigns to your clients
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first email campaign to reach your clients.
            </p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {campaign.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {campaign.subject}
                    </CardDescription>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {campaign.targetAll ? "All users" : campaign.targetRoles.join(", ") || "No target"}
                    </span>
                    {campaign.status === "SENT" && (
                      <>
                        <span className="flex items-center gap-1">
                          <Send className="h-4 w-4" />
                          {campaign.sentCount} sent
                        </span>
                        <span>
                          Sent on {new Date(campaign.sentAt!).toLocaleDateString()}
                        </span>
                      </>
                    )}
                    {campaign.status === "DRAFT" && (
                      <span>
                        Created {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPreviewCampaign(campaign);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {campaign.status === "DRAFT" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(campaign)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(campaign.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleSend(campaign.id)}
                          disabled={sending === campaign.id}
                        >
                          {sending === campaign.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? "Edit Campaign" : "New Campaign"}</DialogTitle>
            <DialogDescription>
              {editingCampaign
                ? "Update your email campaign."
                : "Create a new email campaign to send to your clients."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Holiday Special Announcement"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g., Special Holiday Training Offer!"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Email Content (HTML)</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="<h2>Hello!</h2><p>Your email content here...</p>"
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Use HTML for formatting. The content will be wrapped in our email template.
              </p>
            </div>
            <div className="space-y-4">
              <Label>Target Audience</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="targetAll"
                  checked={form.targetAll}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, targetAll: !!checked, targetRoles: [] })
                  }
                />
                <Label htmlFor="targetAll" className="font-normal">
                  Send to all users
                </Label>
              </div>
              {!form.targetAll && (
                <div className="ml-6 space-y-2">
                  {ROLES.map((role) => (
                    <div key={role.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`role-${role.value}`}
                        checked={form.targetRoles.includes(role.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setForm({ ...form, targetRoles: [...form.targetRoles, role.value] });
                          } else {
                            setForm({
                              ...form,
                              targetRoles: form.targetRoles.filter((r) => r !== role.value),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`role-${role.value}`} className="font-normal">
                        {role.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingCampaign ? "Update" : "Create"} Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Subject: {previewCampaign?.subject}
            </DialogDescription>
          </DialogHeader>
          {previewCampaign && (
            <div
              className="border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: previewCampaign.content }}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
