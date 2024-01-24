import { getSymbols } from './symbols.js';
import { Card } from './card.js';
import { Solver } from './solve.js';

function shuffle<T>(arr: T[]): T[] {
	const copy = arr.slice();
	for (let i = arr.length - 1; i >= 1; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

function startWaveAnim() {
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

const columnSets = [
	['Easy', 6],
	['Normal', 8],
	['Hard', 12],
] as const;
let columnIndex = 0;

const rows = 3;
let columns = columnSets[columnIndex][1];
let cards: Card[];
let gameId = 0;

function resetCards() {
	const symbols = getSymbols((rows * columns) / 2);
	cards = shuffle(
		symbols.flatMap((symbol) => {
			return [new Card(symbol), new Card(symbol)];
		}),
	);

	for (const c of cards) {
		c.container.addEventListener('click', (e) => cardLogic(c, e));
	}

	const grid = document.querySelector('.grid') as HTMLDivElement;
	grid.style.setProperty('--columns', columns.toString());
	grid.style.setProperty('--rows', rows.toString());
	grid.replaceChildren(...cards.map((card) => card.container));
}
resetCards();

function resetVariables() {
	gameId++;
	prevCard = null;
	disableFlip = false;
	solveBtn.disabled = false;
	flipCount = 0;
	flipCounterElem.textContent = 'Flips: 0';
	if (solver) solver.cancel();
}

const restartBtn = document.querySelector('.restartBtn') as HTMLButtonElement;
restartBtn.addEventListener('click', () => {
	let remainingCards = 0;
	cards.forEach((card) => {
		if (card.isFlipped) {
			remainingCards++;
			card.flip().then(() => {
				if (--remainingCards <= 0) resetCards();
			});
		}
	});

	// No need to do if no cards were actually flipped up
	if (remainingCards) resetVariables();
});

let solver: ReturnType<typeof Solver> | null = null;
const solveBtn = document.querySelector('.solveBtn') as HTMLButtonElement;
solveBtn.textContent = 'Solve';
solveBtn.addEventListener('click', () => {
	if (solver) return;
	solveBtn.disabled = true;
	solveBtn.textContent = 'Solving...';
	solver = Solver(cards);
	solver.promise.finally(() => {
		const text = solver!.state() === 'FAILURE' ? 'Solve' : 'Solved';
		solveBtn.textContent = text;
		solver = null;
	});
});

const difficultyBtn = document.querySelector(
	'.difficultyBtn',
) as HTMLButtonElement;
difficultyBtn.textContent = columnSets[columnIndex][0];
difficultyBtn.addEventListener('click', () => {
	columnIndex = ++columnIndex % columnSets.length;
	difficultyBtn.textContent = columnSets[columnIndex][0];
	columns = columnSets[columnIndex][1];

	resetCards();
	resetVariables();
});

let flipCount = 0;
const flipCounterElem = document.querySelector(
	'.flipCounter',
) as HTMLParagraphElement;
flipCounterElem.textContent = 'Flips: 0';
function incrementFlipCount() {
	flipCounterElem.textContent = `Flips: ${++flipCount}`;
}

let prevCard: Card | null = null;
let disableFlip = false;
function cardLogic(card: Card, e: MouseEvent) {
	if (disableFlip || (solver && e.isTrusted) || card.isFlipped) return;

	let currentId = gameId;
	const flipPromise = card.flip();
	if (prevCard) {
		incrementFlipCount();
		if (prevCard.symbol === card.symbol) {
			prevCard = null;
			if (cards.every((card) => card.isFlipped)) {
				flipPromise.then(startWaveAnim);
			}
		} else {
			disableFlip = true;
			flipPromise.then(() => {
				if (currentId !== gameId) return;
				disableFlip = false;
				prevCard!.flip();
				prevCard = null;
				card.flip();
			});
		}
	} else prevCard = card;
}
