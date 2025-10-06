import { Spinner } from "@telegram-apps/telegram-ui";

export function PageSkeleton(): JSX.Element {
  return (
    <div
      aria-live="polite"
      style={{
        display: "flex",
        minHeight: "60vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Spinner size="l" />
    </div>
  );
}
