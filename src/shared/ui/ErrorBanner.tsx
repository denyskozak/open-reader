import { Button, Card, Text, Title } from "@telegram-apps/telegram-ui";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  actionLabel?: string;
}

export function ErrorBanner({ message, onRetry, actionLabel = "Повторить" }: ErrorBannerProps): JSX.Element {
  return (
    <Card style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Title level="3" weight="2">
          Что-то пошло не так
        </Title>
        <Text style={{ color: "var(--app-subtitle-color)" }}>{message}</Text>
      </div>
      {onRetry ? (
        <Button mode="filled" size="s" onClick={onRetry}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
