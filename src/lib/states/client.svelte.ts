import { createPublicClient, createWalletClient, custom, http } from "viem";
import { mainnet } from "viem/chains";
import type { Address, PublicClient, WalletClient } from "viem";

// Provider
const isBrowser = typeof window !== "undefined";
const ethereumProvider = isBrowser ? window.ethereum : undefined;

// Clients
const publicClient = $state<PublicClient>(
  createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
);

const walletClient = $state<WalletClient | null>(
  ethereumProvider
    ? createWalletClient({
        chain: mainnet,
        transport: custom(ethereumProvider),
      })
    : null,
);

// State
let connectedAddress = $state<Address | null>(null);
let isConnected = $state(false);
let connectionError = $state<string | null>(null);
let ensName = $state<string | null>(null);

// Actions
export async function connectWallet() {
  if (!walletClient) {
    connectionError = "No Ethereum provider found. Please install MetaMask.";
    return;
  }

  try {
    connectionError = null;
    const addresses = await walletClient.requestAddresses();

    if (addresses.length > 0) {
      connectedAddress = addresses[0];
      isConnected = true;

      // Fetch ENS name for the connected address
      await fetchEnsName(addresses[0]);
    } else {
      connectionError = "No addresses available";
    }
  } catch (err) {
    connectionError =
      err instanceof Error ? err.message : "Failed to connect wallet";
    isConnected = false;
  }
}

async function fetchEnsName(address: Address) {
  try {
    ensName = await publicClient.getEnsName({ address });
  } catch {
    // If ENS lookup fails, just keep ensName as null
    ensName = null;
  }
}

export function disconnectWallet() {
  connectedAddress = null;
  isConnected = false;
  connectionError = null;
  ensName = null;
}

export function isWalletAvailable() {
  return ethereumProvider !== undefined;
}

// Getters
export function getPublicClient() {
  return publicClient;
}

export function getWalletClient() {
  return walletClient;
}

export function getConnectedAddress() {
  return connectedAddress;
}

export function getIsConnected() {
  return isConnected;
}

export function getConnectionError() {
  return connectionError;
}

export function getEnsName() {
  return ensName;
}
