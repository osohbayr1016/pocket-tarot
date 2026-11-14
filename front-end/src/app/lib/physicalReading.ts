import type { TarotCard } from "../data/tarotCards";
import type { TarotSpread } from "../data/tarotSpreads";
import type { DrawnCard } from "./offlineEngine.ts";

export interface PhysicalCardSelection {
  cardId: number;
  isReversed: boolean;
}

/**
 * Record cards actually drawn from a physical Tarot deck.
 * This path never draws random cards, and it validates the full spread before
 * returning any results. No personal information is sent to a server.
 */
export function buildPhysicalReading(
  deck: readonly TarotCard[],
  spread: TarotSpread,
  selections: readonly PhysicalCardSelection[],
  options: { allowReversed?: boolean } = {}
): DrawnCard[] {
  if (!spread || !Number.isInteger(spread.cardCount) || spread.cardCount < 1 ||
      spread.cardCount > 12 || !Array.isArray(spread.positions) ||
      spread.positions.length !== spread.cardCount ||
      !Array.isArray(selections) || selections.length !== spread.cardCount) {
    throw new Error("Select one card for every position in the spread.");
  }

  const cardById = new Map(deck.map(card => [card.id, card]));
  if (cardById.size !== deck.length) {
    throw new Error("The Tarot deck contains duplicate card IDs.");
  }

  const seen = new Set<number>();
  return selections.map((choice, index) => {
    const position = spread.positions[index];
    if (!position || position.position !== index + 1 ||
        typeof position.name !== "string" ||
        typeof position.description !== "string" ||
        !choice || !Number.isInteger(choice.cardId) ||
        typeof choice.isReversed !== "boolean") {
      throw new Error("Invalid card or spread position.");
    }
    const card = cardById.get(choice.cardId);
    if (!card) throw new Error("The selected card is not in this deck.");
    if (seen.has(choice.cardId)) {
      throw new Error("The same physical card cannot occupy two positions.");
    }
    seen.add(choice.cardId);
    return {
      card,
      position: position.position,
      positionName: position.name,
      positionDescription: position.description,
      isReversed: options.allowReversed === false ? false : choice.isReversed,
    };
  });
}
