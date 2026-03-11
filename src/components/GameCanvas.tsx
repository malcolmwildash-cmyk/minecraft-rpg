'use client';

import { useEffect, useRef } from 'react';

export default function GameCanvas() {
  const gameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || gameRef.current) return;

    const initGame = async () => {
      const Phaser = (await import('phaser')).default;
      const { createGameConfig } = await import('../game/config');

      if (!containerRef.current || gameRef.current) return;

      const config = createGameConfig('game-container');
      gameRef.current = new Phaser.Game(config);
    };

    initGame();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="game-container"
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        overflow: 'hidden',
      }}
    />
  );
}
