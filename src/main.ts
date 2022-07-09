import { getSymbols } from './symbols.js';
import { Card } from './card.js';
import { Grid } from './grid.js';
import { solve } from './solve.js';

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
	let count = 2;
	(function wave() {
		cards.forEach((card, i) => {
			setTimeout(() => {
				card.flip().then(() => {
					if (i !== 0) return;
					if (--count <= 0) disableFlip = false;
					else wave();
				});
			}, (Math.floor(i / columns) + (i % columns)) * 150);
		});
	})();
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
let gameId = 0;

const btnContainer = document.createElement('div');
btnContainer.classList.add('btn-container');
const restartBtn = document.createElement('button');
restartBtn.textContent = 'Restart';
restartBtn.addEventListener('click', () => {
	gameId++;
	resetFlipCount();
	if (solveObj) {
		solveObj.cancel();
		solveObj = null;
	}
	solveBtn.textContent = 'Solve';
	solveBtn.disabled = false;
	let flippedCount = 0;
	let flippedNow = 0;
	cards.forEach((card) => {
		if (card.isFlipped) {
			flippedCount++;
			card.flip().then(() => {
				if (++flippedNow >= flippedCount) {
					changeCardSymbols();
					disableFlip = false;
					isSolved = false;
					prevCard = null;
				}
			});
		}
	});
});

let isSolving = false;
let isSolved = false;
let solveObj: ReturnType<typeof solve> | null = null;
const solveBtn = document.createElement('button');
solveBtn.textContent = 'Solve';
solveBtn.addEventListener('click', () => {
	if (isSolving || isSolved) return;
	isSolving = true;
	solveBtn.disabled = true;
	solveBtn.textContent = 'Solving...';
	solveObj = solve(cards);
	solveObj.promise
		.then(() => {
			isSolved = true;
		})
		.finally(() => {
			solveObj = null;
			isSolving = false;
			solveBtn.textContent = 'Solved';
		});
});

const flipCounterElem = document.createElement('div');
let flipCount = 0;
flipCounterElem.textContent = 'Flips: 0';
function incrementFlipCount() {
	flipCounterElem.textContent = `Flips: ${++flipCount}`;
}
function resetFlipCount() {
	flipCount = 0;
	flipCounterElem.textContent = 'Flips: 0';
}
btnContainer.append(restartBtn, solveBtn);
document.body.append(grid.container, flipCounterElem, btnContainer);

let prevCard: Card | null = null;
let disableFlip = false;
cards.forEach((card) =>
	card.container.addEventListener('click', (e) => {
		if (disableFlip || (isSolving && e.isTrusted) || card.isFlipped) return;
		let currentId = gameId;
		const flipPromise = card.flip();
		if (prevCard) {
			incrementFlipCount();
			if (prevCard.symbol !== card.symbol) {
				disableFlip = true;
				flipPromise.then(() => {
					if (currentId !== gameId) return;
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
