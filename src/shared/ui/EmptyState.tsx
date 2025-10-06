import type { ReactNode } from "react";

import { Placeholder } from "@telegram-apps/telegram-ui";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <Placeholder
      header={title}
      description={description}
      action={action}
      style={{ padding: "48px 16px" }}
    />
  );
}
