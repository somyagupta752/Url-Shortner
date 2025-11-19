"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Url } from "@prisma/client";
import React, { use, useEffect, useState } from "react";

const page = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState(null);
  const [data, setData] = useState<Url[]>([]);
  const [search, setSearch] = useState("");
  const [minClicks, setMinClicks] = useState<string>("");
  const [maxClicks, setMaxClicks] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteCode, setPendingDeleteCode] = useState<string | null>(null);

  const fetchData = async (params?: {
    search?: string;
    minClicks?: string;
    maxClicks?: string;
    page?: number;
    pageSize?: number;
  }) => {
    setIsFetching(true);
    try {
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.minClicks !== undefined && params?.minClicks !== "")
        query.set("minClicks", params.minClicks);
      if (params?.maxClicks !== undefined && params?.maxClicks !== "")
        query.set("maxClicks", params.maxClicks);
      if (params?.page) query.set("page", String(params.page));
      if (params?.pageSize) query.set("pageSize", String(params.pageSize));

      const url = `/api/links${query.toString() ? `?${query.toString()}` : ""}`;
      const response = await fetch(url);
      const result = await response.json();
      setData(result.data || []);
      setTotal(typeof result.total === 'number' ? result.total : 0);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchData({ page: currentPage, pageSize });
  }, []);

  const handleClick = async () => {
    //handle shorten url click
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, code }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const short = origin ? `${origin}/${data.code}` : data.code;
        setResult(short);
        // keep code in state so copy button always uses the correct code
        setCode(data.code);
        // refetch table after creating new short url
        fetchData({ search, minClicks, maxClicks, page: currentPage, pageSize });
      } else {
        setError(data.error);
      }
    } catch (err: unknown) {
      console.error(err);
      setError((err as any).error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (code: string) => {
    const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const short = origin ? `${origin}/${code}` : code;
    try {
      await navigator.clipboard.writeText(short);
    } catch (err) {
      // ignore copy errors
    }
  };

  // open custom confirm modal
  const handleDelete = (code: string) => {
    setPendingDeleteCode(code);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const code = pendingDeleteCode;
    if (!code) return;
    setDeletingCode(code);
    try {
      const res = await fetch(`/api/links/${encodeURIComponent(code)}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to delete");
      } else {
        // refetch current page
        fetchData({ search, minClicks, maxClicks, page: currentPage, pageSize });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete link");
    } finally {
      setDeletingCode(null);
      setPendingDeleteCode(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setPendingDeleteCode(null);
    setShowDeleteModal(false);
  };

  // close modal on Escape
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelDelete();
    };
    if (showDeleteModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDeleteModal]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-b from-[#001219] via-[#001e2b] to-[#041025] text-slate-100 py-12">
      {/* Decorative background shapes */}
      <div
        aria-hidden
        className="absolute -top-40 -left-44 w-[700px] h-[700px] transform-gpu rotate-12 opacity-25"
        style={{
          background: 'linear-gradient(135deg,#7c3aed 0%,#06b6d4 100%)',
          clipPath: 'polygon(0 0, 100% 10%, 85% 100%, 0% 85%)',
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-52 -right-40 w-[600px] h-[600px] transform-gpu -rotate-12 opacity-20"
        style={{
          background: 'linear-gradient(180deg,#ef4444 0%,#f97316 100%)',
          clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 0 100%)',
        }}
      />

      <main className="relative z-10 max-w-6xl mx-auto px-4">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-cyan-200 via-indigo-200 to-pink-200">URL Shortener</h1>
          
        </header>

        <section className="p-6 rounded-2xl bg-white/5 ring-1 ring-white/6 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="md:col-span-2">
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  className="w-full md:flex-auto"
                  type="text"
                  placeholder="Enter your long url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Input
                  className="w-full md:w-48"
                  type="text"
                  placeholder="Short code (optional)"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <Button onClick={handleClick} className="w-full md:w-auto whitespace-nowrap">
                  {isLoading ? 'Shortening...' : 'Shorten'}
                </Button>
              </div>
              {error ? (
                <div className="mt-3 p-3 rounded-xl bg-red-900/20 ring-1 ring-red-600/20 backdrop-blur-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-red-600 text-white font-bold">!</div>
                    <div className="text-sm text-red-200 wrap-break-word max-w-[60ch]">{error}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setError(null)}
                      className="text-sm text-red-100/90 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : null}
              {result ? (
                <div className="mt-4 p-3 rounded-xl bg-white/6 ring-1 ring-white/8 backdrop-blur-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded bg-linear-to-r from-cyan-400 to-indigo-500 text-black font-medium">Shortened</div>
                    <a href={result} target="_blank" rel="noreferrer" className="text-cyan-200 underline wrap-break-word max-w-[60ch]">{result}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleCopy(code)} className="bg-cyan-500 hover:bg-cyan-400 text-black">Copy</Button>
                    <a href={result} target="_blank" rel="noreferrer" className="text-sm text-slate-300 underline">Open</a>
                  </div>
                </div>
              ) : null}
            </div>

          </div>
        </section>

        {/* Search & Filters - moved to its own row */}
        <section className="mt-4 p-4 rounded-2xl bg-white/4 ring-1 ring-white/6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <Input className="flex-1 w-full" placeholder="Search by code or url" value={search} onChange={(e)=>setSearch(e.target.value)} />
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  className="w-20 md:w-28"
                  type="text"
                  placeholder="Min"
                  value={minClicks}
                  onChange={(e) => setMinClicks(e.target.value.replace(/[^0-9]/g, ""))}
                />
                <Input
                  className="w-20 md:w-28"
                  type="text"
                  placeholder="Max"
                  value={maxClicks}
                  onChange={(e) => setMaxClicks(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setCurrentPage(1);
                    fetchData({ search, minClicks, maxClicks, page: 1, pageSize });
                  }}
                  disabled={isFetching}
                >
                  {isFetching ? "Filtering..." : "Filter"}
                </Button>
                <Button
                  className="text-black"
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setMinClicks("");
                    setMaxClicks("");
                    setCurrentPage(1);
                    fetchData({ page: 1, pageSize });
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-400 max-w-6xl mx-auto">{isFetching ? 'Loading results...' : `Showing ${data.length} item(s)`}</div>
        </section>

        {/* Delete confirmation modal */}
        {showDeleteModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelDelete} />
            <div className="relative z-10 w-full max-w-md p-6 rounded-2xl bg-[#071023] ring-1 ring-white/6 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Confirm delete</h3>
              <p className="text-sm text-slate-300 mb-4">Are you sure you want to delete <strong className="text-cyan-200">{pendingDeleteCode}</strong>? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button onClick={cancelDelete} className="px-3 py-2 rounded bg-white/5 text-slate-200">Cancel</button>
                <button onClick={confirmDelete} disabled={!!deletingCode} className="px-3 py-2 rounded bg-red-600 text-white">{deletingCode ? 'Deleting...' : 'Delete'}</button>
              </div>
            </div>
          </div>
        ) : null}

        <section className="mt-8">
          <div className="overflow-x-auto rounded-2xl ring-1 ring-white/6 bg-white/3">
            <table className="min-w-full table-auto">
              <thead className="bg-white/6 text-left">
                <tr>
                  <th className="px-4 py-3">Short Code</th>
                  <th className="px-4 py-3">Target URL</th>
                  <th className="px-4 py-3 hidden md:table-cell">Total Clicks</th>
                  <th className="px-4 py-3 hidden md:table-cell">Last Clicked</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                <tr key={item.id} className="border-t border-white/6 hover:bg-white/2">
            <td className="px-4 py-3 font-mono">
              <a href={`/code/${encodeURIComponent(item.code)}`} className="text-cyan-200 underline">{item.code}</a>
            </td>
                    <td className="px-4 py-3">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-cyan-200 underline wrap-break-word">
                        {item.url.length > 60 ? item.url.substring(0,60) + '...' : item.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">{item.clicks}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{item.lastClicked ? new Date(item.lastClicked).toLocaleString() : 'Never'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleCopy(item.code)} className="px-2 py-1 text-xs rounded bg-white/5 text-cyan-200">Copy</button>
                        <button
                          onClick={() => handleDelete(item.code)}
                          className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                          disabled={deletingCode === item.code}
                        >
                          {deletingCode === item.code ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            <div className="mt-4 flex items-center justify-between px-2">
              <div className="text-sm text-slate-300">Total: {total}</div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded bg-white/5"
                  onClick={() => {
                    const p = Math.max(1, currentPage - 1);
                    setCurrentPage(p);
                    fetchData({ search, minClicks, maxClicks, page: p, pageSize });
                  }}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <div className="text-sm">Page {currentPage} of {Math.max(1, Math.ceil(total / pageSize))}</div>
                <button
                  className="px-3 py-1 rounded bg-white/5"
                  onClick={() => {
                    const maxPage = Math.max(1, Math.ceil(total / pageSize));
                    const p = Math.min(maxPage, currentPage + 1);
                    setCurrentPage(p);
                    fetchData({ search, minClicks, maxClicks, page: p, pageSize });
                  }}
                  disabled={currentPage >= Math.max(1, Math.ceil(total / pageSize))}
                >
                  Next
                </button>
                <select
                  className="bg-transparent text-sm ml-2"
                  value={pageSize}
                  onChange={(e) => {
                    const ps = Number(e.target.value);
                    setPageSize(ps);
                    setCurrentPage(1);
                    fetchData({ search, minClicks, maxClicks, page: 1, pageSize: ps });
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default page;
