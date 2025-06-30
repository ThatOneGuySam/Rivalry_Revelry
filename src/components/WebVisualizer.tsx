import Graph from "graphology";
import Sigma from "sigma";
import { NodeImageProgram } from "@sigma/node-image";
import { useEffect, useRef, useState } from "react";
import { Avatar, Box, Slider, Typography } from "@mui/material";
import {
  initialPositionTeamCentered,
  getNodePositions,
  nodeAttributes,
  edgeAttributes,
  advancedEdgeAttributes,
  pathAttributes,
} from "../classes/visualizerFunctions";
import { Graph as userGraph } from "../classes/graph";
import { stringify } from "flatted";
import { readSessionWeb } from "../data/rivalryWeb";

const WebVisualizer: React.FC = () => {
  function cleanHighlights() {
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
    }
    if (selectedPathRef.current) {
      for (let i = 0; i < selectedPathRef.current.steps.length - 1; i++) {
        const stepEdge =
          graphRef.current!.edge(
            selectedPathRef.current.steps[i],
            selectedPathRef.current.steps[i + 1]
          ) ??
          graphRef.current!.edge(
            selectedPathRef.current.steps[i + 1],
            selectedPathRef.current.steps[i]
          );

        graphRef.current!.setEdgeAttribute(
          stepEdge,
          "color",
          selectedPathRef.current.edges[i].color
        );
        graphRef.current!.setEdgeAttribute(
          stepEdge,
          "size",
          selectedPathRef.current.edges[i].size
        );
      }
    }
  }
  function processandSetEdgeInfo(
    web: Graph,
    edgeData: edgeAttributes,
    edgeName: string
  ) {
    setSelectedEdge({
      sourceTeam: edgeData.sourceTeam,
      destTeam: edgeData.destTeam,
      sourceTeamImage: web.getNodeAttributes(edgeData.sourceTeam).image,
      destTeamImage: web.getNodeAttributes(edgeData.destTeam).image,
      lastColor: edgeData.color,
      lastSize: edgeData.size,
      label: edgeName,
    });
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
  function processAndSetPathInfo(
    web: Graph,
    givenWeb: userGraph,
    sourceTeam: string,
    destTeam: string
  ) {
    const sourceImage = givenWeb.findVertex(sourceTeam)!.logoPath();
    const destImage = givenWeb.findVertex(destTeam)!.logoPath();
    const primaryGraphPath = givenWeb.Dijkstra(sourceTeam).get(destTeam);
    const reverseGraphPath = givenWeb.Dijkstra(destTeam).get(sourceTeam);
    const stepSet: string[] = [];
    if (!primaryGraphPath) {
      setSelectedPath({
        sourceTeam: sourceTeam,
        sourceTeamImage: sourceImage,
        destTeam: destTeam,
        destTeamImage: destImage,
        steps: [],
        reversible: true,
        edges: [],
      });
      return;
    }
    stepSet.push(
      ...primaryGraphPath!.vertices.map((v) => {
        return v.name;
      })
    );
    const edgeSet: edgeAttributes[] = [];
    for (let i = 0; i < stepSet.length - 1; i++) {
      const stepEdge =
        web.edge(stepSet[i], stepSet[i + 1]) ??
        web.edge(stepSet[i + 1], stepSet[i]);

      edgeSet.push({ ...web.getEdgeAttributes(stepEdge) } as edgeAttributes);
      web.setEdgeAttribute(stepEdge, "color", "rgba(255,150,0,0.8)");
      web.setEdgeAttribute(stepEdge, "size", 5);
    }
    setSelectedPath({
      sourceTeam: sourceTeam,
      sourceTeamImage: sourceImage,
      destTeam: destTeam,
      destTeamImage: destImage,
      steps: stepSet,
      reversible:
        primaryGraphPath.vertices !== reverseGraphPath?.vertices.reverse(),
      edges: edgeSet,
    });
  }
  const containerRef = useRef<HTMLDivElement | null>(null);
  const givenWebRef = useRef<userGraph | null>(null);
  const graphRef = useRef<Graph | null>(null);
  const rendererRef = useRef<Sigma | null>(null);
  const [selectionType, setSelectionType] = useState("node");
  const [selectedNode, setSelectedNode] = useState<nodeAttributes | null>(null);
  const selectedNodeRef = useRef<nodeAttributes | null>(null);
  const [selectedEdge, setSelectedEdge] =
    useState<advancedEdgeAttributes | null>(null);
  const selectedEdgeRef = useRef<advancedEdgeAttributes | null>(null);
  const [selectedPath, setSelectedPath] = useState<pathAttributes | null>(null);
  const selectedPathRef = useRef<pathAttributes | null>(null);
  const [sliderOneValue, setSliderOne] = useState<number>(5);
  const sliderOneRef = useRef<number>(5);
  sliderOneRef.current = sliderOneValue;
  const [sliderTwoValue, setSliderTwo] = useState<number>(5);
  const sliderTwoRef = useRef<number>(5);
  sliderTwoRef.current = sliderTwoValue;
  useEffect(() => {
    selectedNodeRef.current = selectedNode;
  }, [selectedNode]);
  useEffect(() => {
    selectedEdgeRef.current = selectedEdge;
  }, [selectedEdge]);
  useEffect(() => {
    selectedPathRef.current = selectedPath;
  }, [selectedPath]);
  const deleteEdgeBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const el = deleteEdgeBtnRef.current;
    if (!el) return;

    const handleEdgeDeletion = () => {
      graphRef.current?.dropEdge(selectedEdgeRef.current?.label);
      givenWebRef.current?.deleteEdgeByNames(
        selectedEdgeRef.current!.sourceTeam,
        selectedEdgeRef.current!.destTeam
      );
      givenWebRef.current?.deleteEdgeByNames(
        selectedEdgeRef.current!.destTeam,
        selectedEdgeRef.current!.sourceTeam
      );
      setSelectedEdge(null);
      rendererRef.current?.scheduleRefresh();
    };

    el.addEventListener("click", handleEdgeDeletion);

    return () => {
      el.removeEventListener("click", handleEdgeDeletion);
    };
  }, [selectedEdge]);
  const confirmStrengthsBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const el = confirmStrengthsBtnRef.current;
    if (!el) return;

    const handleStrengthConfirmation = () => {
      if (sliderOneRef.current == 0 && sliderTwoRef.current == 0) {
        graphRef.current?.dropEdge(selectedEdgeRef.current?.label);
        givenWebRef.current?.deleteEdgeByNames(
          selectedEdgeRef.current!.sourceTeam,
          selectedEdgeRef.current!.destTeam
        );
        givenWebRef.current?.deleteEdgeByNames(
          selectedEdgeRef.current!.destTeam,
          selectedEdgeRef.current!.sourceTeam
        );
        setSelectedEdge(null);
      } else {
        const sliderOneInitialStrength = givenWebRef.current!.findEdge(
          givenWebRef.current!.findVertex(selectedEdge!.sourceTeam)!,
          givenWebRef.current!.findVertex(selectedEdge!.destTeam)!
        )?.strength;
        const sliderTwoInitialStrength = givenWebRef.current!.findEdge(
          givenWebRef.current!.findVertex(selectedEdge!.destTeam)!,
          givenWebRef.current!.findVertex(selectedEdge!.sourceTeam)!
        )?.strength;
        if (sliderOneInitialStrength != 0 && sliderOneRef.current === 0) {
          givenWebRef.current?.deleteEdgeByNames(
            selectedEdgeRef.current!.sourceTeam,
            selectedEdgeRef.current!.destTeam
          );
        } else {
          givenWebRef.current?.updateEdge(
            givenWebRef.current?.findVertex(
              selectedEdgeRef.current!.sourceTeam
            )!,
            givenWebRef.current?.findVertex(selectedEdgeRef.current!.destTeam)!,
            sliderOneRef.current
          );
        }
        if (sliderTwoInitialStrength != 0 && sliderTwoRef.current === 0) {
          givenWebRef.current?.deleteEdgeByNames(
            selectedEdgeRef.current!.destTeam,
            selectedEdgeRef.current!.sourceTeam
          );
        } else {
          givenWebRef.current?.updateEdge(
            givenWebRef.current?.findVertex(selectedEdgeRef.current!.destTeam)!,
            givenWebRef.current?.findVertex(
              selectedEdgeRef.current!.sourceTeam
            )!,
            sliderTwoRef.current
          );
        }
      }

      rendererRef.current?.scheduleRefresh();
    };

    el.addEventListener("click", handleStrengthConfirmation);

    return () => {
      el.removeEventListener("click", handleStrengthConfirmation);
    };
  }, [selectedEdge]);

  const addEdgeBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const el = addEdgeBtnRef.current;
    if (!el) return;

    const handleEdgeAddition = () => {
      const edgeN = graphRef.current?.addEdge(
        selectedPathRef.current!.sourceTeam,
        selectedPathRef.current!.destTeam,
        {
          color: "rgba(50,50,50,0.25)",
          size: "3.5",
          sourceTeam: selectedPathRef.current!.sourceTeam,
          destTeam: selectedPathRef.current!.destTeam,
        }
      )!;
      givenWebRef.current?.makeEdgeByName(
        selectedPathRef.current!.sourceTeam,
        selectedPathRef.current!.destTeam,
        sliderOneRef.current
      );
      givenWebRef.current?.makeEdgeByName(
        selectedPathRef.current!.destTeam,
        selectedPathRef.current!.sourceTeam,
        sliderTwoRef.current
      );
      cleanHighlights();
      processandSetEdgeInfo(
        graphRef.current!,
        {
          color: "rgba(50,50,50,0.25)",
          size: 3.5,
          sourceTeam: selectedPathRef.current!.sourceTeam,
          destTeam: selectedPathRef.current!.destTeam,
        },
        edgeN
      );
      setSelectionType("edge");
      rendererRef.current?.scheduleRefresh();
    };

    el.addEventListener("click", handleEdgeAddition);

    return () => {
      el.removeEventListener("click", handleEdgeAddition);
    };
  }, [selectedPath]);
  //Storage handling
  useEffect(() => {
    const handleUnload = () => {
      if (givenWebRef.current) {
        sessionStorage.setItem("currentWeb", stringify(givenWebRef.current));
      } else {
        sessionStorage.removeItem("currentWeb");
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [givenWebRef]);
  //
  //Start of the sigma section
  //
  useEffect(() => {
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
    const userWeb = readSessionWeb();
    const [rivalryWeb, _, minX, maxX] = initialPositionTeamCentered(
      "Florida",
      userWeb
    );
    console.log(minX, maxX);
    graphRef.current = rivalryWeb;
    givenWebRef.current = userWeb;
    setSelectedNode(
      graphRef.current!.getNodeAttributes("Florida") as nodeAttributes
    );

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
      cleanHighlights();
      setSelectedEdge(null);
      console.log(selectedNodeRef.current);
      console.log(selectedPathRef.current);
      if (
        !selectedNodeRef.current ||
        (selectedPathRef.current && selectedPathRef.current.sourceTeam === node)
      ) {
        setSelectedNode(
          graphRef.current!.getNodeAttributes(node) as nodeAttributes
        );
        setSelectionType("node");
      } else if (
        !selectedPathRef.current &&
        selectedNodeRef.current &&
        graphRef.current &&
        (graphRef.current.edge(selectedNodeRef.current.label, node) ||
          graphRef.current.edge(node, selectedNodeRef.current.label))
      ) {
        const edgeData = graphRef.current!.getEdgeAttributes(
          graphRef.current.edge(selectedNodeRef.current.label, node) ??
            graphRef.current.edge(node, selectedNodeRef.current.label)
        ) as edgeAttributes;
        cleanHighlights();
        processandSetEdgeInfo(
          graphRef.current!,
          edgeData,
          (graphRef.current.edge(selectedNodeRef.current.label, node) ??
            graphRef.current.edge(node, selectedNodeRef.current.label))!
        );
        setSelectionType("edge");
      } else if (
        selectedPathRef.current &&
        graphRef.current &&
        (graphRef.current.edge(selectedPathRef.current.sourceTeam, node) ||
          graphRef.current.edge(node, selectedPathRef.current.sourceTeam))
      ) {
        const edgeData = graphRef.current!.getEdgeAttributes(
          graphRef.current.edge(selectedPathRef.current.sourceTeam, node) ??
            graphRef.current.edge(node, selectedPathRef.current.sourceTeam)
        ) as edgeAttributes;
        cleanHighlights();
        processandSetEdgeInfo(
          graphRef.current!,
          edgeData,
          (graphRef.current.edge(selectedPathRef.current.sourceTeam, node) ??
            graphRef.current.edge(node, selectedPathRef.current.sourceTeam))!
        );
        setSelectionType("edge");
      } else if (!selectedPathRef.current) {
        processAndSetPathInfo(
          graphRef.current!,
          givenWebRef.current!,
          selectedNodeRef.current.label,
          node
        );
        setSelectedNode(
          graphRef.current!.getNodeAttributes(node) as nodeAttributes
        );
        setSelectionType("path");
      } else {
        processAndSetPathInfo(
          graphRef.current!,
          givenWebRef.current!,
          selectedPathRef.current.sourceTeam,
          node
        );
        setSelectedNode(
          graphRef.current!.getNodeAttributes(node) as nodeAttributes
        );
        setSelectionType("path");
      }
    });

    rendererRef.current!.on("doubleClickNode", ({ node, event }) => {
      console.log(node);
      event.preventSigmaDefault();
      cleanHighlights();
      setSelectedEdge(null);
      setSelectedPath(null);
      setSelectedNode(
        graphRef.current!.getNodeAttributes(node) as nodeAttributes
      );
      setSelectionType("node");
      animateCentering(graphRef.current!, rendererRef.current!, node, 500);
    });

    rendererRef.current!.on("clickEdge", ({ edge }) => {
      console.log(edge);
      const edgeData = graphRef.current!.getEdgeAttributes(
        edge
      ) as edgeAttributes;
      cleanHighlights();
      processandSetEdgeInfo(graphRef.current!, edgeData, edge);
      setSelectionType("edge");
    });

    return () => {
      rendererRef.current!.kill();
    };
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            width: "20%",
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "95%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "50%",
                    height: "50%",
                  }}
                >
                  <Avatar
                    variant="square"
                    src={selectedEdge.sourceTeamImage}
                    alt={selectedEdge.sourceTeam}
                    sx={{ width: "100%", height: "auto" }}
                  />
                  <Typography variant="h4" sx={{ overflowWrap: "break-word" }}>
                    {selectedEdge.sourceTeam}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "50%",
                    height: "50%",
                  }}
                >
                  <Avatar
                    variant="square"
                    src={selectedEdge.destTeamImage}
                    alt={selectedEdge.destTeam}
                    sx={{ width: "100%", height: "auto" }}
                  />
                  <Typography variant="h4" sx={{ overflowWrap: "break-word" }}>
                    {selectedEdge.destTeam}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "80%" }}
              >
                <Typography variant="h5" sx={{ overflowWrap: "break-word" }}>
                  Strength from {selectedEdge.sourceTeam} to{" "}
                  {selectedEdge.destTeam}
                </Typography>
                <Slider
                  value={sliderOneValue}
                  min={0}
                  max={10}
                  step={0.25}
                  valueLabelDisplay="auto"
                  onChange={(_, newValue) => setSliderOne(newValue as number)}
                  sx={{ width: "100%" }}
                />
                <Typography variant="h5" sx={{ overflowWrap: "break-word" }}>
                  Strength from {selectedEdge.destTeam} to{" "}
                  {selectedEdge.sourceTeam}
                </Typography>
                <Slider
                  value={sliderTwoValue}
                  min={0}
                  max={10}
                  step={0.25}
                  valueLabelDisplay="auto"
                  onChange={(_, newValue) => setSliderTwo(newValue as number)}
                  sx={{ width: "100%" }}
                />
              </Box>
              <Box
                sx={{
                  width: "15vw",
                  height: "6vh",
                  border: "2px dashed green",
                  backgroundColor: "yellow",
                  margin: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                ref={confirmStrengthsBtnRef}
              >
                <Typography variant="h5">Confirm Strengths</Typography>
              </Box>
              <Box
                sx={{
                  width: "15vw",
                  height: "6vh",
                  border: "2px dashed green",
                  backgroundColor: "yellow",
                  margin: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                ref={deleteEdgeBtnRef}
              >
                <Typography variant="h5">Delete Rivalry</Typography>
              </Box>
            </Box>
          )}
          {selectionType == "path" && selectedPath && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "95%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "50%",
                    height: "50%",
                  }}
                >
                  <Avatar
                    variant="square"
                    src={selectedPath.sourceTeamImage}
                    alt={selectedPath.sourceTeam}
                    sx={{ width: "100%", height: "auto" }}
                  />
                  <Typography variant="h4" sx={{ overflowWrap: "break-word" }}>
                    {selectedPath.sourceTeam}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "50%",
                    height: "50%",
                  }}
                >
                  <Avatar
                    variant="square"
                    src={selectedPath.destTeamImage}
                    alt={selectedPath.destTeam}
                    sx={{ width: "100%", height: "auto" }}
                  />
                  <Typography variant="h4" sx={{ overflowWrap: "break-word" }}>
                    {selectedPath.destTeam}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  width: "15vw",
                  height: "6vh",
                  border: "2px dashed green",
                  backgroundColor: "yellow",
                  margin: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                ref={addEdgeBtnRef}
              >
                <Typography variant="h5">Add Rivalry</Typography>
              </Box>
            </Box>
          )}
        </div>
        <div
          ref={containerRef}
          style={{
            width: "80%",
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
