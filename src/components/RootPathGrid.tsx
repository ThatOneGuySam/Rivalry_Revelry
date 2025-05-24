import { useState, useRef, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import { Path } from "../classes/graph";
import TeamIcon from "./TeamIcon";
import RootPathArrow from "./customArrows";
import styles from "../styles/zigzagFlow.module.css";

interface RootPathProps {
  rootPath: Path;
  rootFor: string;
}

const RootPathGrid: React.FC<RootPathProps> = ({ rootPath, rootFor }) => {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [cellSize, setCellSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (!gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const numCols = 2 * rootPath.vertices.length - 1; // assuming 1 column per icon
      const width = (rect.width - 30 * (numCols - 1)) / numCols;
      const height = (rect.height - 30 * 2) / 3; // 2 rows: top + bottom
      setCellSize({ width, height });
      console.log("Cell size is now ", cellSize);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [rootPath.vertices.length]);

  return (
    <div
      className={styles.zigzagContainer}
      ref={gridRef}
      style={{
        gridTemplateColumns: `repeat(${2 * rootPath.vertices.length - 1}, 1fr)`,
        border: "1px dashed red",
      }}
    >
      <Typography variant="h3">
        You should be rooting for {rootFor} due to the following rivalries
      </Typography>
      <div className={styles.iconGrid}>
        {rootPath &&
          rootPath.vertices.map((step, i) => {
            const row = 2 * (i % 2) + 1;
            const col = 2 * i + 1;
            return (
              <>
                <Box
                  key={`Icon_${i}`}
                  className={`${styles.iconWrapper}`}
                  style={{
                    gridRow: row,
                    gridColumn: col,
                    border: "1px dashed red",
                  }}
                >
                  <TeamIcon
                    key={step.name}
                    logoPath={step.logoPath()}
                    team_name={step.logo_name}
                    size={cellSize}
                  />
                </Box>
                {i !== rootPath.vertices.length - 1 && (
                  <Box
                    key={`Arrow_${i}`}
                    className={`${styles.iconWrapper}`}
                    style={{
                      gridRow: 2,
                      gridColumn: 2 * (i + 1),
                      border: "1px dashed red",
                    }}
                  >
                    {i % 2 === 0 ? (
                      <RootPathArrow
                        from={{ x: 0, y: 0 }}
                        to={{
                          x: cellSize.width,
                          y: cellSize.height,
                        }}
                        parity={true}
                      />
                    ) : (
                      <RootPathArrow
                        from={{ x: 0, y: cellSize.height }}
                        to={{ x: cellSize.width, y: 0 }}
                        parity={false}
                      />
                    )}
                  </Box>
                )}
              </>
            );
          })}
      </div>
    </div>
  );
};

export default RootPathGrid;
