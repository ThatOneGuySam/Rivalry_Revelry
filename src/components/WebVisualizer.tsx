import Graph from "graphology";
import Sigma from "sigma";
import { makeOriginalWeb } from "../data/rivalryWeb";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Path } from "../classes/graph";

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

  function partitionBands(
    arr: [string, Path][]
  ): [Map<number, [string, Path][]>, Map<string, [string, Path][]>] {
    const bandPartitions = new Map<number, [string, Path][]>();
    const lastStepPartitions = new Map<string, [string, Path][]>();
    for (const item of arr) {
      const step = item[1].steps;
      if (!bandPartitions.has(step)) {
        bandPartitions.set(step, []);
      }
      bandPartitions.get(step)!.push(item);
      const source = item[1].lastStep();
      if (source) {
        //I know, I know, nested loops are bad form
        if (!lastStepPartitions.has(source.name)) {
          lastStepPartitions.set(source.name, []);
        }
        lastStepPartitions.get(source.name)!.push(item);
      }
    }

    return [bandPartitions, lastStepPartitions];
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
    const [bands, sourceSet] = partitionBands(pathSetArray);
    const maxStep = Math.max(...pathSetArray.map((obj) => obj[1].steps));
    const teamsCurrentDirection: Map<string, number> = new Map<
      string,
      number
    >();
    const childrenTraversed: Map<string, number> = new Map<string, number>();
    initialRivalryWeb.addNode(teamName, {
      x: 0,
      y: 0,
      label: teamName,
      color: getColor(givenWeb.findVertex(teamName)!.conference),
      size: 10,
    });
    teamsCurrentDirection.set(teamName, 0);
    childrenTraversed.set(teamName, 0);
    for (let currBand = 2; currBand <= maxStep; currBand++) {
      const numInBand = bands.get(currBand)!.length;
      console.log(numInBand);
      for (const [name, path] of bands.get(currBand)!) {
        try {
          const sourceNode = path.lastStep()!.name;
          if (!childrenTraversed.get(sourceNode)) {
            childrenTraversed.set(sourceNode, 0);
          }
          const sourceField = sourceSet.get(sourceNode)!.length;
          const percentageOfField = sourceField / numInBand;
          const leftmostTick =
            teamsCurrentDirection.get(sourceNode)! - 0.5 * percentageOfField;
          const shift =
            0.5 * (percentageOfField / sourceField) +
            (percentageOfField / sourceField) *
              childrenTraversed.get(sourceNode)!;
          const pastX = initialRivalryWeb.getNodeAttributes(sourceNode).x;
          const pastY = initialRivalryWeb.getNodeAttributes(sourceNode).y;
          const direction = Math.PI * 2 * (leftmostTick + shift);
          const currentX = pastX + path.lastWeight() * Math.cos(direction);
          const currentY = pastY + path.lastWeight() * Math.sin(direction);
          initialRivalryWeb.addNode(name, {
            x: currentX,
            y: currentY,
            label: name,
            color: getColor(givenWeb.findVertex(name)!.conference),
            size: 10,
          });
          initialRivalryWeb.addDirectedEdge(sourceNode, name);
          teamsCurrentDirection.set(name, leftmostTick + shift);
          childrenTraversed.set(
            sourceNode,
            childrenTraversed.get(sourceNode)! + 1
          );
        } catch (error) {
          console.log(error);
          console.log(name);
          break;
        }
      }
    }
    return initialRivalryWeb;
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let renderer: Sigma | null = null;
    const rivalryWeb = initialPositionTeamCentered("Notre Dame");
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
