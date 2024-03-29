export function Solver(cards) {
    let state = 'IN PROGRESS';
    let rejected = false;
    const obj = {
        cancel: () => {
            if (state !== 'IN PROGRESS')
                return;
            state = 'FAILURE';
        },
        state: () => state,
        promise: new Promise((res, rej) => {
            const memory = new Map();
            const flippedIndices = new Set();
            const matchedIndices = new Set();
            let prevCardIndex = null;
            cards.forEach((card, i) => {
                if (!card.isFlipped)
                    return;
                flippedIndices.add(i);
                const symbol = card.symbol;
                if (!memory.has(symbol))
                    memory.set(symbol, [i]);
                else {
                    matchedIndices.add(i);
                    matchedIndices.add(memory.get(symbol)[0]);
                    memory.delete(symbol);
                }
            });
            switch (Object.keys(memory).length) {
                case 2:
                    const card = cards[Object.values(memory)[0][0]];
                    card.container.addEventListener('transitionend', () => {
                        if (card.isFlipped)
                            card.container.addEventListener('transitionend', flipCard, {
                                once: true,
                            });
                        else
                            flipCard();
                    }, {
                        once: true,
                    });
                    break;
                case 1:
                    Object.values(memory).forEach(([index]) => (prevCardIndex = index));
                case 0:
                default:
                    flipCard();
                    break;
            }
            function getCardIndex() {
                for (const [, [indexA, indexB]] of memory) {
                    if (indexB !== undefined) {
                        return cards[indexA].isFlipped ? indexB : indexA;
                    }
                }
                const indices = cards
                    .map((_, i) => i)
                    .filter((i) => !matchedIndices.has(i) && !flippedIndices.has(i));
                const index = indices[Math.floor(Math.random() * indices.length)];
                return index;
            }
            function flipCard() {
                if (state !== 'IN PROGRESS') {
                    if (!rejected) {
                        rejected = true;
                        rej();
                    }
                    return;
                }
                const index = getCardIndex();
                const card = cards[index];
                card.container.click();
                card.container.addEventListener('transitionend', () => {
                    flippedIndices.add(index);
                    const syms = [card.symbol];
                    if (prevCardIndex !== null)
                        syms.push(cards[prevCardIndex].symbol);
                    console.log(...syms);
                    const symbol = card.symbol;
                    if (memory.has(symbol)) {
                        const mem = memory.get(symbol);
                        if (mem[1] === undefined)
                            mem[1] = index;
                        if (prevCardIndex === null)
                            prevCardIndex = index;
                        else {
                            if (cards[prevCardIndex].symbol === symbol) {
                                matchedIndices.add(prevCardIndex);
                                matchedIndices.add(index);
                                memory.delete(symbol);
                            }
                            prevCardIndex = null;
                        }
                    }
                    else {
                        memory.set(symbol, [index]);
                        if (prevCardIndex === null)
                            prevCardIndex = index;
                        else
                            prevCardIndex = null;
                    }
                    if (matchedIndices.size === cards.length) {
                        state = 'SUCCESS';
                        res();
                    }
                    else
                        flipCard();
                }, { once: true });
            }
        }),
    };
    return obj;
}
//# sourceMappingURL=solve.js.map