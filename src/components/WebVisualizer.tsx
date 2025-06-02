import Graph from "graphology";
import Sigma from "sigma";
import { makeOriginalWeb } from "../data/rivalryWeb";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";

const WebVisualizer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let renderer: Sigma | null = null;

    const rivalryWeb = new Graph();
    const givenWeb = makeOriginalWeb();
    let index = 0;
    for (const node of givenWeb.vertices.map((v) => v.name)) {
      rivalryWeb.addNode(node, {
        x: (index % 1000) - 500,
        y: index / 1000,
        label: node,
      });
      index += 100;
    }
    console.log(rivalryWeb);
    for (const edge of givenWeb.edges.map((e) => [
      e.source.name,
      e.dest.name,
    ])) {
      try {
        rivalryWeb.addDirectedEdge(edge[0], edge[1]);
      } catch (error) {
        console.log(edge, error);
      }
    }
    console.log(rivalryWeb.export());
    // Retrieve some useful DOM elements:
    const zoomInBtn = document.getElementById("zoom-in") as HTMLButtonElement;
    const zoomOutBtn = document.getElementById("zoom-out") as HTMLButtonElement;
    const zoomResetBtn = document.getElementById(
      "zoom-reset"
    ) as HTMLButtonElement;
    const labelsThresholdRange = document.getElementById(
      "labels-threshold"
    ) as HTMLInputElement;

    // Instantiate sigma:
    renderer = new Sigma(rivalryWeb, containerRef.current!, {
      minCameraRatio: 0.008,
      maxCameraRatio: 3,
    });
    const camera = renderer.getCamera();

    // Bind zoom manipulation buttons
    zoomInBtn.addEventListener("click", () => {
      camera.animatedZoom({ duration: 600 });
    });
    zoomOutBtn.addEventListener("click", () => {
      camera.animatedUnzoom({ duration: 600 });
    });
    zoomResetBtn.addEventListener("click", () => {
      camera.animatedReset({ duration: 600 });
    });

    // Bind labels threshold to range input
    labelsThresholdRange.addEventListener("input", () => {
      renderer?.setSetting(
        "labelRenderedSizeThreshold",
        +labelsThresholdRange.value
      );
    });

    // Set proper range initial value:
    labelsThresholdRange.value =
      renderer.getSetting("labelRenderedSizeThreshold") + "";

    return () => {
      renderer?.kill();
    };
  }, []);

  return (
    <Box>
      <Box
        sx={{
          width: "3vw",
          height: "2vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
        }}
        id="zoom-out"
      >
        <Typography variant="h6">Zoom Out</Typography>
      </Box>
      <Box
        sx={{
          width: "3vw",
          height: "2vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
        }}
        id="zoom-in"
      >
        <Typography variant="h6">Zoom In</Typography>
      </Box>
      <Box
        sx={{
          width: "3vw",
          height: "2vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
        }}
        id="zoom-reset"
      >
        <Typography variant="h6">Zoom Reset</Typography>
      </Box>
      <Box
        sx={{
          width: "3vw",
          height: "2vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
        }}
        id="labels-threshold"
      >
        <Typography variant="h6">Labels?</Typography>
      </Box>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "600px", border: "1px solid black" }}
      />
    </Box>
  );
};

export default WebVisualizer;
