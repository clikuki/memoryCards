export class Card {
	container = document.createElement('div');
	content = document.createElement('div');
	front = document.createElement('div');
	back = document.createElement('div');
	isFlipped = false;
	symbol: string;
	constructor(symbol: string) {
		this.container.classList.add('card');
		this.content.classList.add('content');
		this.front.classList.add('front');
		this.back.classList.add('back');
		this.front.textContent = '?';
		this.back.textContent = symbol;
		this.symbol = symbol;
		this.content.append(this.front, this.back);
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
	changeSymbol(symbol: string) {
		this.symbol = symbol;
		this.back.textContent = symbol;
	}
}
