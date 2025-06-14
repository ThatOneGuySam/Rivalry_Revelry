import Graph from "graphology";
import Sigma from "sigma";
import { makeOriginalWeb } from "../data/rivalryWeb";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Vertex, Path } from "../classes/graph";

const WebVisualizer: React.FC = () => {
  type StringToStringDictionary = {
    [key: string]: string;
  };
  const colorByConference: StringToStringDictionary = {
    SEC: "red",
    B10: "blue",
    B12: "green",
    ACC: "purple",
    MW: "yellow",
    Sunbelt: "orange",
    MAC: "olive",
    PAC2: "pink",
    Ind: "gray",
    CUSA: "teal",
    AAC: "black",
  };

  function getColor(conf: string) {
    try {
      const c = colorByConference[conf];
      return c;
    } catch (error) {
      return "white";
    }
  }

  function trapezoid(): Graph {
    const rivalryWeb = new Graph();
    const givenWeb = makeOriginalWeb();
    let index = 0;
    for (const node of givenWeb.vertices.map((v) => [v.name, v.conference])) {
      rivalryWeb.addNode(node[0], {
        x: index % 12,
        y: index / 12,
        label: node[0],
        color: getColor(node[1]),
        size: 7.5,
      });
      index += 1;
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
    return rivalryWeb;
  }

  function initialPositionTeamCentered(teamName: string): Graph {
    const initialRivalryWeb = new Graph();
    const givenWeb = makeOriginalWeb();
    const pathSet: Map<string, Path> = givenWeb.Dijkstra(teamName);
    const pathSetArray = Array.from(pathSet);
    pathSetArray.sort((a, b) => {
      return a[1].steps - b[1].steps;
    });
    for (const [name, path] of pathSetArray) {
      if (name === teamName) {
        initialRivalryWeb.addNode(name, {
          x: 0,
          y: 0,
          label: name,
          color: getColor(givenWeb.findVertex(name)!.conference),
          size: 10,
        });
      } else {
        try {
          const lastStep: Vertex = path.lastStep()!;
          const direction = Math.random() * 2 * Math.PI;
          const lastStepX = initialRivalryWeb.getNodeAttributes(
            lastStep.name
          ).x;
          const lastStepY = initialRivalryWeb.getNodeAttributes(
            lastStep.name
          ).y;
          const currentX = lastStepX + path.lastWeight() * Math.cos(direction);
          const currentY = lastStepY + path.lastWeight() * Math.sin(direction);
          initialRivalryWeb.addNode(name, {
            x: currentX,
            y: currentY,
            label: name,
            color: getColor(givenWeb.findVertex(name)!.conference),
            size: 10,
          });
          initialRivalryWeb.addDirectedEdge(lastStep.name, name);
        } catch (error) {
          console.log(error);
          console.log(name, path);
        }
      }
    }
    /*
    for (const edge of givenWeb.edges.map((e) => [
      e.source.name,
      e.dest.name,
    ])) {
      try {
        initialRivalryWeb.addDirectedEdge(edge[0], edge[1]);
      } catch (error) {
        console.log(edge, error);
      }
    }
      */
    return initialRivalryWeb;
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let renderer: Sigma | null = null;
    const rivalryWeb = initialPositionTeamCentered("Florida");
    console.log(rivalryWeb.export());
    console.log(trapezoid().export());
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
          width: "5vw",
          height: "4vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
        }}
        id="zoom-out"
      >
        <Typography variant="h6">Zoom Out</Typography>
      </Box>
      <Box
        sx={{
          width: "5vw",
          height: "4vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
        }}
        id="zoom-in"
      >
        <Typography variant="h6">Zoom In</Typography>
      </Box>
      <Box
        sx={{
          width: "5vw",
          height: "4vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
        }}
        id="zoom-reset"
      >
        <Typography variant="h6">Zoom Reset</Typography>
      </Box>
      <Box
        sx={{
          width: "5vw",
          height: "4vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
        }}
        id="labels-threshold"
      >
        <Typography variant="h6">Labels?</Typography>
      </Box>
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "600px",
          textAlign: "left",
          border: "1px solid black",
        }}
      />
    </Box>
  );
};

export default WebVisualizer;
