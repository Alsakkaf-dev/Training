import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlass, Plus, FunnelSimple, X, Lightning } from "@phosphor-icons/react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useRealtimeEvent, useRealtimeStatus } from "../../lib/realtime";
import { useRouteRefresh } from "../../hooks/useRouteRefresh";
import ItemCard from "../../components/ItemCard";
import { CatalogSkeleton } from "../../components/Skeleton";
import { EmptyState, Button, Select, Chip, LiveDot } from "../../components/ui";

const CATEGORY_STYLES = {
  Textbooks: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "📚" },
  Electronics: { bg: "bg-blue-50", text: "text-blue-600", icon: "💻" },
  "Lab Tools": { bg: "bg-purple-50", text: "text-purple-600", icon: "🔬" },
  "Formal Wear": { bg: "bg-pink-50", text: "text-pink-600", icon: "👔" },
  "Engineering Tools": { bg: "bg-amber-50", text: "text-amber-600", icon: "🔧" },
  Other: { bg: "bg-slate-50", text: "text-slate-600", icon: "📦" },
};

export default function Catalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const status = useRealtimeStatus();
  const [meta, setMeta] = useState({ categories: [], conditions: [], colleges: [], faculties: [] });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(location.state?.category || "");
  const [condition, setCondition] = useState("");
  const [college, setCollege] = useState("");
  const [faculty, setFaculty] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [highlightId, setHighlightId] = useState(null);

  const filtersRef = useRef({});
  filtersRef.current = { q, category, condition, college, faculty };

  useEffect(() => {
    api.get("/items/meta").then(({ data }) => setMeta(data));
  }, []);

  useEffect(() => {
    if (location.state?.category) {
      setCategory(location.state.category);
    }
  }, [location.state?.category]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const f = filtersRef.current;
    const params = {};
    if (f.q) params.q = f.q;
    if (f.category) params.category = f.category;
    if (f.condition) params.condition = f.condition;
    if (f.college) params.college = f.college;
    if (f.faculty) params.faculty = f.faculty;
    const { data } = await api.get("/items", { params });
    setItems(data.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
  }, [q, category, condition, college, faculty, load]);

  // Live: refresh the catalog whenever anything changes anywhere, and briefly
  // highlight a freshly listed / returned item.
  const liveTimer = useRef(null);
  useRealtimeEvent("catalog.changed", (payload) => {
    if (payload?.reason === "created" || payload?.reason === "returned") {
      if (payload.item_id) {
        setHighlightId(payload.item_id);
        setTimeout(() => setHighlightId((cur) => (cur === payload.item_id ? null : cur)), 4500);
      }
    }
    clearTimeout(liveTimer.current);
    liveTimer.current = setTimeout(() => load(true), 200);
  });
  useRealtimeEvent("transaction.updated", () => {
    clearTimeout(liveTimer.current);
    liveTimer.current = setTimeout(() => load(true), 200);
  });

  useRouteRefresh(() => load(), "/catalog");

  const clearFilters = () => { setCategory(""); setCondition(""); setCollege(""); setFaculty(""); };
  const activeFilters = [category, condition, college, faculty].filter(Boolean).length;
  const featured = items.slice(0, 4);
  const showBrowseSections = !q && activeFilters === 0 && !category;

  return (
    <div className="animate-fade-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="label-eyebrow">Resource · Borrow</p>
          <h1 className="font-head font-extrabold text-[28px] leading-tight tracking-tight text-ink">
            Find & request items
          </h1>
          <p className="text-sm text-muted mt-1">Search the campus catalog and send borrow requests.</p>
        </div>
        <Button onClick={() => navigate("/items/new")} data-testid="create-item-btn" size="sm" className="!rounded-2xl">
          <Plus size={18} weight="bold" /> List
        </Button>
      </div>

      {/* Search — Resource.1 */}
      <div className="flex gap-2.5 mb-4">
        <div className="flex-1 flex items-center gap-2.5 bg-surface border border-line rounded-2xl px-4 h-12 shadow-soft focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 transition-all">
          <MagnifyingGlass size={19} className="text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items..."
            data-testid="catalog-search"
            className="flex-1 outline-none bg-transparent text-sm font-plex"
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          data-testid="toggle-filters"
          className={`relative w-12 h-12 rounded-2xl border flex items-center justify-center transition-all shadow-soft ${activeFilters ? "bg-brand-gradient text-white border-transparent shadow-glow-sm" : "bg-surface border-line text-ink hover:border-brand-300"}`}
        >
          <FunnelSimple size={20} weight={activeFilters ? "bold" : "regular"} />
          {activeFilters > 0 && <span className="absolute -top-1.5 -right-1.5 bg-status-cancelled text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-canvas">{activeFilters}</span>}
        </button>
      </div>

      {/* Featured this week — Resource.1 */}
      {showBrowseSections && !loading && featured.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-head font-bold text-base text-ink">Featured this week</h2>
            <button onClick={() => setQ("")} className="text-xs font-bold text-brand-600">View all →</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1 items-stretch">
            {featured.map((it, i) => (
              <div key={it.id} className="w-[200px] shrink-0 flex">
                <ItemCard item={it} index={i} highlight={highlightId === it.id} variant="carousel" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse by category grid — Resource.1 */}
      {showBrowseSections && meta.categories.length > 0 && (
        <div className="mb-5">
          <h2 className="font-head font-bold text-base text-ink mb-3">Browse by category</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {meta.categories.slice(0, 6).map((c) => {
              const style = CATEGORY_STYLES[c] || CATEGORY_STYLES.Other;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`${style.bg} border border-line rounded-3xl p-3.5 flex flex-col items-center gap-2 shadow-soft hover:border-brand-200 transition-colors`}
                  data-testid={`cat-grid-${c}`}
                >
                  <span className="text-2xl">{style.icon}</span>
                  <span className={`text-xs font-bold text-center ${style.text}`}>{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category chips (when filtering) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-1 px-1">
        <Chip active={!category} onClick={() => setCategory("")} data-testid="cat-all">All</Chip>
        {meta.categories.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)} data-testid={`cat-${c}`}>{c}</Chip>
        ))}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-surface border border-line rounded-3xl p-4 mb-4 grid grid-cols-2 gap-3 shadow-soft" data-testid="filter-panel">
              <Select label="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} data-testid="filter-condition">
                <option value="">Any</option>
                {meta.conditions.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select label="College" value={college} onChange={(e) => setCollege(e.target.value)} data-testid="filter-college">
                <option value="">Any</option>
                {meta.colleges.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select label="Faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} data-testid="filter-faculty">
                <option value="">Any</option>
                {meta.faculties.map((f) => <option key={f} value={f}>{f}</option>)}
              </Select>
              <div className="flex items-end">
                <button onClick={clearFilters} className="text-sm font-medium text-muted hover:text-status-cancelled flex items-center gap-1" data-testid="clear-filters"><X size={14} /> Clear all</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section label + live */}
      {!loading && items.length > 0 && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-head font-bold text-lg flex items-center gap-2">
            <Lightning size={18} weight="fill" className="text-brand-500" /> Available now
            <span className="text-muted font-plex font-medium text-sm">· {items.length}</span>
          </h2>
          <LiveDot status={status} />
        </div>
      )}

      {loading ? (
        <CatalogSkeleton count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No items found"
          subtitle="Try adjusting your search or filters, or be the first to list an item for your campus."
          action={<Button onClick={() => navigate("/items/new")}><Plus size={18} weight="bold" /> List an item</Button>}
        />
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-3.5" data-testid="catalog-grid">
          <AnimatePresence mode="popLayout">
            {items.map((it, i) => (
              <ItemCard key={it.id} item={it} index={i} highlight={highlightId === it.id} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
