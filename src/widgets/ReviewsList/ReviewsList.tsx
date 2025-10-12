import { useCallback, useEffect, useMemo, useState } from "react";

import { Avatar, Button, Card, Text, Title } from "@telegram-apps/telegram-ui";
import { useTranslation } from "react-i18next";

import type { CatalogApi, ID, Review } from "@/entities/book/types";
import { formatRating } from "@/shared/lib/rating";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorBanner } from "@/shared/ui/ErrorBanner";
import { ReviewSkeleton } from "@/shared/ui/Skeletons";

interface ReviewsListProps {
  api: CatalogApi;
  bookId: ID;
}

export function ReviewsList({ api, bookId }: ReviewsListProps): JSX.Element {
  const [items, setItems] = useState<Review[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const hasMore = useMemo(() => Boolean(cursor), [cursor]);

  const load = useCallback(
    async (reset = false) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.listReviews(bookId, reset ? undefined : cursor);
        setCursor(response.nextCursor);
        setItems((prev) => (reset ? response.items : [...prev, ...response.items]));
      } catch (err) {
        console.error(err);
        setError(t("errors.loadReviews"));
      } finally {
        setIsLoading(false);
      }
    },
    [api, bookId, cursor, t],
  );

  useEffect(() => {
    setItems([]);
    setCursor(undefined);
    void load(true);
  }, [bookId, load]);

  if (error) {
    return <ErrorBanner message={error} onRetry={() => load(true)} />;
  }

  if (!isLoading && items.length === 0) {
    return (
      <EmptyState title={t("reviews.emptyTitle")} description={t("reviews.emptyDescription")} />
    );
  }

  const locale = i18n.language.startsWith("ru") ? "ru-RU" : "en-US";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {items.map((review) => (
        <Card key={review.id} style={{ padding: 16, borderRadius: 20 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Avatar size={40} style={{ background: "var(--app-section-color)" }}>
              {review.authorName.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Title level="3" weight="2">
                {review.authorName}
              </Title>
              <Text style={{ color: "var(--app-subtitle-color)" }}>
                {new Intl.DateTimeFormat(locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(review.createdAt))}
                {" • "}
                {t("reviews.rating", { value: formatRating(review.rating) })}
              </Text>
              <Text style={{ lineHeight: 1.4 }}>{review.text}</Text>
            </div>
          </div>
        </Card>
      ))}
      {isLoading && (
        <Card style={{ padding: 16, borderRadius: 20 }}>
          <ReviewSkeleton />
        </Card>
      )}
      {hasMore && !isLoading && (
        <Button mode="outline" onClick={() => load(false)}>
          {t("reviews.loadMore")}
        </Button>
      )}
    </div>
  );
}
