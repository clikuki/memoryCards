/* CSS only flipping card by Eddy Sims from https://codepen.io/edeesims/pen/wvpYWW */
export class Card {
	container = document.createElement('div');
	content = document.createElement('div');
	isFlipped = false;
	isFlipping = false;
	symbol = '';
	constructor(symbol: string) {
		this.symbol = symbol;
		this.content.setAttribute('data-symbol', symbol);
		this.container.classList.add('card');
		this.content.classList.add('content');
		this.container.appendChild(this.content);
	}
	flip() {
		return new Promise<void>((rec) => {
			this.container.classList.toggle('flipped');
			this.isFlipped = !this.isFlipped;
			this.container.addEventListener('transitionend', () => rec(), {
				once: true,
			});
		});
	}
}
