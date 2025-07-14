const generateStars = (count, maxWidth, maxHeight) => {
  let shadows = '';
  for (let i = 0; i < count; i++) {
    const x = Math.random() * maxWidth;
    const y = Math.random() * maxHeight;
    // Brighter color palette: white, light blue, and yellowish
    const color = Math.random() > 0.7 ? '#FFFFFF' : Math.random() > 0.4 ? '#A6CFFF' : '#FFF9A3';
    const size = Math.random() > 0.9 ? '3px' : '2px'; // Slightly larger for visibility
    shadows += `${x}px ${y}px ${size} ${color}, `;
  }
  return shadows.slice(0, -2);
};

// StarLayer component with dynamic animation
const StarLayer = ({ count, speed, maxWidth, maxHeight }) => {
  const shadows = generateStars(count, maxWidth, maxHeight);
  return (
    <div
      className="absolute top-0 left-0 w-[4000px] h-[2000px] will-change-transform pointer-events-none"
      style={{
        boxShadow: shadows,
        animation: `moveStars ${speed}s linear infinite`,
      }}
    />
  );
};

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
      <StarLayer count={100} speed={80} maxWidth={maxWidth} maxHeight={maxHeight} />
      <StarLayer count={60} speed={120} maxWidth={maxWidth} maxHeight={maxHeight} />
      <StarLayer count={40} speed={160} maxWidth={maxWidth} maxHeight={maxHeight} />
    </div>
  );
};

export default SpaceBackground;