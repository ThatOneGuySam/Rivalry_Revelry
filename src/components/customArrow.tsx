const CustomArrow = () => {
  const startX = 50;
  const startY = 50;
  const endX = 200;
  const endY = 200;

  // Calculate position for the clickable point (e.g., one-third along the line)
  const clickX = startX + (endX - startX) / 3;
  const clickY = startY + (endY - startY) / 3;

  const handleClick = () => {
    alert('Arrow point clicked!');
  };

  return (
    <svg width="300" height="300">
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
        style={{ cursor: 'pointer' }}
      />
    </svg>
  );
};

export default CustomArrow;