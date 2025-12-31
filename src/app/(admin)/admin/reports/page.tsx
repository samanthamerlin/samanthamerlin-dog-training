"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { DollarSign, TrendingUp, Calendar, Users, FileText } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  total: string;
  amountPaid: string;
  status: string;
  client: {
    id: string;
    user: {
      name: string | null;
      email: string | null;
    };
  };
}

interface ServiceRecord {
  id: string;
  serviceDate: string;
  total: string;
  serviceType: {
    name: string;
  };
  dog?: {
    name: string;
    client: {
      user: {
        name: string | null;
      };
    };
  };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function AdminReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, recordsRes] = await Promise.all([
          fetch("/api/invoices?limit=500"),
          fetch("/api/service-records?limit=500"),
        ]);

        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setInvoices(invoicesData.invoices || []);
        }
        if (recordsRes.ok) {
          const recordsData = await recordsRes.json();
          setServiceRecords(recordsData.records || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  // Filter by selected year
  const yearInvoices = invoices.filter((inv) => {
    const date = new Date(inv.issueDate);
    return date.getFullYear().toString() === selectedYear;
  });

  const yearRecords = serviceRecords.filter((rec) => {
    const date = new Date(rec.serviceDate);
    return date.getFullYear().toString() === selectedYear;
  });

  // Calculate monthly data
  const monthlyData = MONTHS.map((month, index) => {
    const monthInvoices = yearInvoices.filter((inv) => {
      const date = new Date(inv.issueDate);
      return date.getMonth() === index;
    });

    const monthRecords = yearRecords.filter((rec) => {
      const date = new Date(rec.serviceDate);
      return date.getMonth() === index;
    });

    const invoiced = monthInvoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
    const collected = monthInvoices.reduce((sum, inv) => sum + parseFloat(inv.amountPaid), 0);
    const services = monthRecords.reduce((sum, rec) => sum + parseFloat(rec.total), 0);
    const serviceCount = monthRecords.length;

    return {
      month,
      invoiced,
      collected,
      services,
      serviceCount,
    };
  });

  // Calculate yearly totals
  const yearlyTotals = {
    invoiced: monthlyData.reduce((sum, m) => sum + m.invoiced, 0),
    collected: monthlyData.reduce((sum, m) => sum + m.collected, 0),
    services: monthlyData.reduce((sum, m) => sum + m.services, 0),
    serviceCount: monthlyData.reduce((sum, m) => sum + m.serviceCount, 0),
  };

  // Current month stats
  const currentMonthIndex = new Date().getMonth();
  const currentMonthData = monthlyData[currentMonthIndex];

  // Top clients by revenue
  const clientRevenue = new Map<string, { name: string; revenue: number }>();
  yearInvoices.forEach((inv) => {
    if (inv.status === "PAID") {
      const clientId = inv.client.id;
      const existing = clientRevenue.get(clientId) || {
        name: inv.client.user.name || inv.client.user.email || "Unknown",
        revenue: 0,
      };
      existing.revenue += parseFloat(inv.amountPaid);
      clientRevenue.set(clientId, existing);
    }
  });
  const topClients = Array.from(clientRevenue.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Service breakdown
  const serviceBreakdown = new Map<string, { count: number; revenue: number }>();
  yearRecords.forEach((rec) => {
    const serviceName = rec.serviceType.name;
    const existing = serviceBreakdown.get(serviceName) || { count: 0, revenue: 0 };
    existing.count += 1;
    existing.revenue += parseFloat(rec.total);
    serviceBreakdown.set(serviceName, existing);
  });
  const serviceStats = Array.from(serviceBreakdown.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

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
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Revenue and business insights
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invoiced ({selectedYear})</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
              {yearlyTotals.invoiced.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Collected ({selectedYear})</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2 text-green-600">
              <TrendingUp className="h-6 w-6" />
              ${yearlyTotals.collected.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Services Delivered</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Calendar className="h-6 w-6 text-muted-foreground" />
              {yearlyTotals.serviceCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-3xl">
              ${currentMonthData?.collected.toFixed(2) || "0.00"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {currentMonthData?.serviceCount || 0} services
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Services</TableHead>
                  <TableHead className="text-right">Invoiced</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((data) => (
                  <TableRow key={data.month}>
                    <TableCell className="font-medium">{data.month}</TableCell>
                    <TableCell className="text-right">{data.serviceCount}</TableCell>
                    <TableCell className="text-right">${data.invoiced.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-green-600">
                      ${data.collected.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{yearlyTotals.serviceCount}</TableCell>
                  <TableCell className="text-right">${yearlyTotals.invoiced.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-green-600">
                    ${yearlyTotals.collected.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Service Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Service Breakdown ({selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No services recorded</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceStats.map((service) => (
                    <TableRow key={service.name}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-right">{service.count}</TableCell>
                      <TableCell className="text-right">${service.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Clients ({selectedYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topClients.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No paid invoices</p>
            ) : (
              <div className="space-y-4">
                {topClients.map((client, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{client.name}</span>
                    </div>
                    <span className="text-green-600 font-medium">
                      ${client.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax Summary ({selectedYear})
            </CardTitle>
            <CardDescription>
              For tax reporting purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">Gross Revenue</div>
                <div className="text-2xl font-bold">${yearlyTotals.invoiced.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600">Collected Revenue</div>
                <div className="text-2xl font-bold text-green-700">
                  ${yearlyTotals.collected.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Outstanding</div>
              <div className="text-xl font-bold">
                ${(yearlyTotals.invoiced - yearlyTotals.collected).toFixed(2)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              * This summary is for reference only. Please consult with a tax professional for official tax reporting.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
