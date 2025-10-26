const purchases = new Map<string, { purchased: boolean; paymentId?: string; purchasedAt?: string }>();

export const getPurchased = (bookId: string): boolean => {
  return purchases.get(bookId)?.purchased ?? false;
};

export const setPurchased = (bookId: string, paymentId: string): void => {
  purchases.set(bookId, { purchased: true, paymentId, purchasedAt: new Date().toISOString() });
};

export const getPurchaseDetails = (bookId: string): { paymentId?: string; purchasedAt?: string } | undefined => {
  const record = purchases.get(bookId);
  if (!record?.purchased) {
    return undefined;
  }

  return { paymentId: record.paymentId, purchasedAt: record.purchasedAt };
};

export const listPurchasedBooks = (): Array<{ bookId: string; paymentId?: string; purchasedAt?: string }> => {
  return Array.from(purchases.entries())
    .filter(([, value]) => value.purchased)
    .map(([bookId, value]) => ({ bookId, paymentId: value.paymentId, purchasedAt: value.purchasedAt }));
};
