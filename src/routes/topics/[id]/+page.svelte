<script lang="ts">
import { page } from "$app/stores";
import { goto } from "$app/navigation";
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/button";
import * as Card from "$lib/components/ui/card";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$lib/components/ui/card";
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
import {
  getConnectedAddress,
  getIsConnected,
} from "$lib/states/client.svelte.ts";

interface Topic {
  id: number;
  title: string;
  description: string;
  creator_address: string;
  created_at: string;
}

let topic = $state<Topic | null>(null);
let loading = $state(true);
let deleting = $state(false);
let editing = $state(false);
let editDialogOpen = $state(false);
let editTitle = $state("");
let editDescription = $state("");
let topicId = $derived($page.params.id);

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function isCreator() {
  const address = getConnectedAddress();
  if (!address || !topic) return false;
  return topic.creator_address.toLowerCase() === address.toLowerCase();
}

async function fetchTopic() {
  try {
    const response = await fetch(`/api/topics/${topicId}`);
    if (response.ok) {
      const data = await response.json();
      topic = data.topic;
    } else {
      console.error("Failed to fetch topic");
    }
  } catch (error) {
    console.error("Error fetching topic:", error);
  } finally {
    loading = false;
  }
}

function openEditDialog() {
  if (!topic) return;
  editTitle = topic.title;
  editDescription = topic.description;
  editDialogOpen = true;
}

async function updateTopic() {
  const address = getConnectedAddress();
  if (!address || !topic) return;

  editing = true;
  try {
    const response = await fetch(`/api/topics/${topic.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        creator_address: address,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      topic = data.topic;
      editDialogOpen = false;
    } else {
      const data = await response.json();
      alert(data.error || "Failed to update topic");
    }
  } catch (error) {
    console.error("Error updating topic:", error);
    alert("Failed to update topic");
  } finally {
    editing = false;
  }
}

async function deleteTopic() {
  const address = getConnectedAddress();
  if (!address || !topic) return;

  if (
    !confirm(
      "Are you sure you want to delete this topic? This action cannot be undone.",
    )
  ) {
    return;
  }

  deleting = true;
  try {
    const response = await fetch(`/api/topics/${topic.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creator_address: address }),
    });

    if (response.ok) {
      goto("/");
    } else {
      const data = await response.json();
      alert(data.error || "Failed to delete topic");
    }
  } catch (error) {
    console.error("Error deleting topic:", error);
    alert("Failed to delete topic");
  } finally {
    deleting = false;
  }
}

onMount(() => {
  fetchTopic();
});
</script>

<div class="max-w-4xl mx-auto space-y-6">
  <div class="flex items-center gap-4">
    <Button variant="outline" onclick={() => goto("/")}>
      Back to Topics
    </Button>
  </div>

  {#if loading}
    <div class="text-center text-muted-foreground py-12">Loading topic...</div>
  {:else if !topic}
    <Card.Root>
      <CardContent class="py-12 text-center">
        <p class="text-muted-foreground">Topic not found</p>
      </CardContent>
    </Card.Root>
  {:else}
    <Card.Root>
      <CardHeader>
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <CardTitle class="text-3xl mb-2">{topic.title}</CardTitle>
            <CardDescription>
              <div class="space-y-1">
                <p>Created by {formatAddress(topic.creator_address)}</p>
                <p>{formatDate(topic.created_at)}</p>
              </div>
            </CardDescription>
          </div>

          {#if getIsConnected() && isCreator()}
            <div class="flex gap-2">
              <Button
                variant="outline"
                onclick={openEditDialog}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                onclick={deleteTopic}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          {/if}
        </div>
      </CardHeader>
      <CardContent>
        <p class="text-lg">{topic.description}</p>
      </CardContent>
    </Card.Root>

    {#if !getIsConnected()}
      <div class="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4">
        <p class="text-blue-600 dark:text-blue-400 text-sm">
          Connect your wallet to interact with this topic
        </p>
      </div>
    {:else if !isCreator()}
      <div class="rounded-lg border border-muted bg-muted/50 p-4">
        <p class="text-muted-foreground text-sm">
          Only the creator can edit or delete this topic
        </p>
      </div>
    {/if}
  {/if}
</div>

<Dialog.Root bind:open={editDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Topic</DialogTitle>
      <DialogDescription>
        Update the title and description of your topic
      </DialogDescription>
    </DialogHeader>

    <div class="space-y-4 py-4">
      <div class="space-y-2">
        <label for="edit-title" class="text-sm font-medium">
          Title (max 50 characters)
        </label>
        <Input
          id="edit-title"
          bind:value={editTitle}
          maxlength={50}
          placeholder="Enter topic title"
        />
        <p class="text-xs text-muted-foreground text-right">
          {editTitle.length}/50
        </p>
      </div>

      <div class="space-y-2">
        <label for="edit-description" class="text-sm font-medium">
          Description (max 155 characters)
        </label>
        <Textarea
          id="edit-description"
          bind:value={editDescription}
          maxlength={155}
          placeholder="Describe your topic"
          rows={4}
        />
        <p class="text-xs text-muted-foreground text-right">
          {editDescription.length}/155
        </p>
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onclick={() => editDialogOpen = false}
      >
        Cancel
      </Button>
      <Button
        onclick={updateTopic}
        disabled={editing || !editTitle || !editDescription}
      >
        {editing ? "Saving..." : "Save Changes"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog.Root>
