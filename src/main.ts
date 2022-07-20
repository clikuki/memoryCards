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

const columnSets = [6, 8, 12];
const dificultText = ['Easy', 'Normal', 'Hard'];
let difficultyIndex = 0;

const rows = 3;
let columns = columnSets[difficultyIndex];
let cards = shuffle(getCards());
let grid = new Grid(columns, rows, cards);
let gameId = 0;

const restartBtn = document.querySelector('.restartBtn') as HTMLButtonElement;
restartBtn.addEventListener('click', () => {
	gameId++;
	resetFlipCount();
	if (solveObj) {
		solveObj.cancel();
		solveObj = null;
	}
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
const solveBtn = document.querySelector('.solveBtn') as HTMLButtonElement;
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
			solveBtn.textContent = 'Solved';
		})
		.catch(() => {
			solveBtn.textContent = 'Solve';
		})
		.finally(() => {
			solveObj = null;
			isSolving = false;
			solveBtn.disabled = false;
		});
});

const difficultyBtn = document.querySelector(
	'.difficultyBtn',
) as HTMLButtonElement;
difficultyBtn.textContent = dificultText[difficultyIndex];
difficultyBtn.addEventListener('click', () => {
	difficultyIndex = ++difficultyIndex % dificultText.length;
	difficultyBtn.textContent = dificultText[difficultyIndex];
	columns = columnSets[difficultyIndex];
	cards = shuffle(getCards());
	cards.forEach((card) =>
		card.container.addEventListener('click', (e) => lifecycle(card, e)),
	);
	const newGrid = new Grid(columns, rows, cards);
	grid.container.replaceWith(newGrid.container);
	grid = newGrid;
	gameId++;
	if (solveObj) {
		solveObj.cancel();
		solveObj = null;
	}
	isSolved = false;
	prevCard = null;
	disableFlip = false;
});

let flipCount = 0;
const flipCounterElem = document.querySelector(
	'.flipCounter',
) as HTMLParagraphElement;
flipCounterElem.textContent = 'Flips: 0';
function incrementFlipCount() {
	flipCounterElem.textContent = `Flips: ${++flipCount}`;
}
function resetFlipCount() {
	flipCount = 0;
	flipCounterElem.textContent = 'Flips: 0';
}
document.body.replaceChild(grid.container, document.querySelector('.tmp')!);

let prevCard: Card | null = null;
let disableFlip = false;
function lifecycle(card: Card, e: MouseEvent) {
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
}
cards.forEach((card) =>
	card.container.addEventListener('click', (e) => lifecycle(card, e)),
);
