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
    } else {
      connectionError = "No addresses available";
    }
  } catch (err) {
    connectionError =
      err instanceof Error ? err.message : "Failed to connect wallet";
    isConnected = false;
  }
}

export function disconnectWallet() {
  connectedAddress = null;
  isConnected = false;
  connectionError = null;
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
