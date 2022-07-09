export class Grid {
    constructor(columns, rows, cards) {
        this.container = document.createElement('div');
        this.cards = [];
        this.columns = columns;
        this.rows = rows;
        this.container.style.setProperty('--columns', columns.toString());
        this.container.style.setProperty('--rows', rows.toString());
        this.container.classList.add('grid');
        if (cards)
            this.add(...cards);
    }
    add(...cards) {
        this.cards.push(...cards);
        this.container.append(...cards.map((card) => card.container));
    }
}
//# sourceMappingURL=grid.js.map