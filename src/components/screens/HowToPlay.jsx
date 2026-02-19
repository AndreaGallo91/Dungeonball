export default function HowToPlay({ onBack }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center p-6"
      style={{
        background: 'radial-gradient(ellipse at center, #1A1A2E 0%, #0F0F1A 70%)',
        minHeight: '100vh',
        fontFamily: '"Rajdhani", sans-serif',
      }}
    >
      <h1
        className="text-2xl text-amber-400 mb-6"
        style={{
          fontFamily: '"Cinzel Decorative", serif',
          textShadow: '0 0 15px rgba(255,215,0,0.3)',
        }}
      >
        Come si Gioca
      </h1>

      <div className="w-80 space-y-4 text-gray-300 text-sm">
        <Section title={'\uD83C\uDFAE Controlli'}>
          <Row left="A / \u2190" right="Flipper sinistro" />
          <Row left="D / \u2192" right="Flipper destro" />
          <Row left="SPAZIO" right="Lancio (tieni premuto = pi\u00F9 forza)" />
          <Row left="\u2191" right="Tilt (scuoti il tavolo, max 3)" />
          <Row left="P / ESC" right="Pausa" />
        </Section>

        <Section title={'\u2694\uFE0F Fasi di Gioco'}>
          <p>{'\uD83C\uDFF0'} <b>Esplorazione</b> {'\u2014'} Colpisci bumper e bersagli per accumulare punti</p>
          <p>{'\u2694\uFE0F'} <b>Boss Fight</b> {'\u2014'} Colpisci i 3 bersagli in alto per danneggiare il boss</p>
          <p>{'\uD83D\uDD25'} <b>Frenzy</b> {'\u2014'} 15 secondi di caos dopo aver sconfitto un boss!</p>
        </Section>

        <Section title={'\uD83D\uDCA1 Consigli'}>
          <p>{'\u2022'} Completa C-O-M-B-O per bonus enormi</p>
          <p>{'\u2022'} Colpisci in rapida successione per moltiplicatori</p>
          <p>{'\u2022'} Raccogli le sfere luminose per i power-up</p>
          <p>{'\u2022'} Il Frenzy Mode {'\u00E8'} il momento migliore per fare punti</p>
        </Section>

        <Section title={'\uD83D\uDC8E Power-Up'}>
          <Row left={'\u26A1 Multiball'} right="3 palle in gioco" />
          <Row left={'\uD83D\uDD25 Fireball'} right="Palla infuocata!" />
          <Row left={'\uD83D\uDEE1 Shield'} right="Protegge il drain" />
          <Row left={'\u231B Slow-Mo'} right="Tutto rallenta" />
          <Row left={'\u2764 Heal'} right="Recupera 1 HP" />
        </Section>
      </div>

      <button
        onClick={onBack}
        className="mt-6 px-8 py-2 text-sm font-semibold text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition-all"
      >
        Indietro
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-800">
      <h3 className="text-amber-400 font-bold text-sm mb-2">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ left, right }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-amber-300 font-mono">{left}</span>
      <span className="text-gray-400">{right}</span>
    </div>
  );
}
