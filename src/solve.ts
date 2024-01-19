import { Card } from './card';

// Returns an object with a promise and a method to cancel said promise
// TODO: Fix it cause its broken somehow
export function Solver(cards: Card[]) {
	let cancel = false;
	let state: 'IN PROGRESS' | 'SUCCESS' | 'FAILURE' = 'IN PROGRESS';
	const obj = {
		cancel: () => (cancel = true),
		state: () => state,
		promise: new Promise<void>((res, rej) => {
			const memory = new Map<string, [number, number?]>();
			const flippedIndices: Set<number> = new Set();
			const matchedIndices: Set<number> = new Set();
			let prevCardIndex: number | null = null;

			// Initialize values
			cards.forEach((card, i) => {
				if (!card.isFlipped) return;
				flippedIndices.add(i);
				const symbol = card.symbol;
				if (!memory.has(symbol)) memory.set(symbol, [i]);
				else {
					matchedIndices.add(i);
					matchedIndices.add(memory.get(symbol)![0]);
					memory.delete(symbol);
				}
			});

			// only two cards can be flipped and non-matching at most
			switch (Object.keys(memory).length) {
				case 2:
					const card = cards[Object.values(memory)[0][0]];
					card.container.addEventListener(
						'transitionend',
						() => {
							if (card.isFlipped)
								card.container.addEventListener('transitionend', flipCard, {
									once: true,
								});
							else flipCard();
						},
						{
							once: true,
						},
					);
					break;
				case 1:
					Object.values(memory).forEach(([index]) => (prevCardIndex = index));
				case 0:
				default:
					flipCard();
					break;
			}

			function getCardIndex() {
				for (const [, [indexA, indexB]] of memory) {
					if (indexB !== undefined) {
						return cards[indexA].isFlipped ? indexB : indexA;
					}
				}

				const indices = cards
					.map((_, i) => i)
					.filter((i) => !matchedIndices.has(i) && !flippedIndices.has(i));
				const index = indices[Math.floor(Math.random() * indices.length)];
				return index;
			}

			function flipCard() {
				if (cancel) {
					state = 'FAILURE';
					rej('canceled');
					return;
				}

				const index = getCardIndex();
				const card = cards[index];
				card.container.click();
				card.container.addEventListener(
					'transitionend',
					() => {
						flippedIndices.add(index);

						const symbol = card.symbol;
						if (!memory.has(symbol)) memory.set(symbol, [index]);
						else {
							const entry = memory.get(symbol)!;
							if (entry.length === 1) memory.get(symbol)![1] = index;

							if (prevCardIndex === null) prevCardIndex = index;
							else {
								// Previous card matches current
								if (cards[prevCardIndex].symbol === card.symbol) {
									matchedIndices.add(prevCardIndex);
									matchedIndices.add(index);
									memory.delete(symbol);
								}

								prevCardIndex = null;
							}
						}

						// Have all cards been matched?
						if (matchedIndices.size === cards.length) {
							state = 'SUCCESS';
							res();
						} else flipCard();
					},
					{ once: true },
				);
			}
		}),
	};
	return obj;
}
