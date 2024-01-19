export function Solver(cards) {
    let cancel = false;
    let state = 'IN PROGRESS';
    const obj = {
        cancel: () => (cancel = true),
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
                if (cancel) {
                    state = 'FAILURE';
                    rej('canceled');
                    return;
                }
                const index = getCardIndex();
                const card = cards[index];
                card.container.click();
                card.container.addEventListener('transitionend', () => {
                    flippedIndices.add(index);
                    const symbol = card.symbol;
                    if (!memory.has(symbol))
                        memory.set(symbol, [index]);
                    else {
                        const entry = memory.get(symbol);
                        if (entry.length === 1)
                            memory.get(symbol)[1] = index;
                        if (prevCardIndex === null)
                            prevCardIndex = index;
                        else {
                            if (cards[prevCardIndex].symbol === card.symbol) {
                                matchedIndices.add(prevCardIndex);
                                matchedIndices.add(index);
                                memory.delete(symbol);
                            }
                            prevCardIndex = null;
                        }
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