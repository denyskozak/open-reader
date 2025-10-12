import { Skeleton } from "@telegram-apps/telegram-ui";

export function CategoryTileSkeleton(): JSX.Element {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: "var(--app-section-color)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Skeleton style={{ width: 48, height: 48, borderRadius: 16 }} />
      <Skeleton style={{ width: "80%", height: 18 }} />
      <Skeleton style={{ width: "60%", height: 14 }} />
    </div>
  );
}

export function BookCardSkeleton(): JSX.Element {
  return (
    <div
      style={{
        borderRadius: 18,
        overflow: "hidden",
        background: "var(--app-section-color)",
      }}
    >
      <Skeleton style={{ height: 160 }} />
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton style={{ width: "70%", height: 20 }} />
        <Skeleton style={{ width: "50%", height: 16 }} />
        <Skeleton style={{ width: "40%", height: 16 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} style={{ width: 60, height: 24, borderRadius: 12 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton(): JSX.Element {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Skeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton style={{ width: "40%", height: 16 }} />
        <Skeleton style={{ width: "80%", height: 14 }} />
        <Skeleton style={{ width: "90%", height: 14 }} />
      </div>
    </div>
  );
}
