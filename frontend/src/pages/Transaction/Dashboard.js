import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, 
  MagnifyingGlass, Plus, 
  ChatTeardropText, Gear
} from "@phosphor-icons/react";
import { api } from "../../lib/api";
import { humanizeType } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import { useRealtimeEvent } from "../../lib/realtime";
import { useRouteRefresh } from "../../hooks/useRouteRefresh";
import { EmptyState, StatusBadge, UrgentBadge, Avatar } from "../../components/ui";
import UrgentBanner from "../../components/UrgentBanner";
import { ListSkeleton, Skeleton } from "../../components/Skeleton";
import { toast } from "../../components/Toast";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const { data: dashRes } = await api.get("/dashboard");
      setData(dashRes);

      const { data: notifRes } = await api.get("/notifications");
      setNotifications(notifRes.notifications.slice(0, 3));
    } catch (err) {
      console.error("Failed to load dashboard details:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useRouteRefresh(loadData, "/dashboard");

  // Realtime updates
  const t = useRef(null);
  useRealtimeEvent("transaction.updated", () => {
    clearTimeout(t.current);
    t.current = setTimeout(loadData, 200);
  });
  useRealtimeEvent("notification.new", () => {
    clearTimeout(t.current);
    t.current = setTimeout(loadData, 200);
  });

  if (loading || !data) return <PageLoader />;

  const { summary, borrowing, lending } = data;

  // Compile active activity from both borrowing and lending
  const activeActivities = [];
  borrowing.forEach(tx => {
    if (["Pending", "Approved", "Borrowed"].includes(tx.status)) {
      activeActivities.push({ ...tx, type: "borrowing" });
    }
  });
  lending.forEach(tx => {
    if (["Pending", "Approved", "Borrowed"].includes(tx.status)) {
      activeActivities.push({ ...tx, type: "lending" });
    }
  });

  return (
    <div className="animate-fade-up">
      <p className="label-eyebrow">Your activity</p>
      <h1 className="font-head font-extrabold text-3xl tracking-tight mb-5">Dashboard</h1>

      {/* Summary Widgets Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-3xl border border-line bg-surface p-4 shadow-card text-center flex flex-col items-center justify-center">
          <p className="font-head font-extrabold text-3xl tracking-tight text-brand-600 tabular-nums">{summary.total_borrowing}</p>
          <p className="label-eyebrow mt-1 !text-[9px]">Active requests</p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-4 shadow-card text-center flex flex-col items-center justify-center">
          <p className="font-head font-extrabold text-3xl tracking-tight text-emerald-600 tabular-nums">{summary.total_lending}</p>
          <p className="label-eyebrow mt-1 !text-[9px]">Items on loan</p>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-4 shadow-card text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 justify-center mt-1">
            <Star size={16} weight="fill" className="text-amber-400" />
            <span className="font-head font-extrabold text-2xl tracking-tight text-ink leading-none">{Number(user.trust_score).toFixed(1)}</span>
          </div>
          <p className="label-eyebrow mt-2.5 !text-[9px]">Reputation</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-6">
        <h2 className="font-head font-bold text-base text-ink mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/catalog")}
            className="bg-surface border border-line rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-soft"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
              <MagnifyingGlass size={18} weight="bold" />
            </div>
            <span className="text-[10px] font-bold text-ink leading-tight">Request</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/items/new")}
            className="bg-surface border border-line rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-soft"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <Plus size={18} weight="bold" />
            </div>
            <span className="text-[10px] font-bold text-ink leading-tight">List Item</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.info("Messaging is integrated with transactions and handovers.")}
            className="bg-surface border border-line rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-soft"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <ChatTeardropText size={18} weight="bold" />
            </div>
            <span className="text-[10px] font-bold text-ink leading-tight">Message</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/settings")}
            className="bg-surface border border-line rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-soft"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Gear size={18} weight="bold" />
            </div>
            <span className="text-[10px] font-bold text-ink leading-tight">Settings</span>
          </motion.button>
        </div>
      </div>

      <UrgentBanner
        count={summary.urgent_returns}
        onClick={() => {
          const urgent = activeActivities.find(
            (tx) => tx.status === "Borrowed" && tx.lease && (tx.lease.is_overdue || tx.lease.due_within_24h)
          );
          if (urgent) navigate(`/transactions/${urgent.id}`);
        }}
      />

      {/* Active Activity section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-head font-bold text-base text-ink">Active Activity</h2>
          <button onClick={() => navigate("/history")} className="text-xs font-bold text-brand-600">Full history →</button>
        </div>

        {activeActivities.length === 0 ? (
          <EmptyState
            title="No active commitments"
            subtitle="You have no active lending or borrowing commitments at this time."
          />
        ) : (
          <div className="space-y-3">
            {activeActivities.map((tx, idx) => {
              const urgent = tx.status === "Borrowed" && tx.lease && (tx.lease.is_overdue || tx.lease.due_within_24h);
              const counterparty = tx.type === "borrowing" ? tx.lender : tx.borrower;
              
              let textDetail = "";
              let titleColor = "";
              
              if (tx.status === "Pending") {
                textDetail = tx.type === "borrowing" 
                  ? `Pending approval from ${counterparty?.full_name?.split(" ")[0]}` 
                  : `Awaiting your approval for ${counterparty?.full_name?.split(" ")[0]}`;
              } else if (tx.status === "Approved") {
                textDetail = `Approved! Tap to coordinate handover meetup`;
                titleColor = "text-brand-600";
              } else if (tx.status === "Borrowed") {
                textDetail = tx.type === "borrowing"
                  ? `Due tomorrow or active loan: Return by ${tx.borrow_end_date}`
                  : `You lent to ${counterparty?.full_name?.split(" ")[0]} (active loan)`;
              }

              return (
                <motion.button
                  key={tx.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                  className={`w-full text-left bg-surface border border-line rounded-4xl p-4.5 flex items-center gap-4 shadow-card hover:border-brand-200 transition-colors min-h-[88px] ${
                    urgent ? "ring-2 ring-red-200 border-red-200 bg-red-50/30" : ""
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-brand-gradient">
                    {tx.item?.photo_url ? (
                      <img src={tx.item.photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-head font-bold text-2xl text-white/90">{tx.item?.title?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={tx.status} />
                      {urgent && <UrgentBadge overdue={tx.lease.is_overdue} />}
                    </div>
                    <p className="font-head font-bold text-base text-ink leading-snug">{tx.item?.title}</p>
                    <p className={`text-sm text-muted mt-1 leading-snug ${titleColor}`}>{textDetail}</p>
                  </div>
                  <ArrowRight size={20} className="text-slate-300 shrink-0" />
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Notifications section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-head font-bold text-base text-ink">Recent Notifications</h2>
          <button onClick={() => navigate("/notifications")} className="text-xs font-bold text-brand-600">View all →</button>
        </div>
        {notifications.length === 0 ? (
          <p className="text-xs text-muted leading-none">No notifications yet.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div 
                key={n.id}
                className={`p-3.5 rounded-2xl border text-left transition-colors bg-surface shadow-soft ${
                  n.is_read ? "border-line" : "border-brand-100 bg-brand-50/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">{humanizeType(n.notification_type)}</span>
                  {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                </div>
                <p className="text-xs text-ink mt-1.5 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Page Loader wrapper just in case
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Skeleton className="w-8 h-8 rounded-full animate-spin border-t-2 border-brand-600 border-slate-200" />
      <p className="mt-3 text-xs text-muted">Loading your dashboard…</p>
    </div>
  );
}
