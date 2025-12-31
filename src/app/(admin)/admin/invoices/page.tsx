"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  User,
  DollarSign,
  Plus,
  Loader2,
  FileText,
  Send,
  Check,
  Eye,
  Trash2,
} from "lucide-react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  tax: string;
  total: string;
  amountPaid: string;
  status: "DRAFT" | "SENT" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED";
  client: {
    id: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
  items: Array<{
    id: string;
    description: string;
    quantity: string;
    unitPrice: string;
    total: string;
  }>;
}

interface Client {
  id: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

const statusConfig = {
  DRAFT: { label: "Draft", variant: "outline" as const },
  SENT: { label: "Sent", variant: "secondary" as const },
  PAID: { label: "Paid", variant: "default" as const },
  PARTIAL: { label: "Partial", variant: "secondary" as const },
  OVERDUE: { label: "Overdue", variant: "destructive" as const },
  CANCELLED: { label: "Cancelled", variant: "outline" as const },
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Generate form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const fetchData = async () => {
    try {
      const [invoicesRes, dogsRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/dogs"),
      ]);

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.invoices || []);
      }

      // Extract unique clients from dogs
      if (dogsRes.ok) {
        const dogsData = await dogsRes.json();
        const clientMap = new Map<string, Client>();
        dogsData.dogs?.forEach((dog: { client?: Client }) => {
          if (dog.client) {
            clientMap.set(dog.client.id, dog.client);
          }
        });
        setClients(Array.from(clientMap.values()));
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

  const handleGenerateInvoice = async () => {
    if (!selectedClientId) {
      setError("Please select a client");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          periodStart: periodStart || undefined,
          periodEnd: periodEnd || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchData();
        setGenerateDialogOpen(false);
        resetGenerateForm();
        setSuccessMessage(`Invoice ${data.invoice.invoiceNumber} created`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || "Failed to generate invoice");
      }
    } catch {
      setError("Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SENT" }),
      });

      if (response.ok) {
        await fetchData();
        setSuccessMessage("Invoice marked as sent");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setError("Failed to update invoice");
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });

      if (response.ok) {
        await fetchData();
        setSuccessMessage("Invoice marked as paid");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setError("Failed to update invoice");
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchData();
        setSuccessMessage("Invoice deleted");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setError("Failed to delete invoice");
    }
  };

  const resetGenerateForm = () => {
    setSelectedClientId("");
    setPeriodStart("");
    setPeriodEnd("");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter invoices by status
  const draftInvoices = invoices.filter((i) => i.status === "DRAFT");
  const sentInvoices = invoices.filter((i) => ["SENT", "OVERDUE"].includes(i.status));
  const paidInvoices = invoices.filter((i) => i.status === "PAID");

  // Calculate stats
  const totalOutstanding = invoices
    .filter((i) => ["SENT", "OVERDUE", "PARTIAL"].includes(i.status))
    .reduce((sum, i) => sum + parseFloat(i.total) - parseFloat(i.amountPaid), 0);

  const totalPaidThisMonth = invoices
    .filter((i) => {
      if (i.status !== "PAID") return false;
      const paidDate = new Date(i.issueDate);
      const now = new Date();
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, i) => sum + parseFloat(i.amountPaid), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const InvoiceRow = ({ invoice }: { invoice: Invoice }) => {
    const status = statusConfig[invoice.status];
    const amountDue = parseFloat(invoice.total) - parseFloat(invoice.amountPaid);

    return (
      <TableRow>
        <TableCell>
          <div className="font-medium">{invoice.invoiceNumber}</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(invoice.issueDate)}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            {invoice.client.user.name || invoice.client.user.email}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">
            {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
          </div>
        </TableCell>
        <TableCell className="text-right">
          ${parseFloat(invoice.total).toFixed(2)}
        </TableCell>
        <TableCell className="text-right">
          {amountDue > 0 ? `$${amountDue.toFixed(2)}` : "-"}
        </TableCell>
        <TableCell>
          <Badge variant={status.variant}>{status.label}</Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/invoices/${invoice.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>

            {invoice.status === "DRAFT" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSendInvoice(invoice.id)}
                  title="Mark as Sent"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete invoice {invoice.invoiceNumber}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            {["SENT", "OVERDUE", "PARTIAL"].includes(invoice.status) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleMarkPaid(invoice.id)}
                title="Mark as Paid"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage client invoices and payments
          </p>
        </div>
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Invoice</DialogTitle>
              <DialogDescription>
                Create an invoice from uninvoiced service records
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label>Client *</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.user.name || client.user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Period Start (optional)</Label>
                  <Input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Period End (optional)</Label>
                  <Input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Leave dates empty to include all uninvoiced services.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerateInvoice} disabled={isGenerating}>
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {successMessage && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding</CardDescription>
            <CardTitle className="text-3xl">${totalOutstanding.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paid This Month</CardDescription>
            <CardTitle className="text-3xl">${totalPaidThisMonth.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
            <CardTitle className="text-3xl">{draftInvoices.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className="text-3xl">{invoices.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Invoices Table */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({invoices.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftInvoices.length})</TabsTrigger>
          <TabsTrigger value="sent">Pending ({sentInvoices.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidInvoices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No invoices yet. Generate one from service records.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {draftInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No draft invoices
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftInvoices.map((invoice) => (
                      <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {sentInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending invoices
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentInvoices.map((invoice) => (
                      <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {paidInvoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No paid invoices
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidInvoices.map((invoice) => (
                      <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
