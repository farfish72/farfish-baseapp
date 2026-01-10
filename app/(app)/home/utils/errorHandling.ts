interface AppError {
  message: string;
  code?: string;
  shouldShow?: boolean;
}

export function handleWalletError(error: any): AppError {
  if (error?.message?.includes('User rejected') || error?.message?.includes('User denied')) {
    return { message: 'Transaction cancelled by user', shouldShow: false };
  }
  if (error?.message?.includes('insufficient funds')) {
    return { message: 'Insufficient funds for transaction', shouldShow: true };
  }
  return { message: 'Wallet error occurred. Please try again.', shouldShow: true };
}

export function handleTransactionError(error: any): AppError {
  if (error?.message?.includes('User rejected') || error?.message?.includes('User denied')) {
    return { message: 'Transaction cancelled by user', shouldShow: false };
  }
  if (error?.message?.includes('insufficient funds')) {
    return { message: 'Insufficient funds for transaction', shouldShow: true };
  }
  if (error?.message?.includes('execution reverted')) {
    return { message: 'Transaction failed. Please check conditions and try again.', shouldShow: true };
  }
  return { message: 'Transaction error occurred. Please try again.', shouldShow: true };
}

export function checkWalletConnection(address?: string, isConnected?: boolean): AppError | null {
  if (!isConnected || !address) {
    return { message: 'Please connect your wallet first', shouldShow: true };
  }
  return null;
}

export function checkNetwork(chainId?: number): AppError | null {
  const BASE_CHAIN_ID = 8453;
  if (chainId && chainId !== BASE_CHAIN_ID) {
    return { message: 'Please switch to Base network', shouldShow: true };
  }
  return null;
}