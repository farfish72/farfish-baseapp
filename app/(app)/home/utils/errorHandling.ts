interface AppError {
  message: string;
  code?: string;
}

export function handleWalletError(error: any): AppError {
  if (error?.message?.includes('User rejected')) {
    return { message: 'Transaction cancelled by user' };
  }
  if (error?.message?.includes('insufficient funds')) {
    return { message: 'Insufficient funds for transaction' };
  }
  return { message: 'Wallet error occurred. Please try again.' };
}

export function handleTransactionError(error: any): AppError {
  if (error?.message?.includes('User rejected')) {
    return { message: 'Transaction cancelled by user' };
  }
  if (error?.message?.includes('insufficient funds')) {
    return { message: 'Insufficient funds for transaction' };
  }
  if (error?.message?.includes('execution reverted')) {
    return { message: 'Transaction failed. Please check conditions and try again.' };
  }
  return { message: 'Transaction error occurred. Please try again.' };
}

export function checkWalletConnection(address?: string, isConnected?: boolean): AppError | null {
  if (!isConnected || !address) {
    return { message: 'Please connect your wallet first' };
  }
  return null;
}

export function checkNetwork(chainId?: number): AppError | null {
  const BASE_CHAIN_ID = 8453;
  if (chainId && chainId !== BASE_CHAIN_ID) {
    return { message: 'Please switch to Base network' };
  }
  return null;
}