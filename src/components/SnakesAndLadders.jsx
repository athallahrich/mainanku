import React, { useState, useEffect } from 'react';

// ===== BOARD DATA =====
const LADDERS = { 2: 18, 5: 16, 19: 36, 23: 43, 35: 54, 44: 57, 53: 74, 64: 77, 84: 97 };
const SNAKES = { 27: 14, 46: 25, 56: 33, 68: 47, 73: 52, 88: 69, 93: 72, 95: 76 };

const CHALLENGES = {
    1: { text: "START - Mulai Dengan Berdoa 🙏", duration: 0, type: "start", icon: "🙏" },
    2: { text: "Cium Kening dari Pasangan Penuh Sayang", duration: 0, type: "action", icon: "😘" },
    5: { text: 'Ucapkan "I Love You"', duration: 0, type: "love", icon: "❤️" },
    6: { text: "30 Detik - Jari Jemari ke Badan Pasangan", duration: 30, type: "timer", icon: "🤚" },
    7: { text: "Buka Semua Pakaian Luar", duration: 0, type: "action", icon: "👔" },
    8: { text: 'Ucapkan "I Love You"', duration: 0, type: "love", icon: "❤️" },
    9: { text: "30 Detik - Hot Kiss", duration: 30, type: "timer", icon: "💋" },
    10: { text: "30 Detik - Hot Kiss", duration: 30, type: "timer", icon: "💋" },
    11: { text: "Buka Semua Pakaian Luar", duration: 0, type: "action", icon: "👔" },
    15: { text: "1 Menit - Oral Mr P di Miss V", duration: 60, type: "timer", icon: "😛" },
    16: { text: "1 Menit - Gaya di Meja / Kursi", duration: 60, type: "timer", icon: "🪑" },
    17: { text: 'Ucapkan "I Love You"', duration: 0, type: "love", icon: "❤️" },
    18: { text: "1 Menit - Memainkan Mr P / Miss V Pasangan", duration: 60, type: "timer", icon: "🫦" },
    19: { text: "1 Menit - Bisikkan Kata Romantis di Telinga", duration: 60, type: "timer", icon: "💕" },
    20: { text: "Buka Semua Pakaian Ini", duration: 0, type: "action", icon: "👔" },
    21: { text: "Buka Semua Pakaian Luar", duration: 0, type: "action", icon: "👔" },
    23: { text: "1 Menit - Massage Pasangan Anda", duration: 60, type: "timer", icon: "💆" },
    25: { text: 'Ucapkan "I Love You"', duration: 0, type: "love", icon: "❤️" },
    26: { text: "2 Menit - Gaya Bebas Pasangan", duration: 120, type: "timer", icon: "🔥" },
    28: { text: "2 Menit - Posisi Favorit Anda", duration: 120, type: "timer", icon: "🔥" },
    29: { text: "2 Menit - Hot Kiss & Pelukan", duration: 120, type: "timer", icon: "💋" },
    30: { text: "2 Menit - Pijat Punggung", duration: 120, type: "timer", icon: "💆" },
    31: { text: "2 Menit - Hot Kiss", duration: 120, type: "timer", icon: "💋" },
    34: { text: "2 Menit - Hot Kiss", duration: 120, type: "timer", icon: "💋" },
    35: { text: "2 Menit - Oral Mr P", duration: 120, type: "timer", icon: "😛" },
    36: { text: "2 Menit - Gaya Misionaris", duration: 120, type: "timer", icon: "🛏️" },
    37: { text: "2 Menit - Doggy di Kasur / Sofa", duration: 120, type: "timer", icon: "🐕" },
    38: { text: "2 Menit - Misionaris dengan Bantal", duration: 120, type: "timer", icon: "🛏️" },
    39: { text: "2 Menit - Misionaris Anda", duration: 120, type: "timer", icon: "🛏️" },
    44: { text: "1 Menit - Doggy di Kasur", duration: 60, type: "timer", icon: "🐕" },
    46: { text: "2 Menit - Hot Kiss", duration: 120, type: "timer", icon: "💋" },
    48: { text: "2 Menit - Gaya Bebas", duration: 120, type: "timer", icon: "🔥" },
    51: { text: "2 Menit - Hot Kiss", duration: 120, type: "timer", icon: "💋" },
    54: { text: "2 Menit - Posisi Pilihan Pasangan", duration: 120, type: "timer", icon: "🔥" },
    57: { text: "2 Menit - Hot Kiss", duration: 120, type: "timer", icon: "💋" },
    58: { text: "2 Menit - Hot Kiss", duration: 120, type: "timer", icon: "💋" },
    59: { text: "2 Menit - Misionaris", duration: 120, type: "timer", icon: "🛏️" },
    61: { text: "2 Menit - Doggy Style", duration: 120, type: "timer", icon: "🐕" },
    66: { text: "30 Detik - Hot Kiss Leher", duration: 30, type: "timer", icon: "💋" },
    67: { text: "30 Detik - Pilih Tantangan Yang Anda Keinginan", duration: 30, type: "timer", icon: "🎯" },
    68: { text: "Buat Pasangan Hingga Keinginan Terpenuhi", duration: 0, type: "action", icon: "😊" },
    73: { text: "3 Menit - Posisi Favorit Pasangan", duration: 180, type: "timer", icon: "❤️‍🔥" },
    74: { text: "2 Menit - Gaya Bebas", duration: 120, type: "timer", icon: "🔥" },
    76: { text: "2 Menit - Spooning", duration: 120, type: "timer", icon: "🥄" },
    81: { text: "2 Menit - Doggy Style", duration: 120, type: "timer", icon: "🐕" },
    86: { text: "2 Menit - Woman on Top", duration: 120, type: "timer", icon: "👩" },
    88: { text: "2 Menit - Gaya Bebas", duration: 120, type: "timer", icon: "🔥" },
    91: { text: "2 Menit - Posisi Favorit Anda", duration: 120, type: "timer", icon: "❤️‍🔥" },
    92: { text: "30 Detik - Hot Kiss", duration: 30, type: "timer", icon: "💋" },
    96: { text: "2 Menit - Gaya Bebas", duration: 120, type: "timer", icon: "🔥" },
    97: { text: "2 Menit - Challenge Terakhir", duration: 120, type: "timer", icon: "🔥" },
    98: { text: "2 Menit - Klimaks Bersama", duration: 120, type: "timer", icon: "💕" },
    99: { text: "2 Menit - Pelukan Pasca", duration: 120, type: "timer", icon: "🤗" },
    100: { text: "🏆 WINNER! Ucapkan Senada Cinta Anda ❤️", duration: 0, type: "winner", icon: "🏆" },
};


// ===== HELPERS =====
const getCellNumber = (gridRow, gridCol) => {
    const boardRow = 9 - gridRow;
    return boardRow % 2 === 0 ? boardRow * 10 + gridCol + 1 : boardRow * 10 + (9 - gridCol) + 1;
};

const getCellPosition = (cellNum) => {
    const boardRow = Math.floor((cellNum - 1) / 10);
    const posInRow = (cellNum - 1) % 10;
    return { gridRow: 9 - boardRow, gridCol: boardRow % 2 === 0 ? posInRow : 9 - posInRow };
};

const getCellCenter = (cellNum) => {
    const { gridRow, gridCol } = getCellPosition(cellNum);
    return { x: gridCol * 10 + 5, y: gridRow * 10 + 5 };
};

// ===== DICE COMPONENT =====
const DOTS = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function Dice({ value, isRolling }) {
    const [displayValue, setDisplayValue] = useState(1);
    useEffect(() => {
        if (!isRolling) { setDisplayValue(value || 1); return; }
        const interval = setInterval(() => setDisplayValue(Math.floor(Math.random() * 6) + 1), 60);
        return () => clearInterval(interval);
    }, [isRolling, value]);

    return (
        <div className={`sal-dice ${isRolling ? 'rolling' : ''}`}>
            <svg viewBox="0 0 100 100">
                {(DOTS[displayValue] || DOTS[1]).map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={10} fill="#333" />
                ))}
            </svg>
        </div>
    );
}

// ===== SVG OVERLAY =====
function BoardOverlay() {
    const renderLadder = (from, to) => {
        const s = getCellCenter(from), e = getCellCenter(to);
        const dx = e.x - s.x, dy = e.y - s.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const px = (-dy / len) * 1.5, py = (dx / len) * 1.5;
        const numRungs = Math.max(3, Math.floor(len / 12));
        const rungs = Array.from({ length: numRungs }, (_, i) => {
            const t = (i + 1) / (numRungs + 1);
            return {
                x1: s.x + px + dx * t, y1: s.y + py + dy * t,
                x2: s.x - px + dx * t, y2: s.y - py + dy * t,
            };
        });
        return (
            <g key={`l-${from}`}>
                <line x1={s.x + px} y1={s.y + py} x2={e.x + px} y2={e.y + py} stroke="#c8a951" strokeWidth="0.8" />
                <line x1={s.x - px} y1={s.y - py} x2={e.x - px} y2={e.y - py} stroke="#c8a951" strokeWidth="0.8" />
                {rungs.map((r, i) => <line key={i} {...r} stroke="#c8a951" strokeWidth="0.6" />)}
            </g>
        );
    };

    const renderSnake = (from, to) => {
        const s = getCellCenter(from), e = getCellCenter(to);
        const mx = (s.x + e.x) / 2 + ((from % 5) * 4 - 8);
        const my = (s.y + e.y) / 2;
        const hue = (from * 47) % 360;
        return (
            <g key={`s-${from}`}>
                <path d={`M ${s.x} ${s.y} Q ${mx} ${my} ${e.x} ${e.y}`}
                    stroke={`hsl(${hue}, 70%, 45%)`} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
                <circle cx={s.x} cy={s.y} r="2" fill="#e74c3c" />
            </g>
        );
    };

    return (
        <svg className="sal-overlay" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {Object.entries(LADDERS).map(([f, t]) => renderLadder(Number(f), t))}
            {Object.entries(SNAKES).map(([f, t]) => renderSnake(Number(f), t))}
        </svg>
    );
}

// ===== CHARACTER OPTIONS =====
const CHARACTERS = [
    { id: 'prince', emoji: '🤴', label: 'Pangeran' },
    { id: 'princess', emoji: '👸', label: 'Putri' },
    { id: 'man', emoji: '🧑', label: 'Pria' },
    { id: 'woman', emoji: '👩', label: 'Wanita' },
    { id: 'groom', emoji: '🤵', label: 'Pengantin Pria' },
    { id: 'bride', emoji: '👰', label: 'Pengantin Wanita' },
    { id: 'superhero', emoji: '🦸', label: 'Superhero' },
    { id: 'fairy', emoji: '🧚', label: 'Peri' },
    { id: 'devil', emoji: '😈', label: 'Nakal' },
    { id: 'angel', emoji: '😇', label: 'Malaikat' },
    { id: 'cat', emoji: '🐱', label: 'Kucing' },
    { id: 'dog', emoji: '🐶', label: 'Anjing' },
];

// ===== MAIN GAME =====
function SnakesAndLadders({ onBack }) {
    const [gameStarted, setGameStarted] = useState(false);
    const [players, setPlayers] = useState([
        { position: 0, name: 'Player 1', color: '#ff69b4', char: null },
        { position: 0, name: 'Player 2', color: '#4169e1', char: null },
    ]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [diceValue, setDiceValue] = useState(null);
    const [isRolling, setIsRolling] = useState(false);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [timer, setTimer] = useState(0);
    const [winner, setWinner] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [message, setMessage] = useState('Lempar dadu untuk mulai!');
    const [selectingPlayer, setSelectingPlayer] = useState(0);

    const selectCharacter = (char) => {
        setPlayers(prev => prev.map((p, i) =>
            i === selectingPlayer ? { ...p, char } : p
        ));
        if (selectingPlayer === 0) {
            setSelectingPlayer(1);
        } else {
            setGameStarted(true);
        }
    };

    // Timer countdown
    useEffect(() => {
        if (timer <= 0 || !activeChallenge) return;
        const id = setInterval(() => setTimer(p => p <= 1 ? (clearInterval(id), 0) : p - 1), 1000);
        return () => clearInterval(id);
    }, [activeChallenge, timer]);

    const completeChallenge = () => {
        setActiveChallenge(null);
        setTimer(0);
        setCurrentPlayer(p => (p + 1) % 2);
        setMessage(`Giliran ${players[(currentPlayer + 1) % 2].name}!`);
    };

    const rollDice = () => {
        if (isRolling || isMoving || activeChallenge || winner) return;
        setIsRolling(true);
        const value = Math.floor(Math.random() * 6) + 1;
        setTimeout(() => {
            setDiceValue(value);
            setIsRolling(false);
            movePlayer(value);
        }, 800);
    };

    const movePlayer = (steps) => {
        const player = players[currentPlayer];
        const startPos = player.position === 0 ? 0 : player.position;
        let newPos = startPos + steps;

        if (newPos > 100) {
            setMessage(`Terlalu besar! ${player.name} tetap di posisi ${startPos}`);
            setCurrentPlayer(p => (p + 1) % 2);
            return;
        }

        setIsMoving(true);
        let step = 0;
        const interval = setInterval(() => {
            step++;
            const pos = startPos + step;
            setPlayers(prev => prev.map((p, i) => i === currentPlayer ? { ...p, position: pos } : p));
            if (step >= steps) {
                clearInterval(interval);
                setTimeout(() => handleLanding(pos), 300);
            }
        }, 200);
    };

    const handleLanding = (pos) => {
        if (pos === 100) {
            setWinner(players[currentPlayer]);
            setIsMoving(false);
            setMessage(`🎉 ${players[currentPlayer].name} MENANG!`);
            return;
        }
        if (SNAKES[pos]) {
            setMessage(`🐍 Ular! Turun dari ${pos} ke ${SNAKES[pos]}!`);
            setTimeout(() => {
                setPlayers(prev => prev.map((p, i) => i === currentPlayer ? { ...p, position: SNAKES[pos] } : p));
                setTimeout(() => checkChallenge(SNAKES[pos]), 300);
            }, 500);
            return;
        }
        if (LADDERS[pos]) {
            setMessage(`🪜 Tangga! Naik dari ${pos} ke ${LADDERS[pos]}!`);
            setTimeout(() => {
                setPlayers(prev => prev.map((p, i) => i === currentPlayer ? { ...p, position: LADDERS[pos] } : p));
                setTimeout(() => checkChallenge(LADDERS[pos]), 300);
            }, 500);
            return;
        }
        checkChallenge(pos);
    };

    const checkChallenge = (pos) => {
        setIsMoving(false);
        if (CHALLENGES[pos] && CHALLENGES[pos].type !== 'start' && CHALLENGES[pos].type !== 'winner') {
            setActiveChallenge(CHALLENGES[pos]);
            if (CHALLENGES[pos].duration > 0) setTimer(CHALLENGES[pos].duration);
            setMessage(`Challenge untuk ${players[currentPlayer].name}!`);
        } else {
            setCurrentPlayer(p => (p + 1) % 2);
            setMessage(`Giliran ${players[(currentPlayer + 1) % 2].name}!`);
        }
    };

    const resetGame = () => {
        setPlayers([
            { position: 0, name: 'Player 1', color: '#ff69b4', char: null },
            { position: 0, name: 'Player 2', color: '#4169e1', char: null },
        ]);
        setCurrentPlayer(0); setDiceValue(null); setWinner(null);
        setActiveChallenge(null); setTimer(0); setMessage('Lempar dadu untuk mulai!');
        setGameStarted(false); setSelectingPlayer(0);
    };

    const renderBoard = () => {
        const cells = [];
        for (let gr = 0; gr < 10; gr++) {
            for (let gc = 0; gc < 10; gc++) {
                const n = getCellNumber(gr, gc);
                const isDark = (gr + gc) % 2 === 0;
                const ch = CHALLENGES[n];
                const hasSnake = SNAKES[n];
                const hasLadder = LADDERS[n];
                const playersHere = players.filter(p => p.position === n);

                // Extract short label from challenge text
                let shortLabel = '';
                let durationLabel = '';
                if (ch) {
                    const text = ch.text;
                    if (text.includes('30 Detik')) durationLabel = '30 Dtk';
                    else if (text.includes('1 Menit')) durationLabel = '1 Mnt';
                    else if (text.includes('2 Menit')) durationLabel = '2 Mnt';
                    else if (text.includes('3 Menit')) durationLabel = '3 Mnt';

                    // Get the part after the dash
                    const parts = text.split(' - ');
                    if (parts.length > 1) {
                        shortLabel = parts[1].replace(/[🙏😘❤️💋👔🤚🪑😏💕💆🔥🛏️🛋️🥄😊🎯❤️‍🔥🏆😂]/gu, '').trim();
                    } else {
                        shortLabel = text.replace(/[🙏😘❤️💋👔🤚🪑😏💕💆🔥🛏️🛋️🥄😊🎯❤️‍🔥🏆😂]/gu, '').trim();
                    }
                    if (shortLabel.length > 20) shortLabel = shortLabel.substring(0, 18) + '..';
                }

                cells.push(
                    <div key={n} className={`sal-cell ${isDark ? 'dark' : 'light'} ${ch ? 'has-ch' : ''}`}>
                        <span className="sal-num">{n}</span>
                        {n === 1 && <span className="sal-label">START</span>}
                        {n === 100 && <span className="sal-label sal-winner-label">🏆</span>}
                        {hasSnake && <span className="sal-icon">🐍</span>}
                        {hasLadder && <span className="sal-icon">🪜</span>}
                        {ch && !hasSnake && !hasLadder && n !== 1 && n !== 100 && (
                            <div className="sal-ch-info">
                                {durationLabel && <span className="sal-ch-dur">{durationLabel}</span>}
                                <span className="sal-ch-icon">{ch.icon}</span>
                                <span className="sal-ch-label">{shortLabel}</span>
                            </div>
                        )}
                        <div className="sal-tokens">
                            {playersHere.map((p, idx) => {
                                const playerIdx = players.indexOf(p);
                                return (
                                    <span key={idx}
                                        className={`sal-token-char ${playerIdx === currentPlayer ? 'active-token' : 'inactive-token'}`}
                                        title={p.name}
                                    >{p.char?.emoji || '⚫'}</span>
                                );
                            })}
                        </div>
                    </div>
                );
            }
        }
        return cells;
    };


    // Character selection screen
    if (!gameStarted) {
        const usedChars = players.filter(p => p.char).map(p => p.char.id);
        return (
            <div className="game-wrapper">
                <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
                <div className="sal-char-select">
                    <h2 className="sal-title">🎲 Pilih Karakter</h2>
                    <p className="sal-char-subtitle">
                        {selectingPlayer === 0 ? 'Player 1' : 'Player 2'} — Pilih karakter anda!
                    </p>
                    <div className="sal-char-grid">
                        {CHARACTERS.map(c => (
                            <button
                                key={c.id}
                                className={`sal-char-btn ${usedChars.includes(c.id) ? 'used' : ''}`}
                                onClick={() => !usedChars.includes(c.id) && selectCharacter(c)}
                                disabled={usedChars.includes(c.id)}
                            >
                                <span className="sal-char-emoji">{c.emoji}</span>
                                <span className="sal-char-name">{c.label}</span>
                            </button>
                        ))}
                    </div>
                    {selectingPlayer === 1 && (
                        <p className="sal-char-p1">Player 1: {players[0].char?.emoji} {players[0].char?.label}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="game-wrapper">
            <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
            <div className="sal-game">
                <div className="sal-board-wrap">
                    <div className="sal-board">{renderBoard()}<BoardOverlay /></div>
                </div>
                <div className="sal-controls">
                    <h2 className="sal-title">🎲 Ular Tangga Challenge</h2>
                    <div className="sal-info">
                        {players.map((p, i) => (
                            <div key={i} className={`sal-pcard ${i === currentPlayer ? 'active' : ''}`}>
                                <span className="sal-pchar">{p.char?.emoji || '⚫'}</span>
                                <div><div className="sal-pname">{p.name}</div>
                                    <div className="sal-ppos">Posisi: {p.position || 'Start'}</div></div>
                            </div>
                        ))}
                    </div>
                    <div className="sal-msg">{message}</div>
                    <div className="sal-dice-area" onClick={rollDice}>
                        <Dice value={diceValue} isRolling={isRolling} />
                        <div className="sal-roll-text">{isRolling ? 'Rolling...' : winner ? 'Game Over!' : 'Klik untuk lempar!'}</div>
                    </div>
                    {winner && <button className="sal-reset" onClick={resetGame}>🔄 Main Lagi</button>}
                </div>
            </div>

            {activeChallenge && (
                <div className="sal-overlay-bg">
                    <div className="sal-popup">
                        <h3>🔥 Challenge!</h3>
                        <p className="sal-ch-text">{activeChallenge.text}</p>
                        {activeChallenge.duration > 0 && (
                            <div className="sal-timer">
                                <div className="sal-timer-circle">
                                    {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                                </div>
                                <div className="sal-timer-bar">
                                    <div className="sal-timer-fill" style={{ width: `${(timer / activeChallenge.duration) * 100}%` }} />
                                </div>
                            </div>
                        )}
                        <button className="sal-ch-btn" onClick={completeChallenge} disabled={timer > 0}>
                            {timer > 0 ? `Tunggu ${timer}s...` : '✅ Selesai!'}
                        </button>
                    </div>
                </div>
            )}

            {winner && (
                <div className="sal-overlay-bg">
                    <div className="sal-popup sal-winner-popup">
                        <h2>🎉🏆🎉</h2>
                        <h3>{winner.name} MENANG!</h3>
                        <p>Selamat! Ucapkan cinta anda ❤️</p>
                        <button className="sal-reset" onClick={resetGame}>🔄 Main Lagi</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SnakesAndLadders;
