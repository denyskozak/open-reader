import type { Category } from "@/entities/category/types";

import { Card, Tappable, Text, Title } from "@telegram-apps/telegram-ui";

interface CategoryTileProps {
  category: Category;
  onClick: () => void;
}

export function CategoryTile({ category, onClick }: CategoryTileProps): JSX.Element {
  return (
    <Tappable
      onClick={onClick}
      style={{ display: "block", textDecoration: "none" }}
      interactiveAnimation="background"
      aria-label={`Категория ${category.title}`}
    >
      <Card style={{ padding: 16, borderRadius: 20, minHeight: 140 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{category.emoji ?? "📚"}</div>
        <Title weight="2" level="3" style={{ marginBottom: 8 }}>
          {category.title}
        </Title>
        <Text weight="2" style={{ color: "var(--app-subtitle-color)" }}>
          {category.booksCount} книг
        </Text>
      </Card>
    </Tappable>
  );
}
