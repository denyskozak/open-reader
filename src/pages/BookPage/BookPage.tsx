import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type TelegramInvoiceStatus = "paid" | "cancelled" | "failed" | string;

interface TelegramWebApp {
  expand: () => void;
  openInvoice: (url: string, callback?: (status: TelegramInvoiceStatus) => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

const TEST_ENV_HEADER = { "X-Test-Env": "true" } as const;
const PURCHASE_STORAGE_PREFIX = "purchase:";

interface PurchaseStatusResponse {
  purchased: boolean;
}

interface InvoiceResponse {
  invoice_link: string;
  payment_id: string;
}

interface ConfirmPurchaseResponse {
  ok: boolean;
}

export default function BookPage(): JSX.Element {
  const { id } = useParams<{ id: ID }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { mainButton, isTelegram } = useTMA();
  const reviewsRef = useRef<HTMLDivElement | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [similar, setSimilar] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);
  const [isPurchaseLoading, setIsPurchaseLoading] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseCheckError, setPurchaseCheckError] = useState<string | null>(null);
  const purchaseStorageKey = id ? `${PURCHASE_STORAGE_PREFIX}${id}` : null;
  const webApp = useMemo(() => window.Telegram?.WebApp, []);
  const isMountedRef = useRef(true);

  const savePurchaseLocally = useCallback(
    (value: boolean) => {
      if (!purchaseStorageKey) {
        return;
      }

      try {
        if (value) {
          window.localStorage.setItem(purchaseStorageKey, "true");
        } else {
          window.localStorage.removeItem(purchaseStorageKey);
        }
      } catch (storageError) {
        if (import.meta.env.DEV) {
          console.warn("Unable to persist purchase state", storageError);
        }
      }
    },
    [purchaseStorageKey],
  );

  const loadPurchaseStatus = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsCheckingPurchase(true);
    setPurchaseCheckError(null);

    try {
      const response = await fetch(`/api/purchases/${id}`, {
        headers: {
          ...TEST_ENV_HEADER,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as PurchaseStatusResponse;
      const purchased = Boolean(payload.purchased);

      if (isMountedRef.current) {
        setIsPurchased(purchased);
        savePurchaseLocally(purchased);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(err);
      }

      if (isMountedRef.current) {
        setPurchaseCheckError("Не удалось проверить покупку");
      }

      showToast("Не удалось проверить покупку");
    } finally {
      if (isMountedRef.current) {
        setIsCheckingPurchase(false);
      }
    }
  }, [id, savePurchaseLocally, showToast]);

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

  const handlePurchase = useCallback(async () => {
    if (!id || !book) {
      return;
    }

    if (!isTelegram) {
      setPurchaseError("Оплата доступна только в Telegram");
      showToast("Оплата доступна только внутри Telegram");
      return;
    }

    if (!webApp || typeof webApp.openInvoice !== "function") {
      setPurchaseError("Оплата недоступна в этом окружении");
      showToast("Оплата недоступна в этом окружении");
      return;
    }

    setIsPurchaseLoading(true);
    setPurchaseError(null);

    try {
      const response = await fetch("/api/stars/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...TEST_ENV_HEADER,
        },
        body: JSON.stringify({ bookId: id }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const invoice = (await response.json()) as InvoiceResponse;

      if (!invoice.invoice_link || !invoice.payment_id) {
        throw new Error("Invoice payload is incomplete");
      }

      webApp.openInvoice(invoice.invoice_link, (status) => {
        if (!isMountedRef.current) {
          return;
        }

        if (status === "paid") {
          void (async () => {
            try {
              const confirmResponse = await fetch("/api/purchases/confirm", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...TEST_ENV_HEADER,
                },
                body: JSON.stringify({ bookId: id, payment_id: invoice.payment_id }),
              });

              if (!confirmResponse.ok) {
                throw new Error(`Request failed with status ${confirmResponse.status}`);
              }

              const confirmation = (await confirmResponse.json()) as ConfirmPurchaseResponse;

              if (!confirmation.ok) {
                throw new Error("Confirmation failed");
              }

              if (isMountedRef.current) {
                setIsPurchased(true);
                savePurchaseLocally(true);
                setPurchaseCheckError(null);
                setPurchaseError(null);
              }

              showToast("Покупка успешно оформлена");
            } catch (confirmError) {
              if (import.meta.env.DEV) {
                console.error(confirmError);
              }

              if (isMountedRef.current) {
                setPurchaseError("Не удалось подтвердить покупку");
              }

              showToast("Не удалось подтвердить покупку");
            } finally {
              if (isMountedRef.current) {
                setIsPurchaseLoading(false);
              }
            }
          })();

          return;
        }

        if (status === "failed" || status === "cancelled") {
          const message = status === "failed" ? "Оплата не прошла" : "Оплата отменена";

          setPurchaseError(message);
          showToast(message);
          setIsPurchaseLoading(false);
          return;
        }

        if (import.meta.env.DEV) {
          console.info("Invoice status", status);
        }

        setIsPurchaseLoading(false);
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(err);
      }

      if (isMountedRef.current) {
        setPurchaseError("Не удалось создать счёт");
        setIsPurchaseLoading(false);
      }

      showToast("Не удалось создать счёт");
    }
  }, [book, id, isTelegram, savePurchaseLocally, showToast, webApp]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!purchaseStorageKey) {
      return;
    }

    try {
      const stored = window.localStorage.getItem(purchaseStorageKey);
      if (stored === "true") {
        setIsPurchased(true);
      }
    } catch (storageError) {
      if (import.meta.env.DEV) {
        console.warn("Unable to read purchase state", storageError);
      }
    }
  }, [purchaseStorageKey]);

  useEffect(() => {
    webApp?.expand();
  }, [webApp]);

  useEffect(() => {
    void loadPurchaseStatus();
  }, [loadPurchaseStatus]);

  useEffect(() => {
    if (!id) {
      return;
    }

    setIsPurchased(false);
    setPurchaseError(null);
    setPurchaseCheckError(null);
    setIsCheckingPurchase(false);
    setIsPurchaseLoading(false);
  }, [id]);

  useEffect(() => {
    void loadBook();
  }, [loadBook]);

  useEffect(() => {
    if (!book) {
      mainButton.setParams({
        text: "Загрузка...",
        isVisible: true,
        isEnabled: false,
        isLoaderVisible: true,
      });

      return () => {
        mainButton.setParams({ isVisible: false, isLoaderVisible: false });
      };
    }

    if (isPurchased) {
      mainButton.setParams({ isVisible: false, isLoaderVisible: false });

      return () => {
        mainButton.setParams({ isVisible: false, isLoaderVisible: false });
      };
    }

    const loaderVisible = isPurchaseLoading || isCheckingPurchase;

    mainButton.setParams({
      text: `Купить за ${book.priceStars} ⭐`,
      isVisible: true,
      isEnabled: isTelegram && !loaderVisible,
      isLoaderVisible: loaderVisible,
    });

    return () => {
      mainButton.setParams({ isVisible: false, isLoaderVisible: false });
    };
  }, [book, isCheckingPurchase, isPurchased, isPurchaseLoading, isTelegram, mainButton]);

  useEffect(() => {
    if (!book || isPurchased || !isTelegram || isPurchaseLoading || isCheckingPurchase) {
      return;
    }

    const off = mainButton.onClick(() => {
      void handlePurchase();
    });

    return () => {
      off();
    };
  }, [book, handlePurchase, isCheckingPurchase, isPurchaseLoading, isPurchased, isTelegram, mainButton]);

  useEffect(() => {
    if (isPurchased) {
      setPurchaseError(null);
      setPurchaseCheckError(null);
    }
  }, [isPurchased]);

  const retryPurchaseCheck = useCallback(() => {
    void loadPurchaseStatus();
  }, [loadPurchaseStatus]);

  const retryPurchase = useCallback(() => {
    void handlePurchase();
  }, [handlePurchase]);

  if (!id) {
    return <ErrorBanner message="Книга не найдена" onRetry={() => navigate("/")} actionLabel="На главную" />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={loadBook} />;
  }

  return (
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
            {purchaseCheckError && (
              <ErrorBanner message={purchaseCheckError} onRetry={retryPurchaseCheck} />
            )}
            {purchaseError && !isPurchaseLoading && !isPurchased && (
              <ErrorBanner message={purchaseError} onRetry={retryPurchase} />
            )}
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
            {isPurchased && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button size="l" onClick={handleRead}>
                  Читать
                </Button>
                <Button size="l" mode="outline" onClick={handleDownload}>
                  Скачать
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
  );
}
