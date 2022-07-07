import { Card } from './card';
export class Grid {
	container = document.createElement('div');
	cards: Card[] = [];
	columns: number;
	rows: number;
	constructor(columns: number, rows: number, cards?: Card[]) {
		this.columns = columns;
		this.rows = rows;
		this.container.style.setProperty('--columns', columns.toString());
		this.container.style.setProperty('--rows', rows.toString());
		this.container.classList.add('grid');
		if (cards) this.add(...cards);
	}
	add(...cards: Card[]) {
		this.cards.push(...cards);
		this.container.append(...cards.map((card) => card.container));
	}
}
