// Nebula component with brighter, more vibrant glow
const Nebula = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      background: 'radial-gradient(circle at 30% 20%, rgba(120, 180, 255, 0.3) 0%, transparent 50%), ' +
                 'radial-gradient(circle at 70% 80%, rgba(200, 120, 255, 0.3) 0%, transparent 50%)',
      opacity: 1, // Increased opacity for visibility
      animation: 'pulseNebula 15s ease-in-out infinite', // Slightly faster pulse
    }}
  />
);

// SpaceBackground component combining stars and nebula
const SpaceBackground = () => {
  const maxWidth = 4000;
  const maxHeight = 2000;
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <Nebula />
      <div className="absolute inset-0 opacity-30">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 4 + 1 + 'px',
                  height: Math.random() * 4 + 1 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  animation: `twinkle ${Math.random() * 5 + 5}s infinite`,
                }}
              />
            ))}
          </div>
    </div>
  );
};

export default SpaceBackground;