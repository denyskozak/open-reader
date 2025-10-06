import type { Book } from "@/entities/book/types";

import { Card, Chip, Tappable, Text, Title } from "@telegram-apps/telegram-ui";

import { BookRating } from "./BookRating";

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export function BookCard({ book, onClick }: BookCardProps): JSX.Element {
  return (
    <Tappable
      onClick={onClick}
      interactiveAnimation="background"
      aria-label={`Книга ${book.title}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Card style={{ borderRadius: 20, overflow: "hidden" }}>
        <div style={{ position: "relative", aspectRatio: "16 / 9", background: "var(--app-section-color)" }}>
          <img
            src={book.coverUrl}
            alt={`Обложка книги ${book.title}`}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <Title weight="2" level="3">
            {book.title}
          </Title>
          <Text style={{ color: "var(--app-subtitle-color)" }}>{book.authors.join(", ")}</Text>
          <BookRating value={book.rating.average} votes={book.rating.votes} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {book.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} mode="outline">
                #{tag}
              </Chip>
            ))}
            {book.tags.length > 3 && (
              <Text weight="2">+{book.tags.length - 3}</Text>
            )}
          </div>
        </div>
      </Card>
    </Tappable>
  );
}
