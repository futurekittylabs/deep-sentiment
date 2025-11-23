import { createPublicClient, createWalletClient, custom, http } from "viem";
import { mainnet } from "viem/chains";
import type { Address, PublicClient, WalletClient } from "viem";

// Provider
const isBrowser = typeof window !== "undefined";
const ethereumProvider = isBrowser ? window.ethereum : undefined;

// LocalStorage key
const STORAGE_KEY = "wallet_connected_address";

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

      // Persist connection to localStorage
      if (isBrowser) {
        localStorage.setItem(STORAGE_KEY, addresses[0]);
      }

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

  // Clear persisted connection
  if (isBrowser) {
    localStorage.removeItem(STORAGE_KEY);
  }
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

// Auto-reconnect on page load
async function autoReconnect() {
  if (!isBrowser || !walletClient) return;

  const storedAddress = localStorage.getItem(STORAGE_KEY);
  if (!storedAddress) return;

  try {
    const accounts = await walletClient.getAddresses();

    // Check if we have any accounts authorized
    if (accounts.length > 0) {
      // Use the currently selected account (first one)
      const currentAccount = accounts[0];
      connectedAddress = currentAccount;
      isConnected = true;

      // Update storage if it changed
      if (currentAccount !== storedAddress) {
        localStorage.setItem(STORAGE_KEY, currentAccount);
      }

      await fetchEnsName(currentAccount);
    } else {
      // No accounts available, clear storage
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // If unable to get addresses, clear storage
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Listen for account changes
if (isBrowser && ethereumProvider) {
  ethereumProvider.on?.("accountsChanged", (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected from wallet
      disconnectWallet();
    } else if (isConnected && accounts[0] !== connectedAddress) {
      // Account switched
      connectedAddress = accounts[0] as Address;
      localStorage.setItem(STORAGE_KEY, accounts[0]);
      fetchEnsName(accounts[0] as Address);
    }
  });

  // Run auto-reconnect on module load
  autoReconnect();
}
