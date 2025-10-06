import type { ChangeEvent } from "react";

import { Chip, Input, SegmentedControl } from "@telegram-apps/telegram-ui";

import type { BookSort } from "@/shared/lib/bookSort";

const SORT_OPTIONS: Array<{ label: string; value: BookSort }> = [
  { label: "Популярные", value: "popular" },
  { label: "Лучшие", value: "rating" },
  { label: "Новинки", value: "new" },
];

interface FiltersBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: BookSort;
  onSortChange: (sort: BookSort) => void;
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

export function FiltersBar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  tags,
  selectedTags,
  onToggleTag,
}: FiltersBarProps): JSX.Element {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Input
        type="search"
        value={search}
        onChange={handleSearch}
        placeholder="Поиск по книгам"
        aria-label="Поиск по книгам"
      />
      <SegmentedControl>
        {SORT_OPTIONS.map((option) => (
          <SegmentedControl.Item
            key={option.value}
            selected={option.value === sort}
            onClick={() => onSortChange(option.value)}
          >
            {option.label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tags.map((tag) => {
          const selected = selectedTags.includes(tag);
          return (
            <Chip
              key={tag}
              mode={selected ? "elevated" : "outline"}
              aria-pressed={selected}
              role="button"
              onClick={() => onToggleTag(tag)}
            >
              #{tag}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
