"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin-api";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "در انتظار بررسی",
  confirmed: "تأیید شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "var(--accent)",
  confirmed: "#4c7a3d",
  delivered: "#2e5eaa",
  cancelled: "var(--ink-soft)",
};

export default function AdminOrdersPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <OrdersList />
      </AdminShell>
    </AdminGuard>
  );
}

function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () => adminListOrders().then((data) => {
    setOrders(data);
    setLoading(false);
  });

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    await adminUpdateOrderStatus(id, status);
    load();
  };

  if (loading) return <p style={{ color: "var(--ink-soft)" }}>در حال بارگذاری...</p>;

  return (
    <div>
      <h1 className="text-2xl" style={{ color: "var(--ink)" }}>
        سفارشات ({orders.length})
      </h1>

      {orders.length === 0 ? (
        <p className="mt-6" style={{ color: "var(--ink-soft)" }}>هنوز سفارشی ثبت نشده.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-[var(--radius-md)] border p-4"
              style={{ borderColor: "var(--line)", background: "var(--surface)" }}
            >
              <div
                className="flex cursor-pointer flex-wrap items-center justify-between gap-3"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div>
                  <span style={{ color: "var(--ink)" }}>{order.customer_name}</span>
                  <span className="ms-2 font-mono text-sm" style={{ color: "var(--ink-soft)" }}>
                    {order.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm" style={{ color: "var(--accent)" }}>
                    {order.total_toman.toLocaleString("fa-IR")} تومان
                  </span>
                  <select
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={{ borderColor: "var(--line)", color: STATUS_COLOR[order.status] }}
                  >
                    {Object.entries(STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {expanded === order.id && (
                <div className="mt-4 border-t pt-4 text-sm" style={{ borderColor: "var(--line)" }}>
                  {order.address && (
                    <p style={{ color: "var(--ink-soft)" }}>📍 {order.address}</p>
                  )}
                  {order.notes && (
                    <p className="mt-1" style={{ color: "var(--ink-soft)" }}>📝 {order.notes}</p>
                  )}
                  <ul className="mt-3 flex flex-col gap-1">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex justify-between" style={{ color: "var(--ink)" }}>
                        <span>{item.name} × {item.qty}</span>
                        <span className="font-mono">{(item.price * item.qty).toLocaleString("fa-IR")}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs" style={{ color: "var(--ink-soft)" }}>
                    {new Date(order.created_at).toLocaleString("fa-IR")}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
