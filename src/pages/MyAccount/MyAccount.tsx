import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";

import { Button, Card, Chip, SegmentedControl, Text, Title } from "@telegram-apps/telegram-ui";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useToast } from "@/shared/ui/ToastProvider";

const BOOK_SECTION = "myBooks" as const;
const PUBLISH_SECTION = "publish" as const;

const mockBooks = [
  {
    id: "ton-collectible-01",
    title: "The Blockchain Explorer",
    author: "Eva Anton",
    cover: "/images/books/b1.jpg",
    collection: "Talegram Originals",
    tokenId: "#1245",
    status: "owned" as const,
  },
  {
    id: "ton-collectible-02",
    title: "Waves of the Ton",
    author: "Ilya Mirov",
    cover: "/images/books/b3.jpg",
    collection: "Indie Shelf",
    tokenId: "#0981",
    status: "listed" as const,
  },
  {
    id: "ton-collectible-03",
    title: "Encrypted Tales",
    author: "Sara Kim",
    cover: "/images/books/b7.jpg",
    collection: "Limited Drops",
    tokenId: "#2210",
    status: "owned" as const,
  },
];

type AccountSection = typeof BOOK_SECTION | typeof PUBLISH_SECTION;

type PublishFormState = {
  title: string;
  author: string;
  description: string;
  fileName: string;
};

const initialFormState: PublishFormState = {
  title: "",
  author: "",
  description: "",
  fileName: "",
};

export default function MyAccount(): JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<AccountSection>(BOOK_SECTION);
  const [formState, setFormState] = useState<PublishFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = useMemo(
    () => [
      { key: BOOK_SECTION, label: t("account.menu.myBooks") },
      { key: PUBLISH_SECTION, label: t("account.menu.publish") },
    ],
    [t],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFormState((prev) => ({ ...prev, fileName: file ? file.name : "" }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      const title = formState.title || t("account.publish.toastFallbackTitle");
      showToast(t("account.publish.toastSuccess", { title }));
      setFormState(initialFormState);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div
      style={{
        margin: "0 auto",
        maxWidth: 720,
        padding: "24px 16px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Title level="1" weight="2">
          {t("account.title")}
        </Title>
        <Text style={{ color: theme.subtitle }}>{t("account.subtitle")}</Text>
      </header>

      <SegmentedControl>
        {menuItems.map((item) => (
          <SegmentedControl.Item
            key={item.key}
            selected={item.key === activeSection}
            onClick={() => setActiveSection(item.key as AccountSection)}
          >
            {item.label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl>

      {activeSection === BOOK_SECTION ? (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Title level="2" weight="2">
              {t("account.myBooks.title")}
            </Title>
            <Text style={{ color: theme.subtitle }}>{t("account.myBooks.description")}</Text>
          </div>
          {mockBooks.map((book) => (
            <Card key={book.id} style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <img
                  src={book.cover}
                  alt={t("account.myBooks.coverAlt", { title: book.title })}
                  style={{
                    width: 96,
                    height: 128,
                    borderRadius: 12,
                    objectFit: "cover",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.12)",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <div>
                    <Title level="3" weight="2">
                      {book.title}
                    </Title>
                    <Text style={{ color: theme.subtitle }}>{book.author}</Text>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Chip mode="elevated">{t("account.myBooks.tonBadge")}</Chip>
                    <Chip mode="outline">{book.collection}</Chip>
                    <Chip mode="outline">{t(`account.myBooks.status.${book.status}`)}</Chip>
                  </div>
                  <Text style={{ color: theme.hint }}>
                    {t("account.myBooks.token", { token: book.tokenId })}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Title level="2" weight="2">
              {t("account.publish.title")}
            </Title>
            <Text style={{ color: theme.subtitle }}>{t("account.publish.description")}</Text>
          </div>
          <Card style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Text weight="2">{t("account.publish.form.name.label")}</Text>
                <input
                  required
                  name="title"
                  value={formState.title}
                  onChange={handleInputChange}
                  placeholder={t("account.publish.form.name.placeholder")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${theme.separator}`,
                    background: theme.section,
                    color: theme.text,
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Text weight="2">{t("account.publish.form.author.label")}</Text>
                <input
                  required
                  name="author"
                  value={formState.author}
                  onChange={handleInputChange}
                  placeholder={t("account.publish.form.author.placeholder")}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${theme.separator}`,
                    background: theme.section,
                    color: theme.text,
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Text weight="2">{t("account.publish.form.description.label")}</Text>
                <textarea
                  required
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  placeholder={t("account.publish.form.description.placeholder")}
                  rows={5}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${theme.separator}`,
                    background: theme.section,
                    color: theme.text,
                    resize: "vertical",
                    minHeight: 120,
                    font: "inherit",
                  }}
                />
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Text weight="2">{t("account.publish.form.file.label")}</Text>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".epub"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <Button type="button" mode="outline" size="s" onClick={() => fileInputRef.current?.click()}>
                    {t("account.publish.form.file.cta")}
                  </Button>
                  <Text style={{ color: theme.subtitle }}>
                    {formState.fileName || t("account.publish.form.file.placeholder")}
                  </Text>
                </div>
              </div>
              <Button type="submit" mode="filled" size="m" loading={isSubmitting}>
                {t("account.publish.form.submit")}
              </Button>
            </form>
            <Text style={{ color: theme.hint }}>{t("account.publish.form.notice")}</Text>
          </Card>
        </section>
      )}
    </div>
  );
}
