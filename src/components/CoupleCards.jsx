import React, { useState } from 'react';

const CATEGORIES = [
    { id: 'love', label: '❤️ Cinta', color: '#e74c3c' },
    { id: 'dream', label: '✨ Mimpi', color: '#9b59b6' },
    { id: 'memory', label: '📸 Kenangan', color: '#3498db' },
    { id: 'deep', label: '💭 Deep Talk', color: '#2c3e50' },
    { id: 'fun', label: '😂 Seru', color: '#e67e22' },
    { id: 'spicy', label: '🔥 Spicy', color: '#c0392b' },
];

const QUESTIONS = [
    // ❤️ Cinta
    { q: "Kapan pertama kali kamu merasa jatuh cinta sama aku?", cat: "love" },
    { q: "Apa hal kecil yang aku lakukan yang bikin kamu paling bahagia?", cat: "love" },
    { q: "Kalau bisa mengulang satu momen romantis kita, momen mana yang kamu pilih?", cat: "love" },
    { q: "Apa love language kamu yang paling dominan?", cat: "love" },
    { q: "Gimana rasanya waktu pertama kali kita pegangan tangan?", cat: "love" },
    { q: "Apa yang bikin kamu yakin bahwa aku adalah orang yang tepat?", cat: "love" },
    { q: "Sebutkan 3 hal yang paling kamu cintai dari aku!", cat: "love" },
    { q: "Apa kata-kata paling romantis yang pernah aku ucapkan?", cat: "love" },

    // ✨ Mimpi
    { q: "Kalau kita bisa liburan ke mana aja, kamu mau ke mana?", cat: "dream" },
    { q: "Seperti apa rumah impian kita menurut kamu?", cat: "dream" },
    { q: "Apa mimpi terbesar kamu yang belum tercapai?", cat: "dream" },
    { q: "Kamu mau punya berapa anak? Nama-namanya apa?", cat: "dream" },
    { q: "Kalau kita bisa tinggal di negara manapun, dimana?", cat: "dream" },
    { q: "Apa satu hal yang ingin kita lakukan bersama sebelum tahun depan?", cat: "dream" },
    { q: "Gimana versi ideal quality time kita menurut kamu?", cat: "dream" },
    { q: "Apa bucket list couple kita yang belum terwujud?", cat: "dream" },

    // 📸 Kenangan  
    { q: "Apa kesan pertama kamu tentang aku?", cat: "memory" },
    { q: "Momen paling lucu yang pernah kita alami bareng apa?", cat: "memory" },
    { q: "Ceritakan kencan paling berkesan kita!", cat: "memory" },
    { q: "Apa pertengkaran paling konyol yang pernah kita alami?", cat: "memory" },
    { q: "Momen apa yang bikin kamu nangis bahagia bareng aku?", cat: "memory" },
    { q: "Apa hadiah dari aku yang paling kamu suka?", cat: "memory" },
    { q: "Ceritakan momen paling memalukan kita berdua!", cat: "memory" },
    { q: "Kapan terakhir kali kamu merasa super bangga sama aku?", cat: "memory" },

    // 💭 Deep Talk
    { q: "Apa ketakutan terbesar kamu dalam hubungan ini?", cat: "deep" },
    { q: "Hal apa yang belum pernah kamu ceritakan ke aku?", cat: "deep" },
    { q: "Apa hal yang ingin kamu ubah dari hubungan kita?", cat: "deep" },
    { q: "Bagaimana cara kamu mengatasi rasa cemburu?", cat: "deep" },
    { q: "Apa definisi kesetiaan menurut kamu?", cat: "deep" },
    { q: "Kalau kita sedang berantem, apa yang paling kamu butuhkan?", cat: "deep" },
    { q: "Apa insecurity terbesar kamu saat ini?", cat: "deep" },
    { q: "Menurut kamu, apa yang bikin hubungan kita beda dari yang lain?", cat: "deep" },

    // 😂 Seru
    { q: "Kalau aku jadi binatang, aku jadi binatang apa menurut kamu?", cat: "fun" },
    { q: "Tirukan gaya aku waktu lagi marah! 😡", cat: "fun" },
    { q: "Apa kebiasaan aku yang paling aneh menurut kamu?", cat: "fun" },
    { q: "Kalau kita tukeran tubuh 1 hari, apa yang pertama kamu lakukan?", cat: "fun" },
    { q: "Sebutkan lagu yang mengingatkan kamu sama aku!", cat: "fun" },
    { q: "Ceritakan jokes yang bisa bikin aku ketawa!", cat: "fun" },
    { q: "Apa makanan favorite aku? (Jawab jujur, jangan nebak!)", cat: "fun" },
    { q: "Kalau aku punya superpower, kekuatan apa yang cocok buat aku?", cat: "fun" },

    // 🔥 Spicy
    { q: "Apa penampilan aku yang paling bikin kamu tergoda?", cat: "spicy" },
    { q: "Di mana tempat paling berani yang pernah kita ciuman?", cat: "spicy" },
    { q: "Apa fantasi date malam yang belum pernah kita coba?", cat: "spicy" },
    { q: "Bagian tubuh aku mana yang paling kamu suka?", cat: "spicy" },
    { q: "Apa aroma parfum aku yang paling bikin kamu lemah?", cat: "spicy" },
    { q: "Truth or Dare: Pilih satu! (Pasangan yang menentukan)", cat: "spicy" },
    { q: "Kalau kamu bisa merencanakan malam romantis sempurna, seperti apa?", cat: "spicy" },
    { q: "Apa hal paling menggoda yang pernah aku lakukan tanpa sadar?", cat: "spicy" },
];

function CoupleCards({ onBack }) {
    const [currentCard, setCurrentCard] = useState(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [usedIndices, setUsedIndices] = useState([]);
    const [cardCount, setCardCount] = useState(0);

    const drawCard = () => {
        if (isFlipping) return;

        const filtered = QUESTIONS
            .map((q, i) => ({ ...q, idx: i }))
            .filter(q => !usedIndices.includes(q.idx))
            .filter(q => !selectedCategory || q.cat === selectedCategory);

        if (filtered.length === 0) {
            setUsedIndices([]);
            drawCard();
            return;
        }

        setIsFlipping(true);
        setCurrentCard(null);

        setTimeout(() => {
            const pick = filtered[Math.floor(Math.random() * filtered.length)];
            setCurrentCard(pick);
            setUsedIndices(prev => [...prev, pick.idx]);
            setCardCount(prev => prev + 1);
            setIsFlipping(false);
        }, 600);
    };

    const getCategoryInfo = (catId) => CATEGORIES.find(c => c.id === catId);

    return (
        <div className="game-wrapper">
            <button className="back-button" onClick={onBack}>← Back to Dashboard</button>

            <div className="cc-game">
                <div className="cc-header">
                    <h2 className="cc-title">💕 Couple Deep Talk Cards</h2>
                    <p className="cc-subtitle">Tarik kartu dan jawab pertanyaannya bersama pasangan!</p>
                </div>

                <div className="cc-categories">
                    <button
                        className={`cc-cat-btn ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        🎲 Semua
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`cc-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={selectedCategory === cat.id ? { borderColor: cat.color, background: cat.color + '22' } : {}}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="cc-card-area" onClick={drawCard}>
                    <div className={`cc-card ${isFlipping ? 'flipping' : ''} ${currentCard ? 'revealed' : ''}`}>
                        {currentCard ? (
                            <div className="cc-card-front">
                                <span className="cc-card-cat" style={{ color: getCategoryInfo(currentCard.cat)?.color }}>
                                    {getCategoryInfo(currentCard.cat)?.label}
                                </span>
                                <p className="cc-card-question">{currentCard.q}</p>
                                <span className="cc-card-number">#{cardCount}</span>
                            </div>
                        ) : (
                            <div className="cc-card-back">
                                <span className="cc-card-back-icon">💕</span>
                                <span className="cc-card-back-text">Tap untuk tarik kartu</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="cc-stats">
                    <span>Kartu ditarik: {cardCount}</span>
                    <span>Sisa: {QUESTIONS.filter(q => !selectedCategory || q.cat === selectedCategory).length - usedIndices.filter(i => !selectedCategory || QUESTIONS[i]?.cat === selectedCategory).length}</span>
                </div>

                {currentCard && (
                    <button className="cc-next-btn" onClick={drawCard}>
                        🔄 Tarik Kartu Berikutnya
                    </button>
                )}
            </div>
        </div>
    );
}

export default CoupleCards;
