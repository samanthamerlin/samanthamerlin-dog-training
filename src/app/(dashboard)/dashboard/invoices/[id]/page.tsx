"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CreditCard,
  Check,
  Loader2,
  Download,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
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
  SENT: { label: "Pending", variant: "secondary" as const },
  PAID: { label: "Paid", variant: "default" as const },
  PARTIAL: { label: "Partial", variant: "secondary" as const },
  OVERDUE: { label: "Overdue", variant: "destructive" as const },
  CANCELLED: { label: "Cancelled", variant: "outline" as const },
};

export default function ClientInvoiceDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
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

    fetchInvoice();
  }, [params.id]);

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const response = await fetch(`/api/invoices/${params.id}/pay`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to start payment");
      }
    } catch {
      setError("Failed to start payment");
    } finally {
      setPaymentLoading(false);
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
          <Link href="/dashboard/invoices">
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
  const isPaid = invoice.status === "PAID";
  const canPay = ["SENT", "OVERDUE", "PARTIAL"].includes(invoice.status) && amountDue > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/invoices">
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

      {/* Payment Status Messages */}
      {paymentStatus === "success" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Payment successful!</p>
                <p className="text-sm text-green-600">Thank you for your payment.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {paymentStatus === "cancelled" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Payment cancelled</p>
                <p className="text-sm text-yellow-600">You can try again when you&apos;re ready.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Magic Paws Dog Training</CardTitle>
                <CardDescription>Mill Valley, CA</CardDescription>
              </div>
              <Badge variant={status.variant} className="text-sm">
                {status.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Service Period</h4>
              <p>{formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}</p>
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
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Sidebar */}
        <div className="space-y-6">
          {/* Payment Card */}
          <Card className={canPay ? "border-primary/20 bg-primary/5" : ""}>
            <CardHeader>
              <CardTitle className="text-lg">
                {isPaid ? "Payment Complete" : "Payment"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPaid ? (
                <div className="text-center py-4">
                  <Check className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium text-green-700">Thank you!</p>
                  <p className="text-sm text-muted-foreground">
                    This invoice has been paid in full.
                  </p>
                </div>
              ) : canPay ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold">${amountDue.toFixed(2)}</div>
                    <p className="text-sm text-muted-foreground">Amount due</p>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Pay Now
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment powered by Stripe
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  No payment required at this time.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Number</span>
                <span className="font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Date</span>
                <span>{formatDate(invoice.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span>{formatDate(invoice.dueDate)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">${parseFloat(invoice.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="text-green-600">${parseFloat(invoice.amountPaid).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Balance Due</span>
                <span>${amountDue.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center text-sm">
                      <div>
                        <div className="font-medium">${parseFloat(payment.amount).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          {payment.method} {payment.paidAt && `• ${formatDate(payment.paidAt)}`}
                        </div>
                      </div>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
