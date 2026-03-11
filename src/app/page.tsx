import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('../components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        color: '#4ade80',
        fontFamily: 'monospace',
        fontSize: '18px',
      }}
    >
      Loading game...
    </div>
  ),
});

export default function Home() {
  return <GameCanvas />;
}
