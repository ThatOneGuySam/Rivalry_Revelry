type Point = { x: number; y: number };

interface CustomArrowProps {
  from: Point;
  to: Point;
}

const CustomArrow: React.FC<CustomArrowProps> = ({ from, to }) => {
  const startX = from.x;
  const startY = from.y;
  const endX = to.x;
  const endY = to.y;

  // Calculate position for the clickable point (e.g., one-third along the line)
  const clickX = startX + (endX - startX) / 3;
  const clickY = startY + (endY - startY) / 3;
  console.log("Making arrow ", startX, ", ", startY, " to ", endX, ", ", endY);

  const handleClick = () => {
    alert("Arrow point clicked!");
  };

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="5"
          markerHeight="3.5"
          refX="0"
          refY="1.75"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 5 1.75, 0 3.5" fill="black" />
        </marker>
      </defs>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
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

export default CustomArrow;
