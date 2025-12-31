"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Send,
  Check,
  Printer,
  Loader2,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
  serviceRecord?: {
    serviceType: { name: string };
    dog?: { name: string };
    serviceDate: string;
  };
}

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
  notes: string | null;
  client: {
    id: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
  items: InvoiceItem[];
  payments: Array<{
    id: string;
    amount: string;
    method: string;
    paidAt: string | null;
  }>;
}

const statusConfig = {
  DRAFT: { label: "Draft", variant: "outline" as const },
  SENT: { label: "Sent", variant: "secondary" as const },
  PAID: { label: "Paid", variant: "default" as const },
  PARTIAL: { label: "Partial", variant: "secondary" as const },
  OVERDUE: { label: "Overdue", variant: "destructive" as const },
  CANCELLED: { label: "Cancelled", variant: "outline" as const },
};

export default function AdminInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setInvoice(data.invoice);
      } else {
        setError(data.error || "Invoice not found");
      }
    } catch {
      setError("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const handleStatusUpdate = async (status: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/invoices/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchInvoice();
      }
    } catch {
      setError("Failed to update invoice");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">{error || "Invoice not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[invoice.status];
  const amountDue = parseFloat(invoice.total) - parseFloat(invoice.amountPaid);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground">
              Issued {formatDate(invoice.issueDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="text-sm">
            {status.label}
          </Badge>
          {invoice.status === "DRAFT" && (
            <Button
              onClick={() => handleStatusUpdate("SENT")}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Mark as Sent
            </Button>
          )}
          {["SENT", "OVERDUE", "PARTIAL"].includes(invoice.status) && (
            <Button
              onClick={() => handleStatusUpdate("PAID")}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Mark as Paid
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="print:shadow-none print:border-none">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Magic Paws Dog Training</CardTitle>
                  <CardDescription>Mill Valley, CA</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{invoice.invoiceNumber}</div>
                  <div className="text-sm text-muted-foreground">
                    Due: {formatDate(invoice.dueDate)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">Bill To:</h4>
                  <div className="text-sm space-y-1">
                    <div className="font-medium">{invoice.client.user.name}</div>
                    <div className="text-muted-foreground">{invoice.client.user.email}</div>
                  </div>
                </div>
                <div className="text-right md:text-left">
                  <h4 className="font-semibold mb-2">Service Period:</h4>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Line Items */}
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>
                <Separator />
                {invoice.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 text-sm">
                    <div className="col-span-6">{item.description}</div>
                    <div className="col-span-2 text-right">{parseFloat(item.quantity).toFixed(0)}</div>
                    <div className="col-span-2 text-right">${parseFloat(item.unitPrice).toFixed(2)}</div>
                    <div className="col-span-2 text-right">${parseFloat(item.total).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${parseFloat(invoice.subtotal).toFixed(2)}</span>
                  </div>
                  {parseFloat(invoice.tax) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${parseFloat(invoice.tax).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${parseFloat(invoice.total).toFixed(2)}</span>
                  </div>
                  {parseFloat(invoice.amountPaid) > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Paid</span>
                        <span>-${parseFloat(invoice.amountPaid).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Amount Due</span>
                        <span>${amountDue.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {invoice.notes && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="font-semibold mb-2">Notes:</h4>
                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{invoice.client.user.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{invoice.client.user.email}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded</p>
              ) : (
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">
                          ${parseFloat(payment.amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment.method} • {payment.paidAt && formatDate(payment.paidAt)}
                        </div>
                      </div>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">${parseFloat(invoice.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-medium text-green-600">
                  ${parseFloat(invoice.amountPaid).toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Amount Due</span>
                <span className="font-bold text-lg">${amountDue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
