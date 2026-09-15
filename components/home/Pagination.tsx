"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      return `${pathname}?${params.toString()}`;
    },
    [pathname, searchParams]
  );

  const goToPage = (page: number) => {
    router.push(createPageUrl(page), { scroll: false });
  };

  if (totalPages <= 1) return null;

  // Build page numbers to show
  const pages: (number | "ellipsis")[] = [];
  const delta = 1;
  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center gap-2"
    >
      {/* Previous */}
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-nordic-dark/10 bg-white text-nordic-dark hover:border-mosque hover:text-mosque transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="material-icons text-[20px]">chevron_left</span>
      </button>

      {/* Page Numbers */}
      {pages.map((p, idx) =>
        p === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-10 h-10 flex items-center justify-center text-nordic-muted text-sm select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => goToPage(p)}
            aria-current={p === currentPage ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all border ${
              p === currentPage
                ? "bg-nordic-dark text-white border-nordic-dark shadow-sm"
                : "bg-white text-nordic-dark border-nordic-dark/10 hover:border-mosque hover:text-mosque"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-nordic-dark/10 bg-white text-nordic-dark hover:border-mosque hover:text-mosque transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="material-icons text-[20px]">chevron_right</span>
      </button>

      {/* Page info */}
      <span className="text-sm text-nordic-muted ml-2">
        Página {currentPage} de {totalPages}
      </span>
    </nav>
  );
}
