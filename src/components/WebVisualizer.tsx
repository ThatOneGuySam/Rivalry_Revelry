import Graph from "graphology";
import Sigma from "sigma";
import { NodeImageProgram } from "@sigma/node-image";
import { useEffect, useRef, useState } from "react";
import { Avatar, Box, Typography } from "@mui/material";
import {
  initialPositionTeamCentered,
  getNodePositions,
  nodeAttributes,
  edgeAttributes,
  advancedEdgeAttributes,
} from "../classes/visualizerFunctions";

const WebVisualizer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectionType, setSelectionType] = useState("node");
  const [selectedNode, setSelectedNode] = useState<nodeAttributes>();
  const [selectedEdge, setSelectedEdge] = useState<advancedEdgeAttributes>();
  useEffect(() => {
    function processandSetEdgeInfo(web: Graph, edgeData: edgeAttributes) {
      setSelectedEdge({
        sourceTeam: edgeData.sourceTeam,
        destTeam: edgeData.destTeam,
        sourceTeamImage: web.getNodeAttributes(edgeData.sourceTeam).image,
        destTeamImage: web.getNodeAttributes(edgeData.destTeam).image,
      });
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
    const rivalryWeb = initialPositionTeamCentered("Florida");
    setSelectedNode(rivalryWeb.getNodeAttributes("Florida") as nodeAttributes);
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
    const renderer = new Sigma(rivalryWeb, containerRef.current!, {
      minCameraRatio: 0.008,
      maxCameraRatio: 1.5,
      enableEdgeEvents: true,
      nodeProgramClasses: {
        image: NodeImageProgram,
      },
      defaultNodeType: "image",
      itemSizesReference: "positions",
      autoRescale: false,
    });
    console.log(selectedNode);
    const camera = renderer.getCamera();
    camera.setState({
      ratio: 0.5,
    });
    renderer.on("clickNode", ({ node }) => {
      console.log(node);
      setSelectedNode(rivalryWeb.getNodeAttributes(node) as nodeAttributes);
      setSelectionType("node");
    });

    renderer.on("doubleClickNode", ({ node, event }) => {
      console.log(node);
      event.preventSigmaDefault();
      setSelectedNode(rivalryWeb.getNodeAttributes(node) as nodeAttributes);
      setSelectionType("node");
      animateCentering(rivalryWeb, renderer, node, 500);
    });

    renderer.on("clickEdge", ({ edge }) => {
      console.log(edge);
      const edgeData = rivalryWeb.getEdgeAttributes(edge) as edgeAttributes;
      processandSetEdgeInfo(rivalryWeb, edgeData);
      setSelectionType("edge");
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
      renderer.kill();
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
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            width: "30%",
            border: "1px solid black",
            height: "90vmin",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {selectionType == "node" && selectedNode && (
            <>
              <Avatar
                variant="square"
                src={selectedNode.image}
                alt={selectedNode.label}
                sx={{ width: "60%", height: "auto", margin: 1 }}
              />
              <Typography variant="h4">{selectedNode.label}</Typography>
            </>
          )}
          {selectionType == "edge" && selectedEdge && (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <Avatar
                  variant="square"
                  src={selectedEdge.sourceTeamImage}
                  alt={selectedEdge.sourceTeam}
                  sx={{ width: "45%", height: "auto", margin: 1 }}
                />
                <Avatar
                  variant="square"
                  src={selectedEdge.destTeamImage}
                  alt={selectedEdge.destTeam}
                  sx={{ width: "45%", height: "auto", margin: 1 }}
                />
              </Box>
            </>
          )}
        </div>
        <div
          ref={containerRef}
          style={{
            width: "70%",
            height: "90vmin",
            textAlign: "left",
            border: "1px solid black",
          }}
        />
      </Box>
    </Box>
  );
};

export default WebVisualizer;
