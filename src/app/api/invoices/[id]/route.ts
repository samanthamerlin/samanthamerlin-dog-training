import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateInvoiceSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PAID", "PARTIAL", "OVERDUE", "CANCELLED"]).optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

// GET - Get a single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            serviceRecord: {
              include: {
                serviceType: true,
                dog: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Non-admins can only view their own invoices
    if (session.user.role !== "ADMIN") {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!clientProfile || invoice.clientId !== clientProfile.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Clients can't see draft invoices
      if (invoice.status === "DRAFT") {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Failed to fetch invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

// PATCH - Update invoice (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateInvoiceSchema.parse(body);

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (validatedData.status) {
      updateData.status = validatedData.status;

      // If marking as paid, set paidAt
      if (validatedData.status === "PAID") {
        updateData.paidAt = new Date();
        updateData.amountPaid = invoice.total;
      }
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate);
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            serviceRecord: true,
          },
        },
        payments: true,
      },
    });

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to update invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// DELETE - Delete invoice (admin only, only drafts)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Only allow deleting draft invoices
    if (invoice.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Can only delete draft invoices" },
        { status: 400 }
      );
    }

    await prisma.invoice.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
