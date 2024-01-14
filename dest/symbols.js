const symbols = [
    '■',
    '□',
    '▣',
    '▤',
    '▥',
    '▦',
    '▧',
    '▨',
    '▬',
    '▭',
    '▮',
    '▯',
    '▰',
    '▱',
    '▲',
    '△',
    '▴',
    '▵',
    '▶',
    '▷',
    '▸',
    '▹',
    '►',
    '▻',
    '▼',
    '▽',
    '▾',
    '▿',
    '◀',
    '◁',
    '◂',
    '◃',
    '◄',
    '◅',
    '◆',
    '◇',
    '◈',
    '◉',
    '◊',
    '◍',
    '●',
    '◐',
    '◑',
    '◒',
    '◓',
    '◔',
    '◕',
    '◖',
    '◗',
    '◜',
    '◝',
    '◞',
    '◟',
    '◠',
    '◡',
    '◢',
    '◣',
    '◤',
    '◥',
    '◧',
    '◨',
    '◩',
    '◪',
    '◫',
    '◬',
    '◭',
    '◮',
    '◯',
    '◰',
    '◱',
    '◲',
    '◳',
    '◴',
    '◵',
    '◶',
    '◷',
    '◸',
    '◹',
    '◺',
    '◿',
];
export function getSymbols(count) {
    const copy = symbols.slice();
    const randomSymbols = [];
    while (randomSymbols.length < count) {
        const index = Math.floor(Math.random() * copy.length);
        const [symbol] = copy.splice(index, 1);
        randomSymbols.push(symbol);
    }
    return randomSymbols;
}
//# sourceMappingURL=symbols.js.map