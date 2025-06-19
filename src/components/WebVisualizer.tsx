import Graph from "graphology";
import Sigma from "sigma";
import { makeOriginalWeb } from "../data/rivalryWeb";
import { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { recursingStep } from "../classes/graph";

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

  function canyonSort(sortKey: Map<string, recursingStep>, values: string[]) {
    const newValues: string[] = [];
    const sortedValues = [...values].sort(
      (a, b) => sortKey.get(a)!.totalChildren - sortKey.get(b)!.totalChildren
    );
    for (let i = 0; i < sortedValues.length; i++) {
      if (i % 2 === 0) {
        newValues.unshift(sortedValues[i]);
      } else {
        newValues.push(sortedValues[i]);
      }
    }
    return newValues;
  }

  function initialPositionTeamCentered(teamName: string): Graph {
    const initialRivalryWeb = new Graph();
    const givenWeb = makeOriginalWeb();
    const recursivePathSet: Map<string, recursingStep> =
      givenWeb.WebRecursionDijkstra(teamName);
    const teamsDials = new Map<string, [number, number, number]>();
    //deal with initial node first
    initialRivalryWeb.addNode(teamName, {
      x: 0,
      y: 0,
      label: teamName,
      color: getColor(givenWeb.findVertex(teamName)!.conference),
      size: 10,
    });
    teamsDials.set(teamName, [-1 * Math.PI, -1 * Math.PI, Math.PI]);
    const teamQueue: string[] = canyonSort(
      recursivePathSet,
      recursivePathSet.get(teamName)!.directChildren
    );
    while (teamQueue.length > 0) {
      const currNode: string = teamQueue.shift()!;
      const currInfo: recursingStep = recursivePathSet.get(currNode)!;
      //Find its field
      const ticks = teamsDials.get(currInfo.parent)!;
      const percentageOfParent = currInfo.percentage;
      const leftTick = ticks[1];
      const rightTick = ticks[1] + (ticks[2] - ticks[0]) * percentageOfParent;
      //set dials to new positions
      teamsDials.set(currNode, [leftTick, leftTick, rightTick]);
      teamsDials.set(currInfo.parent, [ticks[0], rightTick, ticks[2]]);
      //Place Node
      const midTick = (leftTick + rightTick) / 2;
      const currentX = Math.cos(midTick) * currInfo.length;
      const currentY = Math.sin(midTick) * currInfo.length;
      initialRivalryWeb.addNode(currNode, {
        x: currentX,
        y: currentY,
        label: currNode,
        color: getColor(givenWeb.findVertex(currNode)!.conference),
        size: 10,
      });
      initialRivalryWeb.addEdge(currInfo.parent, currNode, {
        color: "rgba(200,50,50,0.9)",
        size: "2.5",
      });
      //Add it's children to queue
      teamQueue.push(...canyonSort(recursivePathSet, currInfo.directChildren));
    }
    for (const e of givenWeb.edges) {
      if (!initialRivalryWeb.hasEdge(e.source.name, e.dest.name)) {
        initialRivalryWeb.addEdge(e.source.name, e.dest.name, {
          color: "rgba(50,50,50,0.25)",
          size: "1",
        });
      }
    }
    return initialRivalryWeb;
  }

  function getNodePositions(
    teamName: string
  ): Map<string, { x: number; y: number; children: string[] }> {
    const result = new Map<
      string,
      { x: number; y: number; children: string[] }
    >();
    const givenWeb = makeOriginalWeb();
    const recursivePathSet: Map<string, recursingStep> =
      givenWeb.WebRecursionDijkstra(teamName);
    const teamsDials = new Map<string, [number, number, number]>();
    //deal with initial node first
    result.set(teamName, { x: 0, y: 0, children: [] });

    teamsDials.set(teamName, [-1 * Math.PI, -1 * Math.PI, Math.PI]);
    const teamQueue: string[] = canyonSort(
      recursivePathSet,
      recursivePathSet.get(teamName)!.directChildren
    );
    while (teamQueue.length > 0) {
      const currNode: string = teamQueue.shift()!;
      const currInfo: recursingStep = recursivePathSet.get(currNode)!;
      //Find its field
      const ticks = teamsDials.get(currInfo.parent)!;
      const percentageOfParent = currInfo.percentage;
      const leftTick = ticks[1];
      const rightTick = ticks[1] + (ticks[2] - ticks[0]) * percentageOfParent;
      //set dials to new positions
      teamsDials.set(currNode, [leftTick, leftTick, rightTick]);
      teamsDials.set(currInfo.parent, [ticks[0], rightTick, ticks[2]]);
      //Place Node
      const midTick = (leftTick + rightTick) / 2;
      const currentX = Math.cos(midTick) * currInfo.length;
      const currentY = Math.sin(midTick) * currInfo.length;
      result.set(currNode, { x: currentX, y: currentY, children: [] });
      result.get(currInfo.parent)!.children.push(currNode);
      //Add it's children to queue
      teamQueue.push(...canyonSort(recursivePathSet, currInfo.directChildren));
    }
    return result;
  }

  function animateCentering(
    graph: Graph,
    renderer: Sigma,
    teamName: string,
    duration = 1000
  ) {
    const initialNodePositions = new Map<string, { x: number; y: number }>();
    graph.forEachNode((key, attributes) => {
      initialNodePositions.set(key, { x: attributes.x, y: attributes.y });
    });
    const newPositions = getNodePositions(teamName);
    const start = performance.now();

    graph.forEachEdge((edgeKey) => {
      graph.setEdgeAttribute(edgeKey, "color", "rgba(50, 50, 50, 0.25)");
      graph.setEdgeAttribute(edgeKey, "size", "1");
    });
    for (const [name, data] of newPositions) {
      for (const e of data.children) {
        try {
          graph.setEdgeAttribute(name, e, "color", "rgba(200,50,50,0.9)");
          graph.setEdgeAttribute(name, e, "size", "2.5");
        } catch (error) {
          console.log(name);
          console.log(e);
          console.log(graph.hasEdge(name, e));
          break;
        }
      }
    }

    function step(timestamp: number) {
      const progress = Math.min((timestamp - start) / duration, 1);
      for (const nodeKey of initialNodePositions.keys()) {
        const x =
          initialNodePositions.get(nodeKey)!.x +
          (newPositions.get(nodeKey)!.x -
            initialNodePositions.get(nodeKey)!.x) *
            progress;
        const y =
          initialNodePositions.get(nodeKey)!.y +
          (newPositions.get(nodeKey)!.y -
            initialNodePositions.get(nodeKey)!.y) *
            progress;

        graph.setNodeAttribute(nodeKey, "x", x);
        graph.setNodeAttribute(nodeKey, "y", y);
      }
      renderer.refresh();

      if (progress < 1) requestAnimationFrame(step); // schedule the next frame
    }

    requestAnimationFrame(step); // start animation
  }

  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let renderer: Sigma | null = null;
    const rivalryWeb = initialPositionTeamCentered("Florida");
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
    renderer.on("clickNode", ({ node }) => {
      console.log(node);
      animateCentering(rivalryWeb, renderer, node, 500);
    });

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
          width: "10vw",
          height: "4vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
          margin: "10px",
        }}
        id="zoom-out"
      >
        <Typography variant="h6">Zoom Out</Typography>
      </Box>
      <Box
        sx={{
          width: "10vw",
          height: "4vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
          margin: "10px",
        }}
        id="zoom-in"
      >
        <Typography variant="h6">Zoom In</Typography>
      </Box>
      <Box
        sx={{
          width: "10vw",
          height: "4vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
          margin: "10px",
        }}
        id="zoom-reset"
      >
        <Typography variant="h6">Zoom Reset</Typography>
      </Box>
      <Box
        sx={{
          width: "10vw",
          height: "4vh",
          border: "2px dashed green",
          backgroundColor: "yellow",
          margin: "10px",
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
