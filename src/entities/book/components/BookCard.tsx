import type { Book } from "@/entities/book/types";

import { Card, Chip, Tappable, Text, Title } from "@telegram-apps/telegram-ui";
import { useTranslation } from "react-i18next";

import { BookRating } from "./BookRating";

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export function BookCard({ book, onClick }: BookCardProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Tappable
      onClick={onClick}
      interactiveAnimation="background"
      aria-label={t("book.cardAria", { title: book.title })}
      style={{ textDecoration: "none", color: "inherit", display: "flex", justifyContent: "center" }}
    >
      <Card style={{ borderRadius: 20, overflow: "hidden" }}>
        <div style={{ position: "relative", width: "80vw", aspectRatio: "3 / 3", background: "var(--app-section-color)" }}>
          <img
            src={`/images/books/${book.id}.jpg`}
            alt={t("book.coverAlt", { title: book.title })}
            loading="lazy"
            onError={event => event.currentTarget.src='/images/books/b33.jpg' }
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
