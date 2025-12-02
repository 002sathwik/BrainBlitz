"use client";
import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { CreateQuizPage } from './pages/CreateQuizPage';
import { QuizListPage } from './pages/QuizListPage';
import { HostGamePage } from './pages/HostGamePage';
import { JoinGamePage } from './pages/JoinGamePage';

type PageType = 'home' | 'create-quiz' | 'quiz-list' | 'host-game' | 'join-game';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    if (typeof window === 'undefined') return 'home';
    const saved = localStorage.getItem('currentPage') as PageType | null;
    return saved ?? 'home';
  });

  const [gameData, setGameData] = useState<any | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('gameData');
    if (!saved) return null;
    try {
      return JSON.parse(saved) as any;
    } catch (e) {
      console.error('Failed to parse saved game data');
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (gameData) {
      localStorage.setItem('gameData', JSON.stringify(gameData));
    } else {
      localStorage.removeItem('gameData');
    }
  }, [gameData]);


  const handleNavigate = (page: PageType) => {
    if (page !== 'host-game') {
      setGameData(null);
    }
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'create-quiz' && <CreateQuizPage onNavigate={handleNavigate} />}
        {currentPage === 'quiz-list' && (
          <QuizListPage onNavigate={handleNavigate} onGameCreated={setGameData} />
        )}
        {currentPage === 'host-game' && gameData && <HostGamePage gameData={gameData} />}
        {currentPage === 'join-game' && <JoinGamePage />}
      </div>
    </div>
  );
}

export default App;