import type { Book } from "@/entities/book/types";

import { Card, Tappable, Text, Title } from "@telegram-apps/telegram-ui";

interface SimilarCarouselProps {
  books: Book[];
  onSelect: (bookId: string) => void;
}

export function SimilarCarousel({ books, onSelect }: SimilarCarouselProps): JSX.Element {
  if (books.length === 0) {
    return (
      <Text style={{ color: "var(--app-subtitle-color)", padding: "0 16px" }}>
        Пока нечего посоветовать
      </Text>
    );
  }

  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ display: "flex", gap: 12, minWidth: 0 }}>
        {books.map((book) => (
          <Tappable
            key={book.id}
            onClick={() => onSelect(book.id)}
            style={{ width: 160, flexShrink: 0 }}
            interactiveAnimation="background"
            aria-label={`Перейти к книге ${book.title}`}
          >
            <Card style={{ borderRadius: 18, overflow: "hidden" }}>
              <div style={{ aspectRatio: "16 / 9", background: "var(--app-section-color)" }}>
                <img
                  src={book.coverUrl}
                  alt={`Обложка книги ${book.title}`}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: 12 }}>
                <Title level="3" weight="2" style={{ fontSize: 16 }}>
                  {book.title}
                </Title>
                <Text style={{ color: "var(--app-subtitle-color)" }}>
                  {book.authors.join(", ")}
                </Text>
              </div>
            </Card>
          </Tappable>
        ))}
      </div>
    </div>
  );
}
