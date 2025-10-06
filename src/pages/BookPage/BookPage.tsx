import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button, Card, Chip, Skeleton, Title } from "@telegram-apps/telegram-ui";

import { catalogApi } from "@/entities/book/api";
import type { Book, ID } from "@/entities/book/types";
import { BookRating } from "@/entities/book/components/BookRating";
import { SimilarCarousel } from "@/widgets/SimilarCarousel/SimilarCarousel";
import { ReviewsList } from "@/widgets/ReviewsList/ReviewsList";
import { ErrorBanner } from "@/shared/ui/ErrorBanner";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useToast } from "@/shared/ui/ToastProvider";
import { useTMA } from "@/app/providers/TMAProvider";

export default function BookPage(): JSX.Element {
  const { id } = useParams<{ id: ID }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { mainButton } = useTMA();
  const reviewsRef = useRef<HTMLDivElement | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [similar, setSimilar] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

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

  useEffect(() => {
    void loadBook();
  }, [loadBook]);

  useEffect(() => {
    if (book) {
      mainButton.setParams({
        text: "Читать/Купить",
        isEnabled: true,
        isVisible: true,
        isLoaderVisible: false,
      });
      const off = mainButton.onClick(() => {
        showToast("Функция скоро будет");
      });
      return () => {
        off();
        mainButton.setParams({ isVisible: false, isLoaderVisible: false });
      };
    }

    mainButton.setParams({
      text: "Загрузка...",
      isVisible: true,
      isEnabled: false,
      isLoaderVisible: true,
    });

    return () => {
      mainButton.setParams({ isVisible: false, isLoaderVisible: false });
    };
  }, [book, mainButton, showToast]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Ссылка скопирована");
    } catch (err) {
      showToast("Не удалось скопировать ссылку");
      console.error(err);
    }
  };

  const handleScrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!id) {
    return <ErrorBanner message="Книга не найдена" onRetry={() => navigate("/")} actionLabel="На главную" />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={loadBook} />;
  }

  return (
    <main style={{ margin: "0 auto", maxWidth: 720, paddingBottom: 80 }}>
      {isLoading || !book ? (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton style={{ height: 200, borderRadius: 20 }} />
          <Skeleton style={{ height: 24, width: "70%" }} />
          <Skeleton style={{ height: 16, width: "40%" }} />
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
              <BookRating value={book.rating.average} votes={book.rating.votes} />
              <div style={{ color: "var(--app-subtitle-color)", marginTop: 8 }}>
                {book.reviewsCount} отзывов
              </div>
            </Card>
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
  );
}
