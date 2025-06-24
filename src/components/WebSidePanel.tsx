import Graph from "graphology";
import Sigma from "sigma";
import React, { useEffect, useRef, useState } from "react";
import { Avatar, Box, Slider, Typography } from "@mui/material";
import {
  advancedEdgeAttributes,
  nodeAttributes,
} from "../classes/visualizerFunctions";
import { Graph as userGraph } from "../classes/graph";

interface Props {
  selectionTypeRef: React.MutableRefObject<string>;
  selectedNodeRef: React.MutableRefObject<nodeAttributes | null>;
  selectedEdgeRef: React.MutableRefObject<advancedEdgeAttributes | null>;
  graphRef: React.MutableRefObject<Graph | null>;
  givenWebRef: React.MutableRefObject<userGraph | null>;
  rendererRef: React.MutableRefObject<Sigma | null>;
}

const WebSidePanel: React.FC<Props> = ({
  selectionTypeRef,
  selectedNodeRef,
  selectedEdgeRef,
  graphRef,
  givenWebRef,
  rendererRef,
}) => {
  const [sliderOneValue, setSliderOne] = useState<number>(5);
  const [sliderTwoValue, setSliderTwo] = useState<number>(5);
  const sliderOneRef = useRef<number>(5);
  const sliderTwoRef = useRef<number>(5);
  const [, forceUpdate] = useState(0);
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
      selectedEdgeRef.current = null;
      rendererRef.current?.scheduleRefresh();
      forceUpdate((n) => n + 1);
    };

    el.addEventListener("click", handleEdgeDeletion);

    return () => {
      el.removeEventListener("click", handleEdgeDeletion);
    };
  }, [selectedEdgeRef.current]);
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
        selectedEdgeRef.current = null;
      } else {
        const sliderOneInitialStrength = givenWebRef.current!.findEdge(
          givenWebRef.current!.findVertex(selectedEdgeRef.current!.sourceTeam)!,
          givenWebRef.current!.findVertex(selectedEdgeRef.current!.destTeam)!
        )?.strength;
        const sliderTwoInitialStrength = givenWebRef.current!.findEdge(
          givenWebRef.current!.findVertex(selectedEdgeRef.current!.destTeam)!,
          givenWebRef.current!.findVertex(selectedEdgeRef.current!.sourceTeam)!
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
  }, [selectedEdgeRef.current]);
  return (
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
      {selectionTypeRef.current == "node" && selectedNodeRef.current && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar
            variant="square"
            src={selectedNodeRef.current.image}
            alt={selectedNodeRef.current.label}
            sx={{ width: "60%", height: "auto", margin: 1 }}
          />
          <Typography variant="h4">{selectedNodeRef.current.label}</Typography>
        </Box>
      )}
      {selectionTypeRef.current == "edge" && selectedEdgeRef.current && (
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
                src={selectedEdgeRef.current.sourceTeamImage}
                alt={selectedEdgeRef.current.sourceTeam}
                sx={{ width: "100%", height: "auto" }}
              />
              <Typography variant="h4" sx={{ overflowWrap: "break-word" }}>
                {selectedEdgeRef.current.sourceTeam}
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
                src={selectedEdgeRef.current.destTeamImage}
                alt={selectedEdgeRef.current.destTeam}
                sx={{ width: "100%", height: "auto" }}
              />
              <Typography variant="h4" sx={{ overflowWrap: "break-word" }}>
                {selectedEdgeRef.current.destTeam}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", width: "80%" }}>
            <Typography variant="h5" sx={{ overflowWrap: "break-word" }}>
              Strength from {selectedEdgeRef.current.sourceTeam} to{" "}
              {selectedEdgeRef.current.destTeam}
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
              Strength from {selectedEdgeRef.current.destTeam} to{" "}
              {selectedEdgeRef.current.sourceTeam}
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
    </div>
  );
};

export default WebSidePanel;
