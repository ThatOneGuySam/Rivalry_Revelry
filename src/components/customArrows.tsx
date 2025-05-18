type Point = { x: number; y: number };

interface RootPathArrowProps {
  from: Point;
  to: Point;
  parity: boolean;
}

const RootPathArrow: React.FC<RootPathArrowProps> = ({ from, to, parity }) => {
  const startX = from.x;
  const startY = from.y;
  const endX = to.x;
  const endY = to.y;
  const buffer = Math.abs((from.x - to.x) * 0.05);

  // Calculate position for the clickable point (e.g., one-third along the line)
  const clickX = startX + (endX - startX) / 3;
  const clickY = startY + (endY - startY) / 3;

  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const arrowSize = length * 0.2;
  const markerWidth = arrowSize;
  const markerHeight = arrowSize * 0.7;
  const refX = 0; // position the tip at the end of the line
  const refY = markerHeight / 2;

  const handleClick = () => {
    alert("Arrow point clicked!");
  };

  return (
    <svg
      style={{
        position: "relative",
        top: 0,
        left: 0,
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY),
        zIndex: 10,
      }}
    >
      <defs>
        <marker
          id={`arrowhead`} // unique per arrow
          markerWidth={markerWidth}
          markerHeight={markerHeight}
          refX={refX}
          refY={refY}
          orient="auto"
          markerUnits="userSpaceOnUse" // ✅ to match length in real units
        >
          <polygon
            points={`0 0, ${arrowSize} ${refY}, 0 ${markerHeight}`}
            fill="black"
          />
        </marker>
      </defs>
      <line
        x1={startX + buffer}
        y1={parity ? startY + buffer : startY - buffer}
        x2={endX - 6 * buffer}
        y2={parity ? endY - 6 * buffer : endY + 6 * buffer}
        stroke="black"
        strokeWidth="10"
        markerEnd="url(#arrowhead)"
      />
      <circle
        cx={clickX}
        cy={clickY}
        r="5"
        fill="red"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      />
    </svg>
  );
};

export default RootPathArrow;
