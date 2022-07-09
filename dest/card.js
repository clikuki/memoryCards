export class Card {
    constructor(symbol) {
        this.container = document.createElement('div');
        this.content = document.createElement('div');
        this.isFlipped = false;
        this.symbol = '';
        this.setSymbol(symbol);
        this.container.classList.add('card');
        this.content.classList.add('content');
        this.container.appendChild(this.content);
    }
    flip() {
        return new Promise((rec) => {
            this.container.classList.toggle('flipped');
            this.isFlipped = !this.isFlipped;
            this.container.addEventListener('transitionend', () => rec(), {
                once: true,
            });
        });
    }
    setSymbol(symbol) {
        this.symbol = symbol;
        this.content.setAttribute('data-symbol', symbol);
    }
}
//# sourceMappingURL=card.js.map