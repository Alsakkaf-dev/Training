import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { api } from "../lib/api";
import { useRealtimeEvent } from "../lib/realtime";
import { Button, Input, Select, Chip, PageLoader, EmptyState, SectionHeader } from "../components/ui";
import ItemCard from "../components/ItemCard";

export default function Catalog() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ categories: [], conditions: [], colleges: [], faculties: [] });
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [college, setCollege] = useState("");

  const load = useCallback(async () => {
    const params = {};
    if (q) params.q = q;
    if (category) params.category = category;
    if (condition) params.condition = condition;
    if (college) params.college = college;
    const { data } = await api.get("/items", { params });
    setItems(data.items || []);
    setLoading(false);
  }, [q, category, condition, college]);

  useEffect(() => {
    api.get("/items/meta").then(({ data }) => setMeta(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  useRealtimeEvent("catalog.changed", load);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="catalog-page">
      <SectionHeader
        eyebrow="Browse"
        title="Campus catalog"
        action={
          <Link to="/items/new">
            <Button data-testid="catalog-lend-cta"><Plus size={18} weight="bold" className="mr-1" /> Lend an item</Button>
          </Link>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 my-6" data-testid="catalog-filters">
        <Input icon={<MagnifyingGlass size={18} />} placeholder="Search items…" value={q} onChange={(e) => setQ(e.target.value)} data-testid="catalog-search" />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} data-testid="filter-category">
          <option value="">All categories</option>
          {meta.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={condition} onChange={(e) => setCondition(e.target.value)} data-testid="filter-condition">
          <option value="">Any condition</option>
          {meta.conditions.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={college} onChange={(e) => setCollege(e.target.value)} data-testid="filter-college">
          <option value="">Any college</option>
          {meta.colleges.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {(category || condition || college) && (
        <div className="flex flex-wrap gap-2 mb-5">
          {category && <Chip active onClick={() => setCategory("")}>{category} ✕</Chip>}
          {condition && <Chip active onClick={() => setCondition("")}>{condition} ✕</Chip>}
          {college && <Chip active onClick={() => setCollege("")}>{college} ✕</Chip>}
        </div>
      )}

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title="No items found" subtitle="Try adjusting your filters or be the first to lend something." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="catalog-grid">
          {items.map((it, i) => <ItemCard key={it.id} item={it} index={i} />)}
        </div>
      )}
    </div>
  );
}
