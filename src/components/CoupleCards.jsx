import React, { useState, useEffect } from 'react';

function CoupleCards({ onBack }) {
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [currentCard, setCurrentCard] = useState(null);
    const [isFlipping, setIsFlipping] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [usedIndices, setUsedIndices] = useState([]);
    const [cardCount, setCardCount] = useState(0);
    const [isManaging, setIsManaging] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state for management
    const [editingCard, setEditingCard] = useState(null);
    const [newQuestion, setNewQuestion] = useState('');
    const [newCategory, setNewCategory] = useState('');

    // Search and Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Try dev API first
            let res = await fetch('/api/cards');

            // If API fails (on production), fallback to static file in public/
            if (!res.ok) {
                console.log("Dev API not available, falling back to static fetch...");
                res = await fetch('/questions.json');
            }

            const data = await res.json();
            setCategories(data.categories || []);
            setQuestions(data.questions || []);
            if (data.categories?.length > 0) setNewCategory(data.categories[0].id);
            setLoading(false);
        } catch (e) {
            console.error("Failed to fetch cards", e);
            setLoading(false);
        }
    };

    const saveData = async (updatedQuestions) => {
        try {
            await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categories, questions: updatedQuestions })
            });
            setQuestions(updatedQuestions);
        } catch (e) {
            console.error("Failed to save cards", e);
            alert("Gagal menyimpan perubahan!");
        }
    };

    const drawCard = () => {
        if (isFlipping || questions.length === 0) return;

        const filtered = questions
            .map((q, i) => ({ ...q, idx: i }))
            .filter(q => !usedIndices.includes(q.idx))
            .filter(q => !selectedCategory || q.cat === selectedCategory);

        if (filtered.length === 0) {
            setUsedIndices([]);
            // Force a reset and draw if we just ran out
            setTimeout(drawCard, 0);
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

    const getCategoryInfo = (catId) => categories.find(c => c.id === catId);

    const handleAddCard = () => {
        if (!newQuestion.trim()) return;
        const updated = [...questions, { q: newQuestion, cat: newCategory }];
        saveData(updated);
        setNewQuestion('');
    };

    const handleDeleteCard = (idx) => {
        if (!confirm("Hapus kartu ini?")) return;
        const updated = questions.filter((_, i) => i !== idx);
        saveData(updated);
    };

    const handleStartEdit = (q, idx) => {
        setEditingCard({ ...q, idx });
    };

    const handleSaveEdit = () => {
        if (!editingCard.q.trim()) return;
        const updated = questions.map((q, i) => i === editingCard.idx ? { q: editingCard.q, cat: editingCard.cat } : q);
        saveData(updated);
        setEditingCard(null);
    };

    // Filtered questions for the management list
    const filteredQuestions = questions
        .map((q, i) => ({ ...q, originalIdx: i }))
        .filter(q => {
            const matchesSearch = q.q.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === 'all' || q.cat === filterCategory;
            return matchesSearch && matchesCategory;
        });

    if (loading) return <div className="game-wrapper"><div className="cc-game">Loading...</div></div>;

    if (isManaging) {
        return (
            <div className="game-wrapper">
                <div className="manage-header-section">
                    <button className="back-button" onClick={() => setIsManaging(false)}>
                        <span className="icon">←</span> Kembali ke Game
                    </button>
                    <h2 className="manage-page-title">🗂️ Management Kartu</h2>
                </div>

                <div className="cc-game manage-cards">
                    <div className="manage-form card-glass">
                        <h3>{editingCard ? '📝 Edit Kartu' : '➕ Tambah Kartu Baru'}</h3>
                        <div className="form-group">
                            <textarea
                                value={editingCard ? editingCard.q : newQuestion}
                                onChange={(e) => editingCard ? setEditingCard({ ...editingCard, q: e.target.value }) : setNewQuestion(e.target.value)}
                                placeholder="Masukkan pertanyaan..."
                                className="manage-input"
                            />
                        </div>
                        <div className="form-group row">
                            <select
                                value={editingCard ? editingCard.cat : newCategory}
                                onChange={(e) => editingCard ? setEditingCard({ ...editingCard, cat: e.target.value }) : setNewCategory(e.target.value)}
                                className="manage-select"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                            <div className="form-actions">
                                {editingCard ? (
                                    <>
                                        <button className="cc-next-btn save-btn" onClick={handleSaveEdit}>Simpan</button>
                                        <button className="cc-next-btn cancel-btn" onClick={() => setEditingCard(null)}>Batal</button>
                                    </>
                                ) : (
                                    <button className="cc-next-btn" onClick={handleAddCard}>Tambah Kartu</button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="manage-list-header">
                        <h3>Daftar Kartu ({filteredQuestions.length})</h3>
                        <div className="list-controls">
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Cari pertanyaan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">Semua Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="manage-list">
                        <div className="card-list-container">
                            {filteredQuestions.length > 0 ? (
                                filteredQuestions.map((q) => (
                                    <div key={q.originalIdx} className="manage-item card-glass">
                                        <div className="item-info">
                                            <span className="item-cat" style={{ color: getCategoryInfo(q.cat)?.color }}>
                                                {getCategoryInfo(q.cat)?.label}
                                            </span>
                                            <p className="item-q">{q.q}</p>
                                        </div>
                                        <div className="item-actions">
                                            <button className="action-btn edit" onClick={() => handleStartEdit(q, q.originalIdx)}>✏️</button>
                                            <button className="action-btn delete" onClick={() => handleDeleteCard(q.originalIdx)}>🗑️</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results card-glass">
                                    <p>Tidak ada kartu yang ditemukan.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-wrapper">
            <div className="cc-top-btns">
                <button className="back-button" onClick={onBack}>← Back to Dashboard</button>
                <button className="manage-btn" onClick={() => setIsManaging(true)}>⚙️ Manage Cards</button>
            </div>

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
                    {categories.map(cat => (
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
                    <span>Sisa: {questions.filter(q => !selectedCategory || q.cat === selectedCategory).length - usedIndices.filter(i => !selectedCategory || questions[i]?.cat === selectedCategory).length}</span>
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
