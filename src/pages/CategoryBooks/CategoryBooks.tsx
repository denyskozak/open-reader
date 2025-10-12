import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Title } from "@telegram-apps/telegram-ui";
import { useTranslation } from "react-i18next";

import { catalogApi, getCategoryTags } from "@/entities/book/api";
import type { Book, ID } from "@/entities/book/types";
import type { Category } from "@/entities/category/types";
import { BookCard } from "@/entities/book/components/BookCard";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useIntersectionObserver } from "@/shared/hooks/useIntersectionObserver";
import type { BookSort } from "@/shared/lib/bookSort";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorBanner } from "@/shared/ui/ErrorBanner";
import { BookCardSkeleton } from "@/shared/ui/Skeletons";
import { FiltersBar } from "@/widgets/FiltersBar/FiltersBar";

export default function CategoryBooks(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: ID }>();
  const { t, i18n } = useTranslation();
  const [category, setCategory] = useState<Category | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<BookSort>("popular");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const debouncedSearch = useDebouncedValue(search, 250);

  const language = i18n.language;
  const availableTags = useMemo(
    () => (id ? getCategoryTags(id, language) : []),
    [id, language],
  );
  const cursorRef = useRef<string | undefined>();

  const loadCategory = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      const allCategories = await catalogApi.listCategories();
      const current = allCategories.find((item) => item.id === id) ?? null;
      setCategory(current);
    } catch (err) {
      console.error(err);
      setError(t("errors.fetchCategory"));
    }
  }, [id, t]);

  const loadBooks = useCallback(
    async (reset = false) => {
      if (!id) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await catalogApi.listBooks({
          categoryId: id,
          cursor: reset ? undefined : cursorRef.current,
          search: debouncedSearch || undefined,
          sort,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        });
        setCursor(response.nextCursor);
        setBooks((prev) => (reset ? response.items : [...prev, ...response.items]));
      } catch (err) {
        console.error(err);
        setError(t("errors.loadBooks"));
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch, id, selectedTags, sort, t],
  );

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor]);

  useEffect(() => {
    void loadCategory();
  }, [loadCategory]);

  useEffect(() => {
    setBooks([]);
    setCursor(undefined);
    void loadBooks(true);
  }, [debouncedSearch, id, loadBooks, selectedTags, sort]);

  const handleIntersect = useCallback(() => {
    if (!isLoading && cursorRef.current) {
      void loadBooks(false);
    }
  }, [isLoading, loadBooks]);

  const sentinelRef = useIntersectionObserver(handleIntersect);

  if (!id) {
    return <ErrorBanner message={t("errors.categoryNotFound")} />;
  }

  return (
    <main style={{ padding: "16px 16px 32px", margin: "0 auto", maxWidth: 720 }}>
      <Title level="1" weight="2" style={{ marginBottom: 16 }}>
        {category?.title ?? t("book.fallbackCategoryTitle")}
      </Title>
      <FiltersBar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        tags={availableTags}
        selectedTags={selectedTags}
        onToggleTag={(tag) =>
          setSelectedTags((current) =>
            current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
          )
        }
      />
      {error && <ErrorBanner message={error} onRetry={() => loadBooks(true)} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        {books.map((book) => (
          <BookCard key={book.id} book={book} onClick={() => navigate(`/book/${book.id}`)} />
        ))}
        {isLoading && books.length === 0 && (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <BookCardSkeleton key={index} />
            ))}
          </>
        )}
        {!isLoading && books.length === 0 && !error && (
          <EmptyState title={t("common.notFound")} description={t("categoryBooks.emptyDescription")} />
        )}
        <div ref={sentinelRef} style={{ height: 1 }} />
        {isLoading && books.length > 0 && <BookCardSkeleton />}
      </div>
    </main>
  );
}
