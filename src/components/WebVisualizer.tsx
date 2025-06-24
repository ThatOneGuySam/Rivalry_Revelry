import Graph from "graphology";
import Sigma from "sigma";
import { NodeImageProgram } from "@sigma/node-image";
import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  initialPositionTeamCentered,
  getNodePositions,
  nodeAttributes,
  edgeAttributes,
  advancedEdgeAttributes,
} from "../classes/visualizerFunctions";
import { Graph as userGraph } from "../classes/graph";
import WebSidePanel from "./WebSidePanel";

const WebVisualizer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const givenWebRef = useRef<userGraph | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const rendererRef = useRef<Sigma | null>(null);
  const selectionTypeRef = useRef<string>("node");
  const selectedNodeRef = useRef<nodeAttributes | null>(null);
  const selectedEdgeRef = useRef<advancedEdgeAttributes | null>(null);
  const [sliderOneValue, setSliderOne] = useState<number>(5);
  const sliderOneRef = useRef<number>(5);
  sliderOneRef.current = sliderOneValue;
  const [sliderTwoValue, setSliderTwo] = useState<number>(5);
  const sliderTwoRef = useRef<number>(5);
  sliderTwoRef.current = sliderTwoValue;
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    function processandSetEdgeInfo(
      web: Graph,
      edgeData: edgeAttributes,
      edgeName: string
    ) {
      selectedEdgeRef.current = {
        sourceTeam: edgeData.sourceTeam,
        destTeam: edgeData.destTeam,
        sourceTeamImage: web.getNodeAttributes(edgeData.sourceTeam).image,
        destTeamImage: web.getNodeAttributes(edgeData.destTeam).image,
        lastColor: edgeData.color,
        lastSize: edgeData.size,
        label: edgeName,
      };
      web.setEdgeAttribute(edgeName, "color", "rgba(255,150,0,0.8)");
      web.setEdgeAttribute(edgeName, "size", 5);
      const sliderOneStrength = givenWebRef.current!.findEdge(
        givenWebRef.current!.findVertex(edgeData.sourceTeam)!,
        givenWebRef.current!.findVertex(edgeData.destTeam)!
      );
      setSliderOne(sliderOneStrength ? sliderOneStrength.strength : 0);
      const sliderTwoStrength = givenWebRef.current!.findEdge(
        givenWebRef.current!.findVertex(edgeData.destTeam)!,
        givenWebRef.current!.findVertex(edgeData.sourceTeam)!
      );
      setSliderTwo(sliderTwoStrength ? sliderTwoStrength.strength : 0);
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
      const newPositions = getNodePositions(teamName, givenWebRef.current!)[0];
      const start = performance.now();

      graph.forEachEdge((edgeKey) => {
        graph.setEdgeAttribute(edgeKey, "color", "rgba(50, 50, 50, 0.25)");
        graph.setEdgeAttribute(edgeKey, "size", "3.5");
      });
      for (const [name, data] of newPositions) {
        for (const e of data.children) {
          try {
            if (graph.hasEdge(name, e)) {
              graph.setEdgeAttribute(name, e, "color", "rgba(200,50,50,0.9)");
              graph.setEdgeAttribute(name, e, "size", "5");
            } else if (graph.hasEdge(e, name)) {
              graph.setEdgeAttribute(e, name, "color", "rgba(200,50,50,0.9)");
              graph.setEdgeAttribute(e, name, "size", "5");
            } else {
              throw Error("Missing edge in either direction");
            }
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
    const [rivalryWeb, userWeb, minX, maxX] =
      initialPositionTeamCentered("Florida");
    console.log(minX, maxX);
    graphRef.current = rivalryWeb;
    givenWebRef.current = userWeb;
    selectedNodeRef.current = graphRef.current!.getNodeAttributes(
      "Florida"
    ) as nodeAttributes;
    forceUpdate((n) => n + 1);

    // Instantiate sigma:
    const renderer = new Sigma(graphRef.current, containerRef.current!, {
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
    rendererRef.current = renderer;
    const camera = rendererRef.current!.getCamera();
    camera.setState({
      ratio: 0.5,
    });
    rendererRef.current!.on("clickNode", ({ node }) => {
      console.log(node);
      if (selectedEdgeRef.current) {
        graphRef.current!.setEdgeAttribute(
          selectedEdgeRef.current.label,
          "color",
          selectedEdgeRef.current.lastColor
        );
        graphRef.current!.setEdgeAttribute(
          selectedEdgeRef.current.label,
          "size",
          selectedEdgeRef.current.lastSize
        );
        selectedEdgeRef.current = null;
      }
      selectedNodeRef.current = graphRef.current!.getNodeAttributes(
        node
      ) as nodeAttributes;
      selectionTypeRef.current = "node";
      forceUpdate((n) => n + 1);
    });

    rendererRef.current!.on("doubleClickNode", ({ node, event }) => {
      console.log(node);
      event.preventSigmaDefault();
      if (selectedEdgeRef.current) {
        graphRef.current!.setEdgeAttribute(
          selectedEdgeRef.current.label,
          "color",
          selectedEdgeRef.current.lastColor
        );
        graphRef.current!.setEdgeAttribute(
          selectedEdgeRef.current.label,
          "size",
          selectedEdgeRef.current.lastSize
        );
        selectedEdgeRef.current = null;
      }
      selectedNodeRef.current = graphRef.current!.getNodeAttributes(
        node
      ) as nodeAttributes;
      selectionTypeRef.current = "node";
      forceUpdate((n) => n + 1);
      animateCentering(graphRef.current!, rendererRef.current!, node, 500);
    });

    rendererRef.current!.on("clickEdge", ({ edge }) => {
      console.log(edge);
      const edgeData = graphRef.current!.getEdgeAttributes(
        edge
      ) as edgeAttributes;
      console.log(selectedEdgeRef.current);
      if (selectedEdgeRef.current !== null) {
        console.log(selectedEdgeRef.current);
        graphRef.current!.setEdgeAttribute(
          selectedEdgeRef.current.label,
          "color",
          selectedEdgeRef.current.lastColor
        );
        graphRef.current!.setEdgeAttribute(
          selectedEdgeRef.current.label,
          "size",
          selectedEdgeRef.current.lastSize
        );
      }
      processandSetEdgeInfo(graphRef.current!, edgeData, edge);
      selectionTypeRef.current = "edge";
    });

    return () => {
      rendererRef.current!.kill();
    };
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <WebSidePanel
          graphRef={graphRef}
          givenWebRef={givenWebRef}
          rendererRef={rendererRef}
          selectionTypeRef={selectionTypeRef}
          selectedEdgeRef={selectedEdgeRef}
          selectedNodeRef={selectedNodeRef}
        />
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
