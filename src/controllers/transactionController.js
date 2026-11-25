import { prisma } from "../lib/prisma.js";
import { snap } from "../config/midtrans.js";

const formatOrderNumber = (dateObj, seq) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `TR-${year}${month}${day}-${String(seq).padStart(4, "0")}`;
};

const normalizePaymentMethod = (raw) => {
  if (raw === 1) return "QRIS";
  if (raw === 2) return "CASH";
  const upper = String(raw ?? "CASH").toUpperCase();
  if (upper === "MIDTRANS") return "QRIS";
  if (["CASH", "QRIS", "TRANSFER", "E_WALLET"].includes(upper)) {
    return upper;
  }
  return "CASH";
};

const mapMidtransStatusToOrderStatus = (transactionStatus, fraudStatus) => {
  const txStatus = String(transactionStatus || "").toLowerCase();
  const fraud = String(fraudStatus || "").toLowerCase();

  if (txStatus === "capture") {
    return fraud === "challenge" ? "PENDING" : "PAID";
  }
  if (txStatus === "settlement") {
    return "PAID";
  }
  if (["cancel", "deny", "expire"].includes(txStatus)) {
    return "CANCELLED";
  }
  return "PENDING";
};

const extractBaseOrderNumber = (midtransOrderId) => {
  const raw = String(midtransOrderId || "").trim();
  const match = raw.match(/^(TR-\d{8}-\d+)(?:-\d+)?$/);
  return match ? match[1] : raw;
};

export const createTransaction = async (req, res) => {
  try {
    const {
      order_number,
      orderNumber,
      payment_method,
      paymentMethod,
      tax = 0,
      items = [],
      pay = 0,
    } = req.body;

    const userId = req.user?.id ?? req.body.userId ?? req.body.user_id ?? null;
    const method = normalizePaymentMethod(paymentMethod ?? payment_method);

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Items are required",
      });
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      const preparedItems = [];
      let itemsSubtotal = 0;

      for (const item of items) {
        const productId = Number(item.productId ?? item.product_id);
        const quantity = Number(item.quantity ?? item.qty);

        if (!Number.isInteger(productId) || productId <= 0 || quantity <= 0) {
          throw new Error("Invalid item productId or quantity");
        }

        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error(`Product ID ${productId} not found`);
        }

        if (Number(product.stock) < quantity) {
          throw new Error(`Insufficient stock for ${product.nama}`);
        }

        const rawPrice = item.unitPrice ?? item.price ?? product.price ?? 0;
        const unitPrice = Number(rawPrice);
        const lineSubtotal = unitPrice * quantity;
        itemsSubtotal += lineSubtotal;

        await tx.product.update({
          where: { id: productId },
          data: {
            stock: { decrement: quantity },
          },
        });

        preparedItems.push({
          productId,
          productName: product.nama,
          quantity,
          unitPrice,
          subtotal: lineSubtotal,
        });
      }

      const taxAmount = Number(tax || 0);
      const totalAmount = itemsSubtotal + taxAmount;

      let change = 0;
      let cashReceive = 0;
      let status = "PENDING";

      if (method === "CASH") {
        cashReceive = Number(pay);
        if (cashReceive < totalAmount) {
          throw new Error("Cash less than the total");
        }
        change = cashReceive - totalAmount;
        status = "PAID";
      }

      const inputOrderNum = orderNumber ?? order_number;
      let finalOrderNumber = inputOrderNum;

      if (!finalOrderNumber) {
        const now = new Date();
        const todayPrefix = `TR-${now.getFullYear()}${String(
          now.getMonth() + 1,
        ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-`;

        const lastOrder = await tx.order.findFirst({
          where: { orderNumber: { startsWith: todayPrefix } },
          orderBy: { id: "desc" },
          select: { orderNumber: true },
        });

        let nextSeq = 1;
        if (lastOrder?.orderNumber) {
          const lastPart = parseInt(lastOrder.orderNumber.split("-")[2], 10);
          if (!isNaN(lastPart)) nextSeq = lastPart + 1;
        }
        finalOrderNumber = formatOrderNumber(now, nextSeq);
      }

      const order = await tx.order.create({
        data: {
          orderNumber: finalOrderNumber,
          userId,
          paymentMethod: method,
          status,
          totalAmount,
          items: {
            create: preparedItems.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              subtotal: it.subtotal,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return {
        order,
        preparedItems,
        itemsSubtotal,
        taxAmount,
        totalAmount,
        cashReceive,
        change,
      };
    });

    const {
      order,
      preparedItems,
      itemsSubtotal,
      taxAmount,
      totalAmount,
      cashReceive,
      change,
    } = createdOrder;

    let midtransResponse = null;
    if (method !== "CASH") {
      const itemDetails = preparedItems.map((it) => ({
        id: String(it.productId),
        price: Number(it.unitPrice),
        quantity: Number(it.quantity),
        name: it.productName,
      }));

      if (taxAmount > 0) {
        itemDetails.push({
          id: "TAX",
          price: taxAmount,
          quantity: 1,
          name: "Tax",
        });
      }

      const grossAmount = itemDetails.reduce(
        (sum, d) => sum + Number(d.price) * Number(d.quantity),
        0,
      );

      const parameter = {
        transaction_details: {
          order_id: order.orderNumber,
          gross_amount: grossAmount,
        },
        callbacks: {
          finish: `${process.env.FRONTEND_URL || "https://warung-madara-fe.vercel.app"}/transaction/print`,
        },
        enable_payments: ["gopay"],
        item_details: itemDetails,
      };

      midtransResponse = await snap.createTransaction(parameter);
    }

    return res.status(201).json({
      status: true,
      message:
        method !== "CASH"
          ? "Order Berhasil silahkan bayar dengan gopay"
          : "payment cash berhasil",
      order_id: order.id,
      order_number: order.orderNumber,
      payment_method: order.paymentMethod,
      subtotal: itemsSubtotal,
      tax: taxAmount,
      total: totalAmount,
      items: preparedItems.map((it) => ({
        product_id: it.productId,
        nama: it.productName,
        qty: it.quantity,
        price: it.unitPrice,
        subtotal: it.subtotal,
      })),
      payment_details:
        method === "CASH"
          ? {
              total: totalAmount,
              cashReceive,
              change,
            }
          : null,
      payment_gateway: midtransResponse
        ? {
            token: midtransResponse.token,
            redirect_url: midtransResponse.redirect_url,
          }
        : null,
    });
  } catch (error) {
    const isClientError =
      error.message === "Cash less than the total" ||
      error.message.startsWith("Insufficient stock") ||
      error.message.endsWith("not found") ||
      error.message === "Invalid item productId or quantity";

    return res.status(isClientError ? 400 : 500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getAllTransaction = async (req, res) => {
  try {
    const ordersRaw = await prisma.order.findMany({
      orderBy: { id: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
    });

    const orders = ordersRaw.map((ord) => ({
      id: ord.id,
      order_number: ord.orderNumber,
      payment_method: ord.paymentMethod,
      total: ord.totalAmount,
      status: ord.status,
      created_at: ord.createdAt,
      items: (ord.items || []).map((it) => ({
        product_id: it.productId,
        qty: it.quantity,
        price: it.unitPrice,
        subtotal: it.subtotal,
        nama: it.product?.nama ?? null,
      })),
    }));

    return res.status(200).json({
      status: true,
      data: orders,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const continueTransaction = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid transaction id",
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        status: false,
        message: "Transaction not found",
      });
    }

    if (String(order.status).toUpperCase() === "PAID") {
      return res.status(400).json({
        status: false,
        message: "Transaction is already paid",
      });
    }

    const markPaid = Boolean(req.body?.markPaid);

    if (markPaid || order.paymentMethod === "CASH") {
      const updated = await prisma.order.update({
        where: { id },
        data: { status: "PAID" },
      });

      return res.status(200).json({
        status: true,
        message: "Transaction marked as PAID",
        data: {
          id: updated.id,
          order_number: updated.orderNumber,
          payment_method: updated.paymentMethod,
          total: updated.totalAmount,
          status: updated.status,
        },
      });
    }

    const itemDetails = (order.items || []).map((it) => ({
      id: String(it.productId),
      price: Number(it.unitPrice),
      quantity: Number(it.quantity),
      name: it.product?.nama || `Item #${it.productId}`,
    }));

    const itemsSum = itemDetails.reduce(
      (sum, d) => sum + Number(d.price) * Number(d.quantity),
      0,
    );
    const grossAmount = Math.max(Number(order.totalAmount || 0), itemsSum);
    const diffTax = grossAmount - itemsSum;

    if (diffTax > 0) {
      itemDetails.push({
        id: "TAX",
        price: diffTax,
        quantity: 1,
        name: "Tax",
      });
    }

    const parameter = {
      transaction_details: {
        order_id: `${order.orderNumber}-${Date.now()}`,
        gross_amount: grossAmount,
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL || "https://warung-madara-fe.vercel.app"}/transaction/print?order_id=${encodeURIComponent(order.orderNumber)}`,
      },
      enable_payments: ["gopay"],
      item_details: itemDetails,
    };

    const midtransResponse = await snap.createTransaction(parameter);

    return res.status(200).json({
      status: true,
      message: "Silahkan lanjutkan pembayaran",
      order_id: order.id,
      order_number: order.orderNumber,
      payment_method: order.paymentMethod,
      total: order.totalAmount,
      status_order: order.status,
      payment_gateway: {
        token: midtransResponse.token,
        redirect_url: midtransResponse.redirect_url,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const midtransNotification = async (req, res) => {
  try {
    const body = req.body || {};
    const baseOrderNumber = extractBaseOrderNumber(body.order_id);
    const nextStatus = mapMidtransStatusToOrderStatus(
      body.transaction_status,
      body.fraud_status,
    );

    if (!baseOrderNumber) {
      return res
        .status(400)
        .json({ status: false, message: "order_id is required" });
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber: baseOrderNumber },
    });

    if (!order) {
      return res
        .status(404)
        .json({ status: false, message: "Order not found" });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: nextStatus },
    });

    return res.status(200).json({
      status: true,
      message: "Notification processed",
      order_number: order.orderNumber,
      order_status: nextStatus,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const syncTransactionStatus = async (req, res) => {
  try {
    const rawOrderId =
      req.query.order_id ?? req.params.orderNumber ?? req.body?.order_id;
    const txStatusQuery =
      req.query.transaction_status ?? req.body?.transaction_status;

    if (!rawOrderId) {
      return res
        .status(400)
        .json({ status: false, message: "order_id is required" });
    }

    const baseOrderNumber = extractBaseOrderNumber(rawOrderId);
    const order = await prisma.order.findFirst({
      where: { orderNumber: baseOrderNumber },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, nama: true },
            },
          },
        },
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });
    }

    let resolvedStatus = order.status;

    if (typeof snap?.transaction?.status === "function") {
      try {
        const midtransInfo = await snap.transaction.status(rawOrderId);
        resolvedStatus = mapMidtransStatusToOrderStatus(
          midtransInfo?.transaction_status,
          midtransInfo?.fraud_status,
        );
      } catch {
        if (txStatusQuery) {
          resolvedStatus = mapMidtransStatusToOrderStatus(
            txStatusQuery,
            "accept",
          );
        }
      }
    } else if (txStatusQuery) {
      resolvedStatus = mapMidtransStatusToOrderStatus(txStatusQuery, "accept");
    }

    const updatedOrder =
      resolvedStatus !== order.status
        ? await prisma.order.update({
            where: { id: order.id },
            data: { status: resolvedStatus },
            include: {
              items: {
                include: {
                  product: { select: { id: true, nama: true } },
                },
              },
            },
          })
        : order;

    return res.status(200).json({
      status: true,
      data: {
        id: updatedOrder.id,
        order_number: updatedOrder.orderNumber,
        payment_method: updatedOrder.paymentMethod,
        total: updatedOrder.totalAmount,
        status: updatedOrder.status,
        created_at: updatedOrder.createdAt,
        items: (updatedOrder.items || []).map((it) => ({
          product_id: it.productId,
          qty: it.quantity,
          price: it.unitPrice,
          subtotal: it.subtotal,
          nama: it.product?.nama ?? null,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid transaction id",
      });
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new Error("Transaction not found");
      }

      for (const item of order.items || []) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: Number(item.quantity || 0) },
          },
        });
      }

      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      await tx.order.delete({
        where: { id },
      });
    });

    return res.status(200).json({
      status: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    const statusCode = error.message === "Transaction not found" ? 404 : 500;
    return res.status(statusCode).json({
      status: false,
      message: error.message,
    });
  }
};