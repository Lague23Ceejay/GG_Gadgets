import { useEffect, useMemo, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { AnalyticsOverview, CategoryDetail, ProductSalesRow } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = ["#5B5FEF", "#FFD23F", "#22C55E", "#EF4444", "#0EA5E9", "#F97316", "#A855F7", "#14B8A6"];

type SortKey = "name" | "units_sold" | "revenue" | "avg_price";

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<CategoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    api
      .get<AnalyticsOverview>("/analytics/overview")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = async (categoryId: number) => {
    if (activeCategoryId === categoryId) {
      setActiveCategoryId(null);
      setCategoryDetail(null);
      return;
    }
    setActiveCategoryId(categoryId);
    setDetailLoading(true);
    try {
      const detail = await api.get<CategoryDetail>(`/analytics/category/${categoryId}`);
      setCategoryDetail(detail);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();

    let rows = data.product_table;

    if (activeCategoryId) {
      const categoryName = data.category_breakdown.find((c) => c.category_id === activeCategoryId)?.name;
      rows = rows.filter((p) => categoryName && p.category_names.includes(categoryName));
    }

    if (query) {
      rows = rows.filter((p) => p.name.toLowerCase().includes(query));
    }

    const sorted = [...rows].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return sorted;
  }, [data, activeCategoryId, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;
  if (!data) return <p className="text-sm text-danger-500">Failed to load analytics.</p>;

  const pieData = {
    labels: data.category_breakdown.map((c) => c.name),
    datasets: [
      {
        data: data.category_breakdown.map((c) => c.revenue),
        backgroundColor: data.category_breakdown.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderWidth: 0,
      },
    ],
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-700">Sales analytics</h1>
      <p className="mt-1 text-sm text-zinc-500">Super Admin only.</p>

      {/* Row 1: KPI cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Gross Store Sales</p>
          <p className="mt-1 font-mono text-2xl font-semibold">
            ₱{data.kpis.gross_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Average Order Value</p>
          <p className="mt-1 font-mono text-2xl font-semibold">
            ₱{data.kpis.avg_order_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Rewards Fulfillment Cost</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-danger-500">
            ₱{data.kpis.rewards_fulfillment_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      {/* Row 2: Pie + category detail */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold">Revenue by category</p>
          {data.category_breakdown.length === 0 ? (
            <p className="text-sm text-zinc-500">No completed sales yet.</p>
          ) : (
            <Pie
              data={pieData}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (ctx) => {
                        const item = data.category_breakdown[ctx.dataIndex];
                        return `${item.name}: ${item.share_percent.toFixed(2)}% of Global Sales`;
                      },
                    },
                  },
                },
                onClick: (_evt, elements) => {
                  if (elements.length > 0) {
                    const item = data.category_breakdown[elements[0].index];
                    handleCategoryClick(item.category_id);
                  }
                },
              }}
            />
          )}
        </Card>

        <Card className="p-5">
          {!activeCategoryId ? (
            <p className="text-sm text-zinc-500">Click a category slice to see details.</p>
          ) : detailLoading ? (
            <p className="text-sm text-zinc-500">Loading…</p>
          ) : categoryDetail ? (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">{categoryDetail.name}</p>
                <button
                  onClick={() => {
                    setActiveCategoryId(null);
                    setCategoryDetail(null);
                  }}
                  className="text-sm text-accent-500 hover:underline"
                >
                  Clear Selection
                </button>
              </div>
              <dl className="mt-3 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Category Revenue</dt>
                  <dd className="font-mono">₱{categoryDetail.revenue.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Category Share</dt>
                  <dd className="font-mono">{categoryDetail.share_percent.toFixed(2)}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">MoM Growth</dt>
                  <dd className={`font-mono ${categoryDetail.mom_growth_percent >= 0 ? "text-success-600" : "text-danger-500"}`}>
                    {categoryDetail.mom_growth_percent >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(categoryDetail.mom_growth_percent).toFixed(2)}%
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">30-Day Volatility</dt>
                  <dd className="font-mono text-xs">
                    Max: ₱{categoryDetail.max_day_revenue.toFixed(2)} / Min: ₱{categoryDetail.min_day_revenue.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Section A: Commercial products table */}
      <Card className="mt-4 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">
            Product sales{activeCategoryId ? ` — filtered to ${categoryDetail?.name ?? "…"}` : ""}
          </p>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search products…"
            className="max-w-xs"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <tr>
                <SortableHeader label="Product" sortKey="name" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <th className="px-4 py-3">Category</th>
                <SortableHeader label="Units" sortKey="units_sold" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableHeader label="Avg Price" sortKey="avg_price" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <SortableHeader label="Revenue" sortKey="revenue" current={sortKey} dir={sortDir} onClick={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                    No matching products.
                  </td>
                </tr>
              )}
              {filteredProducts.map((p: ProductSalesRow) => (
                <tr key={p.product_id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.category_names}</td>
                  <td className="px-4 py-3 font-mono">{p.units_sold}</td>
                  <td className="px-4 py-3 font-mono">₱{p.avg_price.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono font-semibold">₱{p.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section B: Rewards table — always isolated, never filtered by search/category */}
      <Card className="mt-4 p-5">
        <p className="mb-3 text-sm font-semibold">Loyalty reward analytics</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Reward</th>
                <th className="px-4 py-3">Claims</th>
                <th className="px-4 py-3">Points Burned</th>
                <th className="px-4 py-3">Wholesale Cost</th>
                <th className="px-4 py-3">Popularity Share</th>
              </tr>
            </thead>
            <tbody>
              {data.rewards_table.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                    No redemptions yet.
                  </td>
                </tr>
              )}
              {data.rewards_table.map((r) => (
                <tr key={r.reward_id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                  <td className="px-4 py-3 font-medium">{r.item_name}</td>
                  <td className="px-4 py-3 font-mono">{r.claims_count}</td>
                  <td className="px-4 py-3 font-mono">{r.points_burned}</td>
                  <td className="px-4 py-3 font-mono">₱{r.wholesale_cost_total.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono">{r.popularity_share_percent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: "asc" | "desc";
  onClick: (key: SortKey) => void;
}) {
  return (
    <th className="cursor-pointer select-none px-4 py-3" onClick={() => onClick(sortKey)}>
      {label} {current === sortKey && (dir === "asc" ? "↑" : "↓")}
    </th>
  );
}