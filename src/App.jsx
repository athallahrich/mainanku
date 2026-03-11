import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BeanBoozled from './components/BeanBoozled';
import SnakesAndLadders from './components/SnakesAndLadders';
import CoupleCards from './components/CoupleCards';
import './index.css';

function App() {
  const [activeGame, setActiveGame] = useState(() => {
    return localStorage.getItem('active_game') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('active_game', activeGame);
  }, [activeGame]);

  return (
    <div className="app-root">
      {activeGame === 'dashboard' && (
        <Dashboard onSelectGame={(gameId) => setActiveGame(gameId)} />
      )}

      {activeGame === 'beanboozled' && (
        <BeanBoozled onBack={() => setActiveGame('dashboard')} />
      )}

      {activeGame === 'snakes-and-ladders' && (
        <SnakesAndLadders onBack={() => setActiveGame('dashboard')} />
      )}

      {activeGame === 'couple-cards' && (
        <CoupleCards onBack={() => setActiveGame('dashboard')} />
      )}
    </div>
  );
}

export default App;
