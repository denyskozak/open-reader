export type StarState = "full" | "half" | "empty";

export function formatRating(value: number, fractionDigits = 1): string {
  if (Number.isNaN(value)) {
    return "0";
  }

  const formatted = value.toFixed(fractionDigits);
  return formatted.replace(/\.0+$/, "");
}

export function buildStarStates(rating: number, max = 5): StarState[] {
  const stars: StarState[] = [];
  const normalized = Math.max(0, Math.min(rating, max));

  for (let index = 1; index <= max; index += 1) {
    const diff = normalized - index + 1;

    if (diff >= 1) {
      stars.push("full");
    } else if (diff > 0) {
      stars.push("half");
    } else {
      stars.push("empty");
    }
  }

  return stars;
}
