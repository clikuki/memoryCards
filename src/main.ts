import { getSymbols } from './symbols.js';
import { Card } from './card.js';
import { Grid } from './grid.js';
import { ai } from './ai.js';

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

function getCards() {
	return getSymbols((rows * columns) / 2).flatMap((symbol) => {
		return [new Card(symbol), new Card(symbol)];
	});
}

function doWinAnimation() {
	disableFlip = true;
	function wave() {
		cards.forEach((card, i) => {
			setTimeout(() => {
				card.flip();
				if (i === cards.length - 1) {
					disableFlip = false;
				}
			}, (Math.floor(i / columns) + (i % columns)) * 150);
		});
	}
	wave();
	setTimeout(wave, Math.floor(columns - 1) + (columns - 1) * 150);
}

function changeCardSymbols() {
	const symbols = getSymbols((rows * columns) / 2);
	shuffle(cards).forEach((card, i) =>
		card.setSymbol(symbols[Math.floor(i / 2)]),
	);
}

const rows = 3;
const columns = 10;
let cards = shuffle(getCards());
const grid = new Grid(columns, rows, cards);

const restartBtn = document.createElement('button');
restartBtn.textContent = 'Restart';
restartBtn.addEventListener('click', () => {
	resetFlipCount();
	let flippedCount = 0;
	let flippedNow = 0;
	cards.forEach((card) => {
		if (card.isFlipped) {
			flippedCount++;
			card.flip().then(() => {
				if (++flippedNow >= flippedCount) {
					changeCardSymbols();
					disableFlip = false;
					prevCard = null;
				}
			});
		}
	});
});

const flipCounterElem = document.createElement('div');
let flipCount = 0;
flipCounterElem.textContent = 'Flips: 0';
document.body.append(grid.container, flipCounterElem, restartBtn);
function incrementFlipCount() {
	flipCounterElem.textContent = `Flips: ${++flipCount}`;
}
function resetFlipCount() {
	flipCount = 0;
	flipCounterElem.textContent = 'Flips: 0';
}

let prevCard: Card | null = null;
let disableFlip = false;
cards.forEach((card) =>
	card.container.addEventListener('click', () => {
		if (disableFlip || card.isFlipped) return;
		const flipPromise = card.flip();
		if (prevCard) {
			incrementFlipCount();
			if (prevCard.symbol !== card.symbol) {
				disableFlip = true;
				flipPromise.then(() => {
					disableFlip = false;
					prevCard!.flip();
					prevCard = null;
					card.flip();
				});
			} else {
				prevCard = null;
				if (cards.every((card) => card.isFlipped)) {
					flipPromise.then(doWinAnimation);
				}
			}
		} else prevCard = card;
	}),
);

ai(cards);
