import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Input, Title } from "@telegram-apps/telegram-ui";

import { CategoryTile } from "@/entities/category/components/CategoryTile";
import type { Category } from "@/entities/category/types";
import {
  SPECIAL_CATEGORIES,
  SPECIAL_CATEGORY_MAP,
  type SpecialCategory,
  isSpecialCategoryId,
} from "@/entities/category/customCategories";
import { catalogApi } from "@/entities/book/api";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorBanner } from "@/shared/ui/ErrorBanner";
import { CategoryTileSkeleton } from "@/shared/ui/Skeletons";

export default function HomeCategories(): JSX.Element {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 250);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const items = await catalogApi.listCategories(
          debouncedSearch ? { search: debouncedSearch } : undefined,
        );
        if (!cancelled) {
          setCategories(items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Не удалось загрузить категории");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, refreshToken]);

  const normalizedSearch = debouncedSearch.trim().toLocaleLowerCase();

  const specialCategories: SpecialCategory[] = normalizedSearch
    ? SPECIAL_CATEGORIES.filter((category) =>
        [category.title, category.slug].some((value) =>
          value.toLocaleLowerCase().includes(normalizedSearch),
        ),
      )
    : SPECIAL_CATEGORIES;

  const displayedCategories: Category[] = [...specialCategories, ...categories];

  const handleCategoryClick = (category: Category) => {
    if (isSpecialCategoryId(category.id)) {
      navigate(SPECIAL_CATEGORY_MAP[category.id].path);
      return;
    }

    navigate(`/category/${category.id}`);
  };

  return (
    <main style={{ padding: "16px 16px 32px", margin: "0 auto", maxWidth: 720 }}>
      <Title level="1" weight="2" style={{ marginBottom: 16 }}>
        Категории
      </Title>
      <Input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Поиск по категориям"
        aria-label="Поиск по категориям"
        style={{ marginBottom: 16 }}
      />
      {error && <ErrorBanner message={error} onRetry={() => setRefreshToken((prev) => prev + 1)} />}
      {isLoading && displayedCategories.length === 0 ? (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <CategoryTileSkeleton key={index} />
          ))}
        </div>
      ) : displayedCategories.length > 0 ? (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
          {displayedCategories.map((category) => (
            <CategoryTile
              key={category.id}
              category={category}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>
      ) : (
        !isLoading && <EmptyState title="Ничего не найдено" description="Попробуйте изменить запрос" />
      )}
    </main>
  );
}
