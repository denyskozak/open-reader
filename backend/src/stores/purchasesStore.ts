const purchases = new Map<string, boolean>();

export const getPurchased = (bookId: string): boolean => {
  return purchases.get(bookId) ?? false;
};

export const setPurchased = (bookId: string, value: boolean): void => {
  purchases.set(bookId, value);
};
