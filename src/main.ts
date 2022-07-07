import { getSymbols } from './symbols.js';
import { Card } from './card.js';
import { Grid } from './grid.js';

function shuffle<T>(arr: T[]): T[] {
	const shuffled = [];
	const copy = arr.slice();
	while (copy.length) {
		shuffled.push(
			...copy.splice(Math.floor(Math.random() * copy.length), 1),
		);
	}
	return shuffled;
}

const rows = 3;
const columns = 10;
const cards = shuffle(
	getSymbols((rows * columns) / 2).flatMap((symbol) => {
		return [new Card(symbol), new Card(symbol)];
	}),
);
const grid = new Grid(columns, rows, cards);
document.body.appendChild(grid.container);

let prevCard: Card | null = null;
let disableFlip = false;
cards.forEach((card) =>
	card.container.addEventListener('click', () => {
		if (disableFlip || card.isFlipped) return;
		card.flip();
		if (prevCard) {
			if (prevCard.symbol !== card.symbol) {
				disableFlip = true;
				setTimeout(() => {
					disableFlip = false;
					prevCard!.flip();
					prevCard = null;
					card.flip();
				}, 1000);
			} else prevCard = null;
		} else prevCard = card;
	}),
);
