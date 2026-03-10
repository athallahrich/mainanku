import React from 'react';

const GAMES = [
    {
        id: 'beanboozled',
        title: 'BeanBoozled',
        description: 'Spin the wheel and face the challenge of Flavors!',
        image: '/assets/wheel.png',
        color: 'linear-gradient(135deg, #6e45e2 0%, #88d3ce 100%)'
    },
    {
        id: 'snakes-and-ladders',
        title: 'Ular Tangga Challenge',
        description: 'Couple edition! Roll the dice, face the challenges! 🎲',
        image: '',
        emoji: '🐍🪜',
        color: 'linear-gradient(135deg, #d4667a 0%, #f0b8c6 100%)'
    },
    {
        id: 'couple-cards',
        title: 'Couple Deep Talk Cards',
        description: 'Random questions about your relationship! 💕',
        image: '',
        emoji: '🃏',
        color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)'
    },
    {
        id: 'coming-soon',
        title: 'Coming Soon',
        description: 'More exciting games are on the way...',
        image: '',
        color: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        disabled: true
    }
];

function Dashboard({ onSelectGame }) {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-title">My Game Collection</h1>
                <p className="dashboard-subtitle">Pick a game and start playing!</p>
            </header>

            <div className="game-grid">
                {GAMES.map((game) => (
                    <div
                        key={game.id}
                        className={`game-card ${game.disabled ? 'disabled' : ''}`}
                        onClick={() => !game.disabled && onSelectGame(game.id)}
                    >
                        <div className="card-image-box" style={{ background: game.color }}>
                            {game.image && <img src={game.image} alt={game.title} className="card-thumb" />}
                            {!game.image && game.emoji && <span style={{ fontSize: '4rem' }}>{game.emoji}</span>}
                        </div>
                        <div className="card-content">
                            <h3>{game.title}</h3>
                            <p>{game.description}</p>
                            <button className="play-btn" disabled={game.disabled}>
                                {game.disabled ? 'Locked' : 'Play Now'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
