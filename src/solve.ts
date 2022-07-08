import { Card } from './card';

interface Memory {
	[key: string]: [number, number?];
}

export function solve(cards: Card[]) {
	let cancel = false;
	const obj = {
		cancel: () => (cancel = true),
		promise: new Promise<void>((res, rej) => {
			const memory: Memory = {};
			const flippedIndices: Set<number> = new Set();
			const matchedIndices: Set<number> = new Set();
			let prevCardIndex: number | null = null;

			// Initialize values
			cards.forEach((card, i) => {
				if (!card.isFlipped) return;
				flippedIndices.add(i);
				const symbol = card.symbol;
				if (!memory[symbol]) memory[symbol] = [i];
				else {
					matchedIndices.add(i);
					matchedIndices.add(memory[symbol][0]);
					delete memory[symbol];
				}
			});
			Object.entries(memory).forEach(
				([, [index]]) => (prevCardIndex = index),
			);

			function allCardsAreFlipped() {
				return matchedIndices.size === cards.length;
			}
			function getCardIndex() {
				for (const key in memory) {
					const [indexA, indexB] = memory[key];
					if (typeof indexB === 'number') {
						return cards[indexA].isFlipped ? indexB : indexA;
					}
				}

				const indices = cards
					.map((_, i) => i)
					.filter(
						(i) => !matchedIndices.has(i) && !flippedIndices.has(i),
					);
				const index =
					indices[Math.floor(Math.random() * indices.length)];
				return index;
			}
			(function flip() {
				if (cancel) {
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
						if (!memory[symbol]) memory[symbol] = [index];
						else if (memory[symbol].length === 1)
							memory[symbol][1] = index;
						if (prevCardIndex !== null) {
							if (cards[prevCardIndex].symbol === card.symbol) {
								matchedIndices.add(prevCardIndex);
								matchedIndices.add(index);
								delete memory[symbol];
							}
							prevCardIndex = null;
						} else prevCardIndex = index;
						if (allCardsAreFlipped()) res();
						else flip();
					},
					{ once: true },
				);
			})();
		}),
	};
	return obj;
}
