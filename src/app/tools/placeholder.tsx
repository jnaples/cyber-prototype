// Body for the Tools tabs that aren't part of the prototype yet. The tab's
// own name comes from the rail above it, so this only says why it's empty.

import { EmptyState } from "@/components/empty-state";

export function ToolPlaceholder({ title }: { title: string }) {
  return (
    <EmptyState
      title={title}
      description="This tool isn't part of the prototype yet."
    />
  );
}
