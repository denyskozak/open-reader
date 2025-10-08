import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button, Card, Chip, Modal, Skeleton, Title } from "@telegram-apps/telegram-ui";

import { catalogApi } from "@/entities/book/api";
import type { Book, ID } from "@/entities/book/types";
import { BookRating } from "@/entities/book/components/BookRating";
import { SimilarCarousel } from "@/widgets/SimilarCarousel/SimilarCarousel";
import { ReviewsList } from "@/widgets/ReviewsList/ReviewsList";
import { ErrorBanner } from "@/shared/ui/ErrorBanner";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useToast } from "@/shared/ui/ToastProvider";

export default function BookPage(): JSX.Element {
  const { id } = useParams<{ id: ID }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const reviewsRef = useRef<HTMLDivElement | null>(null);
  const loaderTimeoutRef = useRef<number | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [similar, setSimilar] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<"buy" | "subscribe" | null>(null);
  const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const loadBook = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const item = await catalogApi.getBook(id);
      setBook(item);
      const similarBooksResponse = await catalogApi.listBooks({
        categoryId: item.categories[0],
        limit: 12,
      });
      setSimilar(similarBooksResponse.items.filter((entry) => entry.id !== item.id).slice(0, 6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить книгу");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Ссылка скопирована");
    } catch (err) {
      showToast("Не удалось скопировать ссылку");
      console.error(err);
    }
  }, [showToast]);

  const handleScrollToReviews = useCallback(() => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleRead = useCallback(() => {
    if (!id) {
      return;
    }

    navigate(`/reader/${id}`);
  }, [id, navigate]);

  const handleDownload = useCallback(() => {
    if (!id) {
      return;
    }

    window.location.href = `/api/books/${id}/download`;
  }, [id]);

  const handleMockAction = useCallback(
    (action: "buy" | "subscribe") => {
      if (!book || isActionLoading) {
        return;
      }

      setActiveAction(action);
      setIsActionLoading(true);

      if (loaderTimeoutRef.current) {
        window.clearTimeout(loaderTimeoutRef.current);
      }

      loaderTimeoutRef.current = window.setTimeout(() => {
        setIsActionLoading(false);
        setPurchaseModalOpen(true);
      }, 800);
    },
    [book, isActionLoading],
  );

  const handleConfirmPurchase = useCallback(() => {
    setPurchaseModalOpen(false);
    setIsPurchased(true);
    setActiveAction(null);
    setIsActionLoading(false);
    showToast("Доступ к книге открыт (демо)");
  }, [showToast]);

  const handleModalOpenChange = useCallback(
    (open: boolean) => {
      setPurchaseModalOpen(open);

      if (!open && !isPurchased) {
        setActiveAction(null);
      }
    },
    [isPurchased],
  );

  useEffect(() => {
    return () => {
      if (loaderTimeoutRef.current) {
        window.clearTimeout(loaderTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loaderTimeoutRef.current) {
      window.clearTimeout(loaderTimeoutRef.current);
    }

    setIsPurchased(false);
    setActiveAction(null);
    setPurchaseModalOpen(false);
    setIsActionLoading(false);
  }, [id]);

  useEffect(() => {
    void loadBook();
  }, [loadBook]);

  if (!id) {
    return <ErrorBanner message="Книга не найдена" onRetry={() => navigate("/")} actionLabel="На главную" />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={loadBook} />;
  }

  const actionTitle = activeAction === "subscribe" ? "Подписка" : "Покупка";

  return (
    <>
      <main style={{ margin: "0 auto", maxWidth: 720, paddingBottom: 96 }}>
        {isLoading || !book ? (
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton style={{ height: 200, borderRadius: 20 }} />
            <Skeleton style={{ height: 24, width: "70%" }} />
            <Skeleton style={{ height: 16, width: "40%" }} />
            <Skeleton style={{ height: 16, width: "30%" }} />
            <Skeleton style={{ height: 16, width: "80%" }} />
          </div>
        ) : (
          <>
            <div style={{ position: "relative" }}>
              <div style={{ padding: 16 }}>
                <Card style={{ borderRadius: 24, overflow: "hidden" }}>
                  <div style={{ position: "relative", aspectRatio: "16 / 9" }}>
                    <img
                      src={book.coverUrl}
                      alt={`Обложка книги ${book.title}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <Button
                      aria-label="Поделиться"
                      mode="plain"
                      onClick={handleShare}
                      style={{ position: "absolute", top: 12, right: 12 }}
                    >
                      🔗
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
            <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 16 }}>
              <Title level="1" weight="2">
                {book.title}
              </Title>
              <div style={{ color: "var(--app-subtitle-color)" }}>{book.authors.join(", ")}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {book.tags.map((tag) => (
                  <Chip key={tag} mode="outline">
                    #{tag}
                  </Chip>
                ))}
              </div>
              <Card
                onClick={handleScrollToReviews}
                style={{ padding: 16, borderRadius: 20, cursor: "pointer" }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => event.key === "Enter" && handleScrollToReviews()}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <BookRating value={book.rating.average} votes={book.rating.votes} />
                    </div>
                    <Chip mode="outline" style={{ fontWeight: 600 }}>
                      {book.priceStars} ⭐
                    </Chip>
                  </div>
                  <div style={{ color: "var(--app-subtitle-color)" }}>{book.reviewsCount} отзывов</div>
                </div>
              </Card>
              {isPurchased ? (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Button size="l" onClick={handleRead}>
                    Читать
                  </Button>
                  <Button size="l" mode="outline" onClick={handleDownload}>
                    Скачать
                  </Button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Button
                    size="l"
                    loading={isActionLoading && activeAction === "buy"}
                    disabled={isActionLoading}
                    onClick={() => handleMockAction("buy")}
                  >
                    Купить
                  </Button>
                  <Button
                    size="l"
                    mode="outline"
                    loading={isActionLoading && activeAction === "subscribe"}
                    disabled={isActionLoading}
                    onClick={() => handleMockAction("subscribe")}
                  >
                    Подписаться
                  </Button>
                </div>
              )}
              <Card style={{ padding: 16, borderRadius: 20 }}>
                <Title level="3" weight="2" style={{ marginBottom: 12 }}>
                  Описание
                </Title>
                <p style={{ lineHeight: 1.6 }}>
                  {showFullDescription || book.description.length <= 280
                    ? book.description
                    : `${book.description.slice(0, 280)}...`}
                </p>
                <Button mode="plain" onClick={() => setShowFullDescription((prev) => !prev)}>
                  {showFullDescription ? "Свернуть" : "Показать больше"}
                </Button>
              </Card>
              <section ref={reviewsRef} aria-label="Отзывы" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Title level="2" weight="2">
                  Отзывы
                </Title>
                <ReviewsList api={catalogApi} bookId={book.id} />
              </section>
              <section aria-label="Похожие книги" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Title level="2" weight="2">
                  Похожие книги
                </Title>
                {similar.length === 0 ? (
                  <EmptyState title="Пока нечего посоветовать" description="Мы работаем над рекомендациями" />
                ) : (
                  <SimilarCarousel books={similar} onSelect={(bookId) => navigate(`/book/${bookId}`)} />
                )}
              </section>
            </div>
          </>
        )}
      </main>
      <Modal open={isPurchaseModalOpen} onOpenChange={handleModalOpenChange}>
        <Modal.Header>{actionTitle}</Modal.Header>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            {activeAction === "subscribe"
              ? "Подписка откроет доступ к новым релизам и этой книге."
              : "Вы получите полный доступ к книге после оформления покупки."}
          </p>
          {book && (
            <Card style={{ padding: 12, borderRadius: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>{book.title}</span>
                <span style={{ fontWeight: 600 }}>{book.priceStars} ⭐</span>
              </div>
            </Card>
          )}
          <Button size="l" mode="filled" onClick={handleConfirmPurchase}>
            Оформить
          </Button>
        </div>
      </Modal>
    </>
  );
}
