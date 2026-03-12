import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ===== BOARD CONFIGURATION (Loaded dynamically from questions.json) =====
let OUTER_PATH = [];
let PLAYER_COLORS = [];
let STAR_POSITIONS = [];
let TRUTHS = [];
let DARES = [];
let CHARACTERS = [];
let DOTS = {};

// ===== HELPERS =====
function genChallengeTiles(count = 15) {
    const tiles = new Array(52).fill('none');
    STAR_POSITIONS.forEach(i => tiles[i] = 'star');

    const available = [];
    for (let i = 0; i < 52; i++) {
        if (!STAR_POSITIONS.includes(i)) available.push(i);
    }

    // Shuffle available indices
    for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
    }

    const maxCount = Math.min(count, available.length);
    for (let i = 0; i < maxCount; i++) {
        tiles[available[i]] = Math.random() < 0.5 ? 'deep' : 'tod';
    }
    return tiles;
}

function absIdx(colorIdx, relPos) {
    return (PLAYER_COLORS[colorIdx].startTile + relPos) % 52;
}

function tokenGridPos(colorIdx, position) {
    if (position >= 0 && position <= 50) {
        const abs = absIdx(colorIdx, position);
        return OUTER_PATH[abs];
    }
    if (position >= 51 && position <= 55) {
        return PLAYER_COLORS[colorIdx].homeStretch[position - 51];
    }
    return null; // home or finished
}

// ===== DICE =====
function Dice({ value, isRolling }) {
    const [dv, setDv] = useState(1);
    useEffect(() => {
        if (!isRolling) { setDv(value || 1); return; }
        const id = setInterval(() => setDv(Math.floor(Math.random() * 6) + 1), 60);
        return () => clearInterval(id);
    }, [isRolling, value]);
    return (
        <div className={`ludo-dice ${isRolling ? 'rolling' : ''}`}>
            <svg viewBox="0 0 100 100">
                {(DOTS[dv] || DOTS[1]).map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={10} fill="#333" />
                ))}
            </svg>
        </div>
    );
}

// ===== MAIN =====
function LudoGameInner({ onBack, initialDtQuestions, initialTruths, initialDares }) {
    const [phase, setPhase] = useState('setup-count');
    const [numPlayers, setNumPlayers] = useState(2);
    const [selectingIdx, setSelectingIdx] = useState(0);
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(0);
    const [movingToken, setMovingToken] = useState(null); // { pIdx, tIdx }
    const [diceValue, setDiceValue] = useState(1);
    const [isRolling, setIsRolling] = useState(false);
    const [consec6, setConsec6] = useState(0);
    const [message, setMessage] = useState('');
    const [winner, setWinner] = useState(null);
    const [challengeTiles, setChallengeTiles] = useState([]);
    const [pendingMoves, setPendingMoves] = useState(null);
    const [activeChallenge, setActiveChallenge] = useState(null);
    const [showChallengePopup, setShowChallengePopup] = useState(false);
    const [todChoice, setTodChoice] = useState(null);
    const [history, setHistory] = useState([]);
    const [dtQuestions, setDtQuestions] = useState(initialDtQuestions);
    const [timer, setTimer] = useState(0);

    // Custom challenges state
    const [userTruths, setUserTruths] = useState(() => {
        const saved = localStorage.getItem('ludo_v2_truths');
        return saved ? JSON.parse(saved) : initialTruths;
    });
    const [userDares, setUserDares] = useState(() => {
        const saved = localStorage.getItem('ludo_v2_dares');
        return saved ? JSON.parse(saved) : initialDares;
    });
    const [challengeCount, setChallengeCount] = useState(() => {
        const saved = localStorage.getItem('ludo_v2_ch_count');
        return saved ? parseInt(saved, 10) : 15;
    });
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [configTab, setConfigTab] = useState('truth');
    const [editItem, setEditItem] = useState({ text: '', duration: 0, icon: '🔥' });
    const [editingIdx, setEditingIdx] = useState(-1);

    // Timer effect
    useEffect(() => {
        if (timer <= 0 || !activeChallenge) return;
        const id = setInterval(() => setTimer(p => p <= 1 ? (clearInterval(id), 0) : p - 1), 1000);
        return () => clearInterval(id);
    }, [activeChallenge, timer]);

    // ===== Build token position map for rendering =====
    // Hook moved here to fix Rules of Hooks violation (before any conditional returns)
    const tokenMap = useMemo(() => {
        const map = {};
        players.forEach((p, pi) => {
            p.tokens.forEach((t, ti) => {
                const gp = tokenGridPos(p.colorIdx, t.position);
                if (gp) {
                    const key = `${gp[0]},${gp[1]}`;
                    if (!map[key]) map[key] = [];
                    map[key].push({ pIdx: pi, ti, color: PLAYER_COLORS[p.colorIdx].color, emoji: p.char?.emoji || '⚫' });
                }
            });
        });
        return map;
    }, [players]);



    const saveToDisk = async (key, data) => {
        try {
            let r = await fetch('/api/cards');
            if (!r.ok) r = await fetch('/questions.json');
            const d = await r.json();
            d[key] = data;
            await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(d)
            });
        } catch (e) {
            console.error("Failed to save to disk", e);
        }
    };

    // Load saved state
    useEffect(() => {
        const s = localStorage.getItem('ludo_v2_state');
        if (s) {
            try {
                const d = JSON.parse(s);
                Object.keys(d).forEach(k => {
                    const setters = {
                        phase: setPhase, numPlayers: setNumPlayers, players: setPlayers,
                        currentPlayer: setCurrentPlayer, diceValue: setDiceValue,
                        winner: setWinner, message: setMessage, challengeTiles: setChallengeTiles,
                        history: setHistory, consec6: setConsec6, selectingIdx: setSelectingIdx,
                        movingToken: setMovingToken,
                    };
                    if (setters[k]) setters[k](d[k]);
                });
            } catch (e) { console.error(e); }
        } else {
            // First load initialization
            setChallengeTiles(genChallengeTiles(challengeCount));
        }
    }, []);

    // Save state
    useEffect(() => {
        if (phase === 'setup-count') return;
        localStorage.setItem('ludo_v2_state', JSON.stringify({
            phase, numPlayers, players, currentPlayer, diceValue, winner,
            message, challengeTiles, history, consec6, selectingIdx, movingToken, // ADDED movingToken
        }));
    }, [phase, numPlayers, players, currentPlayer, diceValue, winner, message, challengeTiles, history, consec6, selectingIdx, movingToken]);

    // Initialize players
    const startCharSelect = (n) => {
        setNumPlayers(n);
        const p = Array.from({ length: n }, (_, i) => ({
            id: i, name: `Player ${i + 1}`, char: null, colorIdx: i,
            tokens: [{ position: -1 }, { position: -1 }, { position: -1 }, { position: -1 }],
        }));
        setPlayers(p);
        setSelectingIdx(0);
        setPhase('setup-chars');
    };

    const selectChar = (c) => {
        setPlayers(prev => prev.map((p, i) => i === selectingIdx ? { ...p, char: c } : p));
        if (selectingIdx < numPlayers - 1) {
            setSelectingIdx(selectingIdx + 1);
        } else {
            setChallengeTiles(genChallengeTiles());
            setMessage(`Giliran ${players[0]?.name || 'Player 1'}!`);
            setPhase('playing');
        }
    };

    const getValidMoves = useCallback((pIdx, dice) => {
        const p = players[pIdx];
        if (!p) return [];
        const moves = [];
        p.tokens.forEach((t, ti) => {
            if (t.position === -1 && dice === 6) {
                moves.push({ ti, type: 'enter', newPos: 0 });
            } else if (t.position >= 0 && t.position <= 50) {
                const np = t.position + dice;
                if (np <= 55) moves.push({ ti, type: 'move', newPos: np });
                else if (np === 56) moves.push({ ti, type: 'finish', newPos: 56 });
            }
            // Only allow moving tokens that are already on the board or home stretch
            else if (t.position >= 51 && t.position <= 55) {
                const np = t.position + dice;
                if (np === 56) moves.push({ ti, type: 'finish', newPos: 56 });
            }
        });
        return moves;
    }, [players]);

    const endTurn = useCallback((rolled6) => {
        if (rolled6 && consec6 < 2) {
            setConsec6(c => c + 1);
            setMessage(`🎉 ${players[currentPlayer].name} dapat giliran ekstra!`);
        } else {
            setConsec6(0);
            const next = (currentPlayer + 1) % numPlayers;
            setCurrentPlayer(next);
            setMessage(`Giliran ${players[next].name}!`);
        }
    }, [currentPlayer, numPlayers, players, consec6]);

    const handleAfterMove = useCallback((pIdx, move) => {
        const p = players[pIdx];
        const colorIdx = p.colorIdx;

        // Capture check
        if (move.newPos >= 0 && move.newPos <= 50) {
            const absPos = absIdx(colorIdx, move.newPos);
            if (!STAR_POSITIONS.includes(absPos)) {
                setPlayers(prev => {
                    const np = [...prev];
                    let captured = false;
                    np.forEach((opp, oi) => {
                        if (oi === pIdx) return;
                        const nt = opp.tokens.map(ot => {
                            if (ot.position >= 0 && ot.position <= 50) {
                                if (absIdx(opp.colorIdx, ot.position) === absPos) {
                                    captured = true;
                                    return { position: -1 };
                                }
                            }
                            return ot;
                        });
                        np[oi] = { ...opp, tokens: nt };
                    });
                    if (captured) setMessage(`💥 ${p.name} menangkap pion lawan!`);
                    return np;
                });
            }
        }

        // Check if finished
        if (move.newPos === 56) {
            setPlayers(prev => {
                const allDone = prev[pIdx].tokens.every(t => t.position === 56);
                if (allDone) {
                    setWinner(pIdx);
                    setMessage(`🏆 ${prev[pIdx].name} MENANG! 🎉`);
                }
                return prev;
            });
            endTurn(diceValue === 6);
            return;
        }

        // Check challenge
        if (move.newPos >= 0 && move.newPos <= 50) {
            const absPos = absIdx(colorIdx, move.newPos);
            const ct = challengeTiles[absPos];
            if (ct === 'deep') {
                const q = dtQuestions.length > 0
                    ? dtQuestions[Math.floor(Math.random() * dtQuestions.length)].q
                    : "Ceritakan satu hal nakal yang ingin kamu lakukan malam ini.";
                setActiveChallenge({ type: 'deep', text: q, label: '🔥 Deep Talk 21+', duration: 0 });
                setShowChallengePopup(true);
            } else if (ct === 'tod') {
                setActiveChallenge({ type: 'tod_choice', text: 'Pilih: Truth (Jujur) atau Dare (Tantangan)?', label: '🔥 Truth or Dare 21+', duration: 0 });
                setShowChallengePopup(true);
            } else {
                endTurn(diceValue === 6);
            }
        } else {
            endTurn(diceValue === 6);
        }
    }, [players, endTurn, diceValue, challengeTiles, dtQuestions]);

    const executeMove = useCallback(async (move) => {
        setPendingMoves(null);
        const pIdx = currentPlayer;
        const p = players[pIdx];
        const colorIdx = p.colorIdx;

        // Walking Animation Loop
        if (move.type === 'move' || move.type === 'finish') {
            const start = p.tokens[move.ti].position;
            const end = move.newPos;

            setMovingToken({ pIdx, tIdx: move.ti });

            for (let i = start + 1; i <= end; i++) {
                setPlayers(prev => prev.map((player, idx) => {
                    if (idx !== pIdx) return player;
                    const nt = [...player.tokens];
                    nt[move.ti] = { position: i };
                    return { ...player, tokens: nt };
                }));
                // Wait for step animation
                await new Promise(r => setTimeout(r, 250));
            }
            setMovingToken(null);
        } else {
            // Enter game (teleport to 0)
            setPlayers(prev => prev.map((player, idx) => {
                if (idx !== pIdx) return player;
                const nt = [...player.tokens];
                nt[move.ti] = { position: 0 };
                return { ...player, tokens: nt };
            }));
            await new Promise(r => setTimeout(r, 300));
        }

        // Handle capture and finish logic
        handleAfterMove(pIdx, move);
    }, [currentPlayer, players, handleAfterMove]);

    const chooseTod = (type) => {
        setTodChoice(type);
        if (type === 'truth') {
            const list = userTruths.length > 0 ? userTruths : TRUTHS;
            const q = list[Math.floor(Math.random() * list.length)];
            setActiveChallenge({ ...activeChallenge, text: q, todType: 'truth', duration: 0 });
        } else {
            const list = userDares.length > 0 ? userDares : DARES;
            const d = list[Math.floor(Math.random() * list.length)];
            setActiveChallenge({ ...activeChallenge, text: d.text, duration: d.duration, icon: d.icon, todType: 'dare' });
        }
    };

    const completeChallenge = (status) => {
        if (activeChallenge?.text) {
            setHistory(prev => [{
                text: activeChallenge.text, player: players[currentPlayer].name,
                type: activeChallenge.type, todType: activeChallenge.todType || null,
                status, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }, ...prev].slice(0, 15));
        }
        setActiveChallenge(null);
        setShowChallengePopup(false);
        setTodChoice(null);
        setTimer(0);
        endTurn(diceValue === 6);
    };

    const rollDice = () => {
        if (isRolling || activeChallenge || winner || pendingMoves || movingToken) return; // Added movingToken check
        setIsRolling(true);
        const val = Math.floor(Math.random() * 6) + 1;
        setTimeout(() => {
            setDiceValue(val);
            setIsRolling(false);
            const moves = getValidMoves(currentPlayer, val);
            if (moves.length === 0) {
                setMessage(`${players[currentPlayer].name} tidak bisa bergerak!`);
                setTimeout(() => endTurn(val === 6), 500);
            } else if (moves.length === 1) {
                executeMove(moves[0]);
            } else {
                setPendingMoves(moves);
                setMessage(`${players[currentPlayer].name}, pilih pion yang ingin digerakkan!`);
            }
        }, 800);
    };

    const randomizeChallenges = () => {
        setChallengeTiles(genChallengeTiles(challengeCount));
        setMessage("🎲 Posisi tantangan telah diacak ulang!");
    };

    const saveChallengeConfig = () => {
        if (!editItem.text.trim()) return;

        if (configTab === 'truth') {
            const newList = [...userTruths];
            if (editingIdx >= 0) newList[editingIdx] = editItem.text;
            else newList.push(editItem.text);
            setUserTruths(newList);
            localStorage.setItem('ludo_v2_truths', JSON.stringify(newList));
            saveToDisk('ludo_truths', newList);
        } else {
            const newList = [...userDares];
            if (editingIdx >= 0) newList[editingIdx] = editItem;
            else newList.push(editItem);
            setUserDares(newList);
            localStorage.setItem('ludo_v2_dares', JSON.stringify(newList));
            saveToDisk('ludo_dares', newList);
        }
        setEditItem({ text: '', duration: 0, icon: '🔥' });
        setEditingIdx(-1);
    };

    const deleteChallengeConfig = (idx) => {
        if (configTab === 'truth') {
            const newList = userTruths.filter((_, i) => i !== idx);
            if (newList.length === 0) return alert("Minimal harus ada 1 challenge!");
            setUserTruths(newList);
            localStorage.setItem('ludo_v2_truths', JSON.stringify(newList));
            saveToDisk('ludo_truths', newList);
        } else {
            const newList = userDares.filter((_, i) => i !== idx);
            if (newList.length === 0) return alert("Minimal harus ada 1 challenge!");
            setUserDares(newList);
            localStorage.setItem('ludo_v2_dares', JSON.stringify(newList));
            saveToDisk('ludo_dares', newList);
        }
    };

    const resetGame = () => {
        localStorage.removeItem('ludo_v2_state');
        setPhase('setup-count'); setPlayers([]); setCurrentPlayer(0);
        setDiceValue(1); setWinner(null); setMessage(''); // diceValue to 1
        setChallengeTiles(genChallengeTiles(challengeCount)); setHistory([]); setConsec6(0);
        setActiveChallenge(null); setShowChallengePopup(false); setPendingMoves(null);
        setMovingToken(null); // ADDED
    };

    // ===== RENDER: Setup =====
    if (phase === 'setup-count') {
        return (
            <div className="game-wrapper">
                <div className="ludo-top-btns">
                    <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
                </div>
                <div className="ludo-setup">
                    <h2>🎲 Couple Ludo</h2>
                    <p>Pilih jumlah pemain:</p>
                    <div className="ludo-count-btns">
                        {[2, 3, 4].map(n => (
                            <button key={n} className="ludo-count-btn" onClick={() => startCharSelect(n)}
                                style={{ borderColor: PLAYER_COLORS[n - 1].color }}>
                                {n} Pemain
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (phase === 'setup-chars') {
        const takenIds = players.filter(p => p.char).map(p => p.char.id);
        const pc = PLAYER_COLORS[selectingIdx];
        return (
            <div className="game-wrapper">
                <div className="ludo-top-btns">
                    <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
                </div>
                <div className="ludo-setup">
                    <h2 style={{ color: pc.color }}>
                        {players[selectingIdx]?.name || `Player ${selectingIdx + 1}`}
                    </h2>
                    <p>Pilih karakter ({pc.name}):</p>
                    <div className="sal-char-grid">
                        {CHARACTERS.map(c => {
                            const taken = takenIds.includes(c.id);
                            return (
                                <button key={c.id} className={`sal-char-btn ${taken ? 'taken' : ''}`}
                                    onClick={() => !taken && selectChar(c)} disabled={taken}>
                                    <span className="emoji">{c.emoji}</span>
                                    <span className="label">{c.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // ===== RENDER: Board =====
    const renderBoard = () => {
        const cells = [];

        // Home bases
        players.forEach((p) => {
            const cfg = PLAYER_COLORS[p.colorIdx];
            const homeTokens = p.tokens.filter(t => t.position === -1);
            cells.push(
                <div key={`home-${p.colorIdx}`} className="ludo-home-base"
                    style={{
                        gridRow: cfg.homeArea.r, gridColumn: cfg.homeArea.c,
                        background: cfg.light, borderColor: cfg.color
                    }}>
                    <div className="home-base-inner">
                        <span className="home-base-name" style={{ color: cfg.color }}>{p.name}</span>
                        <div className="home-base-tokens">
                            {homeTokens.map((_, i) => (
                                <span key={i} className="hb-token" style={{ background: cfg.color }}>
                                    {p.char?.emoji || '⚫'}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            );
        });

        // Center
        cells.push(
            <div key="center" className="ludo-center-zone" style={{ gridRow: '7/10', gridColumn: '7/10' }}>
                <span className="center-icon">🏆</span>
                <span className="center-text">HOME</span>
                {players.map((p) => {
                    const fin = p.tokens.filter(t => t.position === 56).length;
                    return fin > 0 ? (
                        <span key={p.id} className="center-finished">
                            {p.char?.emoji} ×{fin}
                        </span>
                    ) : null;
                })}
            </div>
        );

        // Outer path tiles
        OUTER_PATH.forEach((pos, idx) => {
            const ct = challengeTiles[idx];
            const isStar = STAR_POSITIONS.includes(idx);
            const isStart = [1, 14, 27, 40].includes(idx);
            const startColor = isStart ? PLAYER_COLORS[[1, 14, 27, 40].indexOf(idx)].color : null;
            const toks = tokenMap[`${pos[0]},${pos[1]}`] || [];

            cells.push(
                <div key={`t-${idx}`}
                    className={`ludo-cell outer ${ct === 'deep' ? 'ch-deep' : ct === 'tod' ? 'ch-tod' : ''} ${isStar ? 'star' : ''}`}
                    style={{
                        gridRow: pos[0] + 1, gridColumn: pos[1] + 1,
                        ...(isStart ? { background: startColor, borderColor: startColor } : {})
                    }}>
                    {isStar && <span className="cell-star">★</span>}
                    {ct === 'deep' && !isStar && <span className="cell-ch-icon">💭</span>}
                    {ct === 'tod' && !isStar && <span className="cell-ch-icon">🎭</span>}
                    {toks.length > 0 && (
                        <div className="tile-tokens">
                            {toks.map((tk, i) => {
                                const move = pendingMoves?.find(m => m.ti === tk.ti && currentPlayer === tk.pIdx);
                                const isWalking = movingToken?.pIdx === tk.pIdx && movingToken?.tIdx === tk.ti;
                                return (
                                    <div key={i}
                                        className={`ludo-token-wrap ${move ? 'clickable-cell' : ''}`}
                                        onClick={() => move && executeMove(move)}>
                                        {move && <div className="token-tooltip">Gerakkan!</div>}
                                        <span className={`ludo-token ${isWalking ? 'walking' : ''}`}
                                            style={{ color: tk.color }}>
                                            {tk.emoji}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        });

        // Home stretches
        players.forEach((p) => {
            const cfg = PLAYER_COLORS[p.colorIdx];
            cfg.homeStretch.forEach((pos, hi) => {
                const toks = tokenMap[`${pos[0]},${pos[1]}`] || [];
                cells.push(
                    <div key={`hs-${p.colorIdx}-${hi}`}
                        className="ludo-cell home-stretch"
                        style={{
                            gridRow: pos[0] + 1, gridColumn: pos[1] + 1,
                            background: cfg.light, borderColor: cfg.color
                        }}>
                        {toks.length > 0 && (
                            <div className="tile-tokens">
                                {toks.map((tk, i) => {
                                    const move = pendingMoves?.find(m => m.ti === tk.ti && currentPlayer === tk.pIdx);
                                    const isWalking = movingToken?.pIdx === tk.pIdx && movingToken?.tIdx === tk.ti;
                                    return (
                                        <div key={i}
                                            className={`ludo-token-wrap ${move ? 'clickable-cell' : ''}`}
                                            onClick={() => move && executeMove(move)}>
                                            {move && <div className="token-tooltip">Gerakkan!</div>}
                                            <span className={`ludo-token ${isWalking ? 'walking' : ''}`}
                                                style={{ color: tk.color }}>
                                                {tk.emoji}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            });
        });

        return cells;
    };

    // ===== Token selection overlay =====
    const renderTokenSelect = () => {
        if (!pendingMoves || pendingMoves.length === 0) return null;
        return (
            <div className="ludo-sidebar-selection">
                <div className="selection-title">Pilih Pion:</div>
                <div className="selection-list">
                    {pendingMoves.map((m, i) => {
                        const player = players[currentPlayer];
                        const posText = player.tokens[m.ti].position === -1 ? 'Kandang' : `Tile ${player.tokens[m.ti].position}`;
                        return (
                            <button key={i} className="selection-btn" onClick={() => executeMove(m)}>
                                <span>{player.char?.emoji} Pion {m.ti + 1}</span>
                                <span style={{ opacity: 0.6 }}>{posText} → {m.newPos === 56 ? 'FINISH' : m.newPos}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderChallengePopup = () => {
        if (!activeChallenge || !showChallengePopup) return null;
        return (
            <div className="ludo-overlay-bg">
                <div className={`ludo-popup ${activeChallenge.type}`}>
                    <button className="ludo-close-ch" onClick={() => completeChallenge('⏭️ Skip')}>×</button>
                    <h3>{activeChallenge.label}</h3>
                    {activeChallenge.type === 'tod_choice' && !todChoice ? (
                        <div className="tod-choice">
                            <p className="tod-prompt">Pilih satu:</p>
                            <div className="tod-buttons">
                                <button className="tod-btn truth" onClick={() => chooseTod('truth')}>🤔 Truth</button>
                                <button className="tod-btn dare" onClick={() => chooseTod('dare')}>🎯 Dare</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {activeChallenge.todType && (
                                <div className={`tod-type-badge ${activeChallenge.todType}`}>
                                    {activeChallenge.todType === 'truth' ? '🤔 Truth' : `🎯 Dare ${activeChallenge.icon || ''}`}
                                </div>
                            )}
                            <p className="ludo-ch-text">{activeChallenge.text}</p>

                            {activeChallenge.duration > 0 && (
                                <div className="sal-timer" style={{ marginBottom: '1.5rem' }}>
                                    <div className="sal-timer-circle" style={{ margin: '0 auto' }}>
                                        {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                                    </div>
                                    <div className="sal-timer-bar">
                                        <div className="sal-timer-fill" style={{ width: `${(timer / activeChallenge.duration) * 100}%` }} />
                                    </div>
                                </div>
                            )}

                            <div className="ludo-popup-actions">
                                <button className="ludo-ch-btn" onClick={() => completeChallenge('✅ Selesai')} disabled={timer > 0}>
                                    {timer > 0 ? `Tunggu ${timer}s...` : 'Selesai ✓'}
                                </button>
                                <button className="ludo-skip-btn" onClick={() => completeChallenge('⏭️ Skip')}>Skip</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderConfigModal = () => {
        if (!showConfigModal) return null;
        const currentList = configTab === 'truth' ? userTruths : userDares;

        return (
            <div className="ludo-overlay-bg">
                <div className="ludo-config-modal ludo-popup">
                    <button className="ludo-close-ch" onClick={() => setShowConfigModal(false)}>×</button>
                    <h3>⚙️ Pengaturan Tantangan</h3>

                    <div className="ludo-config-tabs">
                        <button className={`ludo-tab-btn ${configTab === 'truth' ? 'active' : ''}`} onClick={() => setConfigTab('truth')}>🤔 Truth</button>
                        <button className={`ludo-tab-btn ${configTab === 'dare' ? 'active' : ''}`} onClick={() => setConfigTab('dare')}>🎯 Dare</button>
                        <button className={`ludo-tab-btn ${configTab === 'board' ? 'active' : ''}`} onClick={() => setConfigTab('board')}>🎲 Board</button>
                    </div>

                    {configTab === 'board' ? (
                        <div className="ludo-config-board">
                            <h4 style={{ marginBottom: '1rem', color: '#ffb3c6' }}>Jumlah Tantangan di Board</h4>
                            <div className="ludo-range-wrap">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Sedikit (5)</span>
                                    <label style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{challengeCount} Ikon</label>
                                    <span>Banyak (44)</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="44"
                                    value={challengeCount}
                                    onChange={(e) => {
                                        const count = parseInt(e.target.value, 10);
                                        setChallengeCount(count);
                                        localStorage.setItem('ludo_v2_ch_count', count.toString());
                                        setChallengeTiles(genChallengeTiles(count));
                                    }}
                                    style={{ width: '100%', cursor: 'pointer', height: '8px', accentColor: '#d4667a' }}
                                />
                                <p style={{ fontSize: '0.85rem', marginTop: '1.5rem', opacity: 0.8, lineHeight: 1.5 }}>
                                    Sesuaikan slider ini untuk mengubah seberapa sering kotak Deep Talk (💭) dan Truth or Dare (🎭) muncul di lintasan permainan. Perubahan akan langsung terlihat pada board di belakang layar!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="ludo-config-list">
                                {currentList.map((item, i) => (
                                    <div key={i} className="ludo-config-item">
                                        <span className="ludo-config-text">
                                            {configTab === 'dare' ? `${item.icon || '🔥'} ${item.text} ${item.duration > 0 ? `(${item.duration}s)` : ''}` : item}
                                        </span>
                                        <div className="ludo-config-item-acts">
                                            <button onClick={() => {
                                                setEditingIdx(i);
                                                setEditItem(configTab === 'truth' ? { text: item, duration: 0, icon: '' } : { ...item });
                                            }}>✏️</button>
                                            <button onClick={() => deleteChallengeConfig(i)}>🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="ludo-config-editor">
                                <textarea
                                    value={editItem.text}
                                    onChange={(e) => setEditItem({ ...editItem, text: e.target.value })}
                                    placeholder={configTab === 'truth' ? "Ketik prompt truth..." : "Ketik prompt dare..."}
                                />
                                {configTab === 'dare' && (
                                    <div className="ludo-dare-opts">
                                        <input type="number" placeholder="Durasi (detik)" value={editItem.duration} onChange={(e) => setEditItem({ ...editItem, duration: parseInt(e.target.value) || 0 })} />
                                        <input type="text" placeholder="Ikon (contoh: 💋)" value={editItem.icon} onChange={(e) => setEditItem({ ...editItem, icon: e.target.value })} />
                                    </div>
                                )}
                                <div className="ludo-config-acts">
                                    <button className="ludo-save-btn" onClick={saveChallengeConfig}>
                                        {editingIdx >= 0 ? 'Update' : 'Tambah'}
                                    </button>
                                    {editingIdx >= 0 && (
                                        <button className="ludo-cancel-btn" onClick={() => { setEditingIdx(-1); setEditItem({ text: '', duration: 0, icon: '🔥' }); }}>Batal</button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="game-wrapper">
            <div className="ludo-top-btns">
                <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="ludo-rand-top" onClick={randomizeChallenges} title="Acak Posisi Ikon">🔀</button>
                    <button className="ludo-manage-top" onClick={() => setShowConfigModal(true)} title="Atur Tantangan">⚙️</button>
                    <button className="ludo-reset-top" onClick={resetGame}>🔄 Reset</button>
                </div>
            </div>
            <div className="ludo-layout">
                <div className="ludo-board-wrap">
                    <div className="ludo-board">{renderBoard()}</div>
                </div>
                <div className="ludo-sidebar">
                    <h2 className="ludo-title">🎲 Couple Ludo</h2>
                    <div className="ludo-player-info">
                        {players.map((p, i) => (
                            <div key={i} className={`ludo-pcard ${i === currentPlayer ? 'active' : ''}`}
                                style={{ borderColor: i === currentPlayer ? PLAYER_COLORS[p.colorIdx].color : 'transparent' }}>
                                <span className="ludo-pchar">{p.char?.emoji}</span>
                                <div>
                                    <div className="ludo-pname" style={{ color: PLAYER_COLORS[p.colorIdx].color }}>
                                        {p.name}
                                    </div>
                                    <div className="ludo-ppos">
                                        🏠 {p.tokens.filter(t => t.position === -1).length} |
                                        🏆 {p.tokens.filter(t => t.position === 56).length}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="ludo-msg">{message}</div>

                    {renderTokenSelect()}

                    <div className="ludo-dice-area" onClick={rollDice}>
                        <Dice value={diceValue} isRolling={isRolling} />
                        <div className="ludo-roll-text">
                            {isRolling ? 'Rolling...' : winner !== null ? 'Game Over!'
                                : activeChallenge ? 'Selesaikan tantangan!'
                                    : pendingMoves ? 'Pilih pion!' : 'Klik untuk lempar!'}
                        </div>
                    </div>
                    <div className="ludo-rules card-glass">
                        <h4>📖 Aturan</h4>
                        <ul>
                            <li>Lempar <strong>6</strong> untuk keluar dari kandang</li>
                            <li>Angka 6 = bonus giliran (maks 3×)</li>
                            <li>Mendarat di lawan = tangkap!</li>
                            <li>★ = zona aman | 💭 = Deep Talk | 🎭 = ToD</li>
                        </ul>
                    </div>
                    <div className="ludo-history card-glass">
                        <h3>📜 Riwayat</h3>
                        <div className="ludo-history-list">
                            {history.length > 0 ? history.map((h, i) => (
                                <div key={i} className={`ludo-history-item ${h.type}`}>
                                    <div className="item-head">
                                        <span className="item-p">{h.player}</span>
                                        <span className="item-badge">{h.type === 'deep' ? '💭' : '🎭'}</span>
                                    </div>
                                    <div className="item-body"><p>{h.text}</p></div>
                                </div>
                            )) : <p className="no-history">Belum ada riwayat.</p>}
                        </div>
                    </div>
                    {winner !== null && (
                        <button className="ludo-reset-btn" onClick={resetGame}>🔄 Main Lagi</button>
                    )}
                </div>
            </div>

            {renderChallengePopup()}
            {renderConfigModal()}
        </div>
    );
}

export default function LudoLoader(props) {
    const [config, setConfig] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                let r = await fetch('/api/cards');
                if (!r.ok) r = await fetch('/questions.json');
                const d = await r.json();

                // Set global constants dynamically
                if (d.ludo_outer_path) OUTER_PATH = d.ludo_outer_path;
                if (d.ludo_player_colors) PLAYER_COLORS = d.ludo_player_colors;
                if (d.ludo_star_positions) STAR_POSITIONS = d.ludo_star_positions;
                if (d.ludo_truths) TRUTHS = d.ludo_truths;
                if (d.ludo_dares) DARES = d.ludo_dares;
                if (d.ludo_characters) CHARACTERS = d.ludo_characters;
                if (d.ludo_dots) DOTS = d.ludo_dots;

                setConfig({
                    dtQuestions: d.questions || [],
                    userTruths: d.ludo_truths || TRUTHS,
                    userDares: d.ludo_dares || DARES
                });
            } catch (e) {
                console.error("Error loading Ludo game data:", e);
            }
        })();
    }, []);

    if (!config) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Inter' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>🎲</div>
                    <h2>Memuat Data Game...</h2>
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return <LudoGameInner {...props} initialDtQuestions={config.dtQuestions} initialTruths={config.userTruths} initialDares={config.userDares} />;
}
