<script lang="ts">
import { Button } from "$lib/components/ui/button/index.js";
import {
  getPublicClient,
  getConnectedAddress,
  getIsConnected,
  getConnectionError,
  connectWallet,
  disconnectWallet,
  isWalletAvailable,
  getEnsName,
} from "$lib/states/client.svelte.ts";
import { onMount } from "svelte";

let blockNumber = $state<bigint | null>(null);

onMount(async () => {
  const publicClient = getPublicClient();
  blockNumber = await publicClient.getBlockNumber();
});

async function handleConnect() {
  await connectWallet();
}

function handleDisconnect() {
  disconnectWallet();
}
</script>

<h1>Welcome to SvelteKit</h1>
<p>
    Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the
    documentation
</p>

<div>
    <h2>Network Info</h2>
    <p>Current block number: {blockNumber ?? "Loading..."}</p>
</div>

<div>
    <h2>Wallet Connection</h2>
    {#if !isWalletAvailable()}
        <p style="color: orange;">
            No Ethereum provider detected. Please install MetaMask or another
            Web3 wallet.
        </p>
    {:else if getIsConnected()}
        <p style="color: green;">
            Connected: {getEnsName() ?? getConnectedAddress()}
        </p>
        <Button onclick={handleDisconnect}>Disconnect Wallet</Button>
    {:else}
        <Button onclick={handleConnect}>Connect Wallet</Button>
        {#if getConnectionError()}
            <p style="color: red;">{getConnectionError()}</p>
        {/if}
    {/if}
</div>
