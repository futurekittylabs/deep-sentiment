<script lang="ts">
import {
  getConnectionError,
  isWalletAvailable,
  getIsConnected,
  getConnectedAddress,
} from "$lib/states/client.svelte.ts";
import { Button } from "$lib/components/ui/button";
import TopicCard from "$lib/components/TopicCard.svelte";
import * as Dialog from "$lib/components/ui/dialog";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "$lib/components/ui/dialog";
import { Input } from "$lib/components/ui/input";
import { Textarea } from "$lib/components/ui/textarea";
import { onMount } from "svelte";

interface Topic {
  id: number;
  title: string;
  description: string;
  creator_address: string;
  bounty: number | null;
  created_at: string;
}

let topics = $state<Topic[]>([]);
let loading = $state(true);
let dialogOpen = $state(false);
let creating = $state(false);
let title = $state("");
let description = $state("");
let bounty = $state("");

async function fetchTopics() {
  try {
    const response = await fetch("/api/topics");
    const data = await response.json();
    topics = data.topics || [];
  } catch (error) {
    console.error("Error fetching topics:", error);
  } finally {
    loading = false;
  }
}

async function createTopic() {
  const address = getConnectedAddress();
  if (!address) return;

  creating = true;
  try {
    const bountyValue = bounty ? parseFloat(bounty) : null;
    const response = await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        bounty: bountyValue,
        creator_address: address,
      }),
    });

    if (response.ok) {
      title = "";
      description = "";
      bounty = "";
      dialogOpen = false;
      await fetchTopics();
    } else {
      const data = await response.json();
      alert(data.error || "Failed to create topic");
    }
  } catch (error) {
    console.error("Error creating topic:", error);
    alert("Failed to create topic");
  } finally {
    creating = false;
  }
}

onMount(() => {
  fetchTopics();
});
</script>

<div class="space-y-8">
    <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">Topics</h2>

        <Dialog.Root bind:open={dialogOpen}>
            <Button onclick={() => dialogOpen = true} disabled={!getIsConnected()}>
                Create Topic
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Topic</DialogTitle>
                    <DialogDescription>
                        Start a new discussion topic for the community
                    </DialogDescription>
                </DialogHeader>

                <div class="space-y-4 py-4">
                    <div class="space-y-2">
                        <label for="title" class="text-sm font-medium">
                            Title (max 50 characters)
                        </label>
                        <Input
                            id="title"
                            bind:value={title}
                            maxlength={50}
                            placeholder="Enter topic title"
                        />
                        <p class="text-xs text-muted-foreground text-right">
                            {title.length}/50
                        </p>
                    </div>

                    <div class="space-y-2">
                        <label for="description" class="text-sm font-medium">
                            Description (max 155 characters)
                        </label>
                        <Textarea
                            id="description"
                            bind:value={description}
                            maxlength={155}
                            placeholder="Describe your topic"
                            rows={4}
                        />
                        <p class="text-xs text-muted-foreground text-right">
                            {description.length}/155
                        </p>
                    </div>

                    <div class="space-y-2">
                        <label for="bounty" class="text-sm font-medium">
                            Bounty (ETH, optional)
                        </label>
                        <Input
                            id="bounty"
                            type="number"
                            step="0.001"
                            min="0"
                            bind:value={bounty}
                            placeholder="0.00"
                        />
                        <p class="text-xs text-muted-foreground">
                            Leave empty for no bounty
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onclick={createTopic}
                        disabled={creating || !title || !description}
                    >
                        {creating ? "Creating..." : "Create Topic"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog.Root>
    </div>

    {#if !isWalletAvailable()}
        <div class="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-4">
            <p class="text-orange-600 dark:text-orange-400 text-sm">
                No Ethereum provider detected. Please install MetaMask or another Web3 wallet.
            </p>
        </div>
    {:else if getConnectionError()}
        <div class="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <p class="text-destructive text-sm">{getConnectionError()}</p>
        </div>
    {:else if !getIsConnected()}
        <div class="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
            <p class="text-blue-600 dark:text-blue-400 text-sm">
                Connect your wallet to create topics
            </p>
        </div>
    {/if}

    {#if loading}
        <div class="text-center text-muted-foreground">Loading topics...</div>
    {:else if topics.length === 0}
        <div class="text-center py-12">
            <p class="text-muted-foreground">No topics yet. Be the first to create one!</p>
        </div>
    {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each topics as topic (topic.id)}
                <TopicCard {...topic} />
            {/each}
        </div>
    {/if}
</div>
