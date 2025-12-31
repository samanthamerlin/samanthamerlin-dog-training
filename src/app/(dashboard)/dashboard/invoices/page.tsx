"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, FileText, CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Invoice {
  id: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
  issueDate: string;
  dueDate: string;
  total: string;
  amountPaid: string;
  status: "DRAFT" | "SENT" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED";
}

const statusConfig = {
  DRAFT: { label: "Draft", variant: "outline" as const },
  SENT: { label: "Pending", variant: "secondary" as const },
  PAID: { label: "Paid", variant: "default" as const },
  PARTIAL: { label: "Partial", variant: "secondary" as const },
  OVERDUE: { label: "Overdue", variant: "destructive" as const },
  CANCELLED: { label: "Cancelled", variant: "outline" as const },
};

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch("/api/invoices");
        const data = await response.json();
        if (response.ok) {
          setInvoices(data.invoices || []);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate stats
  const pendingInvoices = invoices.filter((i) => ["SENT", "OVERDUE", "PARTIAL"].includes(i.status));
  const totalOutstanding = pendingInvoices.reduce(
    (sum, i) => sum + parseFloat(i.total) - parseFloat(i.amountPaid),
    0
  );
  const paidInvoices = invoices.filter((i) => i.status === "PAID");

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
        <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
        <p className="text-muted-foreground">
          View and pay your invoices
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding Balance</CardDescription>
            <CardTitle className="text-3xl">${totalOutstanding.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? "s" : ""} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paid Invoices</CardDescription>
            <CardTitle className="text-3xl">{paidInvoices.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className="text-3xl">{invoices.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Invoices Due
            </CardTitle>
            <CardDescription>These invoices are awaiting payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvoices.map((invoice) => {
                const amountDue = parseFloat(invoice.total) - parseFloat(invoice.amountPaid);
                const status = statusConfig[invoice.status];

                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{invoice.invoiceNumber}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due {formatDate(invoice.dueDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg">${amountDue.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Amount due</div>
                      </div>
                      <Button asChild>
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          Pay Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
              <p className="text-muted-foreground">
                Your invoices will appear here once services are completed
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const status = statusConfig[invoice.status];
                  const amountDue = parseFloat(invoice.total) - parseFloat(invoice.amountPaid);

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                      </TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        <div>
                          <div className="font-medium">${parseFloat(invoice.total).toFixed(2)}</div>
                          {amountDue > 0 && amountDue < parseFloat(invoice.total) && (
                            <div className="text-xs text-muted-foreground">
                              ${amountDue.toFixed(2)} due
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
