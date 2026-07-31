"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  Copy,
  CreditCard,
  ReceiptText,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import Card from "@/app/components/ui/Card";
import Loader from "@/app/components/ui/Loader";
import { useTransactions } from "@/app/lib/hooks/payment/useTransactions";
import type { PaymentStatus, Transaction } from "@/app/lib/types/payment.types";

const statusStyles: Record<PaymentStatus, string> = {
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  failed:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  created:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  cancelled:
    "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  refunded:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300",
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount / 100);

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function CopyValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <code className="truncate rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
        {value}
      </code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 text-zinc-400 transition hover:text-indigo-500"
        aria-label={`Copy ${value}`}
      >
        <Copy size={14} />
      </button>
      {copied ? (
        <span className="text-xs text-emerald-600 dark:text-emerald-400">
          Copied
        </span>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-zinc-100 py-3 last:border-0 sm:grid-cols-[10rem_1fr] sm:gap-4 dark:border-zinc-800">
      <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="min-w-0 text-sm text-zinc-800 dark:text-zinc-200">
        {children}
      </dd>
    </div>
  );
}

function TransactionDetails({ transaction }: { transaction: Transaction }) {
  const metadata = Object.entries(transaction.metadata);
  return (
    <div className="border-t border-zinc-200 bg-zinc-50/70 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/30 sm:px-6">
      <div className="grid gap-x-10 lg:grid-cols-2">
        <dl>
          <DetailRow label="Transaction ID">
            <CopyValue value={transaction.id} />
          </DetailRow>
          <DetailRow label="Order ID">
            <CopyValue value={transaction.gatewayOrderId} />
          </DetailRow>
          <DetailRow label="Payment ID">
            {transaction.gatewayPaymentId ? (
              <CopyValue value={transaction.gatewayPaymentId} />
            ) : (
              "Not available"
            )}
          </DetailRow>
          <DetailRow label="Receipt">
            {transaction.gatewayReceipt ? (
              <CopyValue value={transaction.gatewayReceipt} />
            ) : (
              "Not available"
            )}
          </DetailRow>
          <DetailRow label="Gateway status">
            {transaction.gatewayStatus || "Not available"}
          </DetailRow>
        </dl>
        <dl>
          <DetailRow label="Payment method">
            {transaction.paymentMethod || "Not available"}
          </DetailRow>
          <DetailRow label="Paid on">
            {formatDate(transaction.paidAt)}
          </DetailRow>
          <DetailRow label="Refunded on">
            {formatDate(transaction.refundedAt)}
          </DetailRow>
          <DetailRow label="Last updated">
            {formatDate(transaction.updatedAt)}
          </DetailRow>
          <DetailRow label="App details">
            {transaction.app
              ? `${transaction.app.packageName || "No package name"} · v${transaction.app.version || "—"} · ${transaction.app.status || "—"}`
              : "The linked app is no longer available"}
          </DetailRow>
        </dl>
      </div>
      {transaction.failureReason ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <span className="font-semibold">Failure reason: </span>
          {transaction.failureReason}
        </div>
      ) : null}
      {metadata.length ? (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Additional metadata
          </p>
          <pre className="mt-2 overflow-x-auto text-xs text-zinc-600 dark:text-zinc-300">
            {JSON.stringify(transaction.metadata, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="overflow-hidden border-b border-zinc-200 last:border-0 dark:border-zinc-800">
      <div className="grid items-center gap-4 px-5 py-4 sm:grid-cols-[minmax(12rem,1.5fr)_minmax(8rem,1fr)_8rem_7rem_auto] sm:px-6">
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-900 dark:text-white">
            {transaction.app?.name || "Deleted app"}
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500">
            {transaction.gatewayOrderId}
          </p>
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          <p>{formatDate(transaction.createdAt)}</p>
          <p className="mt-1 text-xs capitalize text-zinc-500">
            {transaction.gateway}
          </p>
        </div>
        <p className="font-semibold text-zinc-900 dark:text-white">
          {formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <StatusBadge status={transaction.status} />
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
          aria-expanded={expanded}
        >
          Details{" "}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      {expanded ? <TransactionDetails transaction={transaction} /> : null}
    </div>
  );
}

export default function TransactionsPage() {
  const { data: transactions = [], isLoading, isError } = useTransactions();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "amount-high" | "amount-low" | "status"
  >("newest");
  const hasActiveFilters = Boolean(
    fromDate || toDate || query || status !== "all" || sortBy !== "newest",
  );

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setQuery("");
    setStatus("all");
    setSortBy("newest");
  };

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const start = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const end = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    return transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        const matchesDate =
          (!start || transactionDate >= start) &&
          (!end || transactionDate <= end);
        const matchesStatus = status === "all" || transaction.status === status;
        const searchableValues = [
          transaction.id,
          transaction.amount.toString(),
          transaction.currency,
          transaction.gateway,
          transaction.status,
          transaction.gatewayStatus,
          transaction.gatewayOrderId,
          transaction.gatewayPaymentId,
          transaction.gatewayReceipt,
          transaction.paymentMethod,
          transaction.failureReason,
          transaction.createdAt,
          transaction.paidAt,
          transaction.refundedAt,
          transaction.app?.id,
          transaction.app?.name,
          transaction.app?.platform,
          transaction.app?.packageName,
          transaction.app?.version,
          transaction.app?.status,
          JSON.stringify(transaction.metadata),
        ];
        const matchesQuery =
          !normalizedQuery ||
          searchableValues
            .filter((value): value is string => Boolean(value))
            .some((value) => value.toLowerCase().includes(normalizedQuery));
        return matchesDate && matchesStatus && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === "oldest")
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        if (sortBy === "amount-high") return b.amount - a.amount;
        if (sortBy === "amount-low") return a.amount - b.amount;
        if (sortBy === "status") return a.status.localeCompare(b.status);
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [fromDate, query, sortBy, status, toDate, transactions]);

  const summary = useMemo(
    () => ({
      total: filtered.length,
      value: filtered.reduce((total, item) => total + item.amount, 0),
      successful: filtered.filter((item) => item.status === "success"),
      pending: filtered.filter((item) =>
        ["created", "pending"].includes(item.status),
      ),
      failed: filtered.filter((item) =>
        ["failed", "cancelled"].includes(item.status),
      ),
    }),
    [filtered],
  );

  const successfulAmount = summary.successful.reduce(
    (total, item) => total + item.amount,
    0,
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Payments
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Transactions
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Review every payment attempt, its linked app, gateway references,
            and current status.
          </p>
        </div>
        <p className="text-sm text-zinc-500">
          {filtered.length} of {transactions.length} transaction
          {transactions.length === 1 ? "" : "s"} shown
        </p>
      </div>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Card className="flex min-h-72 items-center justify-center">
          <p className="text-red-600 dark:text-red-400">
            Couldn’t load transactions. Please try again.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">
                    Transactions in selection
                  </p>
                  <p className="mt-1 text-2xl font-bold">{summary.total}</p>
                  <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(summary.value, "INR")} total value
                  </p>
                </div>
                <ReceiptText className="text-indigo-500" />
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Successful payments</p>
                  <p className="mt-1 text-2xl font-bold">
                    {summary.successful.length}
                  </p>
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(successfulAmount, "INR")} received
                  </p>
                </div>
                <CheckCircle2 className="text-emerald-500" />
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Awaiting completion</p>
                  <p className="mt-1 text-2xl font-bold">
                    {summary.pending.length}
                  </p>
                </div>
                <Clock3 className="text-amber-500" />
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Failed or cancelled</p>
                  <p className="mt-1 text-2xl font-bold">
                    {summary.failed.length}
                  </p>
                </div>
                <CircleAlert className="text-red-500" />
              </div>
            </Card>
          </div>

          <Card className="p-0">
            <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-md">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={17}
                  />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search any transaction or app detail..."
                    className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SlidersHorizontal size={17} className="text-zinc-400" />
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as PaymentStatus | "all")
                    }
                    aria-label="Filter by payment status"
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="all">All statuses</option>
                    <option value="success">Success</option>
                    <option value="created">Created</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(event.target.value as typeof sortBy)
                    }
                    aria-label="Sort transactions"
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="amount-high">Amount: high to low</option>
                    <option value="amount-low">Amount: low to high</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="grid gap-1 text-xs font-medium text-zinc-500">
                  From date
                  <input
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    type="date"
                    max={toDate || undefined}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </label>
                <label className="grid gap-1 text-xs font-medium text-zinc-500">
                  To date
                  <input
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    type="date"
                    min={fromDate || undefined}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </label>
                <button
                  type="button"
                  disabled={!hasActiveFilters}
                  onClick={clearFilters}
                  className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500/60 dark:hover:text-indigo-300"
                >
                  Clear all filters
                </button>
              </div>
            </div>
            {filtered.length ? (
              <div>
                <div className="hidden grid-cols-[minmax(12rem,1.5fr)_minmax(8rem,1fr)_8rem_7rem_auto] gap-4 border-b border-zinc-200 bg-zinc-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:grid dark:border-zinc-800 dark:bg-zinc-950/50">
                  <span>Application / order</span>
                  <span>Date / gateway</span>
                  <span>Amount</span>
                  <span>Status</span>
                  <span />
                </div>
                {filtered.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                <CreditCard className="mb-3 text-zinc-400" size={32} />
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  No transactions found
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {transactions.length
                    ? "Try adjusting your search or status filter."
                    : "Your payment activity will appear here once you create an order."}
                </p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
