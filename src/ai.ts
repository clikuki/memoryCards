import { Card } from './card';

interface Memory {
	[key: string]: [number, number?];
}

export function ai(cards: Card[]) {
	const memory: Memory = {};
	const permMemory: Memory = {};
	const flippedIndices: Set<number> = new Set();
	const matchedIndices: Set<number> = new Set();
	let prevCardIndex: number | null = null;
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
			.filter((i) => !matchedIndices.has(i) && !flippedIndices.has(i));
		const index = indices[Math.floor(Math.random() * indices.length)];
		return index;
	}
	function flip() {
		const index = getCardIndex();
		console.log(index);
		const card = cards[index];
		card.container.click();
		card.container.addEventListener(
			'transitionend',
			() => {
				flippedIndices.add(index);
				const symbol = card.symbol;
				if (!memory[symbol]) memory[symbol] = [index];
				// else if (
				// 	memory[symbol][0] === prevCardIndex ||
				// 	memory[symbol][1] === prevCardIndex
				// )
				// 	delete memory[symbol];
				else if (memory[symbol].length === 1) memory[symbol][1] = index;
				if (!permMemory[symbol]) permMemory[symbol] = [index];
				else if (permMemory[symbol].length === 1)
					permMemory[symbol][1] = index;
				if (prevCardIndex) {
					if (cards[prevCardIndex].symbol === card.symbol) {
						matchedIndices.add(prevCardIndex);
						matchedIndices.add(index);
						delete memory[symbol];
					}
					prevCardIndex = null;
				} else prevCardIndex = index;
				if (!allCardsAreFlipped()) flip();
			},
			{
				once: true,
			},
		);
	}
	setTimeout(flip, 100);
	// // @ts-ignore
	// window.flip = flip;
	// @ts-ignore
	window.matchedIndices = matchedIndices;
	// // @ts-ignore
	// window.flippedIndices = flippedIndices;
	// @ts-ignore
	window.memory = permMemory;
}
