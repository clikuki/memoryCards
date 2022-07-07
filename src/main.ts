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
		card.changeSymbol(symbols[Math.floor(i / 2)]),
	);
}

const rows = 3;
const columns = 10;
let cards = shuffle(getCards());
const grid = new Grid(columns, rows, cards);

const restartBtn = document.createElement('button');
restartBtn.classList.add('restartBtn');
restartBtn.textContent = 'Restart';
restartBtn.addEventListener('click', () => {
	if (flipHandler !== null) clearTimeout(flipHandler);
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
let flipHandler: null | number = null;
cards.forEach((card) =>
	card.container.addEventListener('click', () => {
		if (disableFlip || card.isFlipped) return;
		card.flip();
		if (prevCard) {
			if (prevCard.symbol !== card.symbol) {
				disableFlip = true;
				flipHandler = setTimeout(() => {
					disableFlip = false;
					prevCard!.flip();
					prevCard = null;
					card.flip();
				}, 1000);
				incrementFlipCount();
			} else {
				prevCard = null;
				if (cards.every((card) => card.isFlipped)) {
					setTimeout(doWinAnimation, 500);
				}
			}
		} else prevCard = card;
	}),
);
