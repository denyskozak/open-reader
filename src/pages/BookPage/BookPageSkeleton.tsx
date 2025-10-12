import { Card, Skeleton } from "@telegram-apps/telegram-ui";

import { ReviewSkeleton } from "@/shared/ui/Skeletons";

export function BookPageSkeleton(): JSX.Element {
  return (
    <main style={{ margin: "0 auto", maxWidth: 720, paddingBottom: 96 }}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <Card style={{ borderRadius: 24, overflow: "hidden" }}>
          <div style={{ position: "relative", aspectRatio: "16 / 9" }}>
            <Skeleton style={{ width: "100%", height: "100%" }} />
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Skeleton style={{ height: 32, width: "70%" }} />
          <Skeleton style={{ height: 18, width: "40%" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} style={{ height: 28, width: 72, borderRadius: 14 }} />
            ))}
          </div>
          <Card style={{ padding: 16, borderRadius: 20 }}>
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
                <Skeleton style={{ height: 24, width: "60%" }} />
                <Skeleton style={{ height: 28, width: 96, borderRadius: 16 }} />
              </div>
              <Skeleton style={{ height: 16, width: "40%" }} />
            </div>
          </Card>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} style={{ height: 44, width: 160, borderRadius: 22 }} />
            ))}
          </div>
          <Card style={{ padding: 16, borderRadius: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton style={{ height: 20, width: "40%" }} />
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} style={{ height: 14, width: `${80 + index * 5}%` }} />
            ))}
            <Skeleton style={{ height: 20, width: 120 }} />
          </Card>
          <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton style={{ height: 24, width: "50%" }} />
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} style={{ padding: 16, borderRadius: 20 }}>
                <ReviewSkeleton />
              </Card>
            ))}
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton style={{ height: 24, width: "50%" }} />
            <div style={{ display: "flex", gap: 12, overflow: "hidden" }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} style={{ width: 160, borderRadius: 18, overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ aspectRatio: "16 / 9" }}>
                    <Skeleton style={{ width: "100%", height: "100%" }} />
                  </div>
                  <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    <Skeleton style={{ height: 16, width: "80%" }} />
                    <Skeleton style={{ height: 14, width: "60%" }} />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
