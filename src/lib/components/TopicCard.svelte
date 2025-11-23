<script lang="ts">
import * as Card from "$lib/components/ui/card";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "$lib/components/ui/card";

interface Props {
  id: number;
  title: string;
  description: string;
  creator_address: string;
  created_at: string;
}

let { id, title, description, creator_address, created_at }: Props = $props();

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
</script>

<a href="/topics/{id}" class="block transition-transform hover:scale-[1.02]">
  <Card.Root class="h-full cursor-pointer hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription class="space-y-2">
        <p>{description}</p>
        <div class="text-xs text-muted-foreground flex items-center justify-between">
          <span>By {formatAddress(creator_address)}</span>
          <span>{formatDate(created_at)}</span>
        </div>
      </CardDescription>
    </CardHeader>
  </Card.Root>
</a>
