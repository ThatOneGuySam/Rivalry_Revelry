import { useState, useMemo, useRef, useEffect } from "react";
import {
  MenuItem,
  FormControl,
  Button,
  Box,
  Autocomplete,
  TextField,
  Avatar,
} from "@mui/material";
import { Vertex, Path, Graph } from "../classes/graph";
import { makeOriginalWeb } from "../data/rivalryWeb";
import Fuse from "fuse.js";
import RootPathGrid from "./RootPathGrid";

const RootingChooser = () => {
  const [teamFan, setFan] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [rootFor, setRootFor] = useState("");
  const [rootPath, setRootPath] = useState(new Path([], []));
  const [valueA, setValueA] = useState<Vertex | null>(null);
  const [valueB, setValueB] = useState<Vertex | null>(null);
  const [valueC, setValueC] = useState<Vertex | null>(null);
  const [hideLogoA, sethideLogoA] = useState<boolean>(false);
  const [hideLogoB, sethideLogoB] = useState<boolean>(false);
  const [hideLogoC, sethideLogoC] = useState<boolean>(false);

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

  const rivalryWeb: Graph = makeOriginalWeb();

  const teamOptions: Vertex[] = useMemo(() => {
    return rivalryWeb.vertices;
  }, []);
  const [filteredOptions, setFilteredOptions] = useState(teamOptions);

  const spellingsToItemMap: { spelling: string; team: Vertex }[] =
    useMemo(() => {
      console.log("runnin");
      const tempMap: { spelling: string; team: Vertex }[] = [];
      for (const team of teamOptions) {
        for (const spelling of team.spellings) {
          tempMap.push({ spelling, team });
        }
      }
      return tempMap;
    }, [teamOptions]);

  // Setup Fuse
  const fuse = useMemo(() => {
    return new Fuse(spellingsToItemMap, {
      keys: ["spelling"],
      threshold: 0.4,
      includeScore: true,
      location: 0,
      distance: 25,
    });
  }, [spellingsToItemMap]);

  // Search
  function fuzzySearchItems(query: string, maxResults = 10): Vertex[] {
    const results = fuse.search(query);

    const bestScores = new Map<Vertex, number>();

    for (const result of results) {
      const vertex = result.item.team;
      const score = result.score ?? 1;

      if (!bestScores.has(vertex) || score < bestScores.get(vertex)!) {
        bestScores.set(vertex, score);
      }
    }
    // Sort by best score
    const sorted = Array.from(bestScores.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, maxResults)
      .map(([vertex]) => vertex);

    if (sorted.length > 0) {
      setFilteredOptions(sorted);
    } else {
      setFilteredOptions(teamOptions);
    }

    return sorted;
  }

  function findResult() {
    const paths = rivalryWeb.Dijkstra(teamFan);
    if (paths.get(teamA)!.weight < paths.get(teamB)!.weight) {
      setRootFor(paths.get(teamA)!.evenParity() ? teamA : teamB);
      setRootPath(paths.get(teamA)!);
      return;
    } else {
      setRootFor(paths.get(teamB)!.evenParity() ? teamB : teamA);
      setRootPath(paths.get(teamB)!);
      return;
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // ⬅ horizontally center children
        justifyContent: "center", // ⬅ optional: vertical centering
        width: "100vw",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "3rem",
          width: "60%",
        }}
      >
        <FormControl fullWidth>
          {
            //<InputLabel id="fan-team">Your Team</InputLabel>
            //Note in case I forget: function parameter I'm leaving blank is event
          }
          <Autocomplete
            options={filteredOptions}
            filterOptions={(x) => x}
            value={valueA}
            onChange={(_, newValue) => {
              if (!newValue || teamOptions.includes(newValue!)) {
                setValueA(newValue);
                sethideLogoA(false);
              }
            }}
            getOptionLabel={(option) => option.name}
            inputValue={teamFan}
            onInputChange={(_, newTeamFan) => {
              setFan(newTeamFan);
              fuzzySearchItems(newTeamFan);
              sethideLogoA(true);
            }}
            renderOption={(props, option) => (
              <MenuItem {...props} key={option.name} sx={{ fontSize: "2rem" }}>
                <img
                  src={option.logoPath()}
                  alt={option.name}
                  style={{ width: "100px", height: "100px", marginRight: 8 }}
                />
                {option.name}
              </MenuItem>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "2rem", // adjust as needed
                  },
                }}
                label="Your Team"
                onFocus={() => {
                  fuzzySearchItems(teamFan);
                }}
                onBlur={() => sethideLogoA(false)}
                InputProps={{
                  ...params.InputProps,
                  startAdornment:
                    valueA && !hideLogoA ? (
                      <Avatar
                        src={valueA.logoPath()}
                        alt={valueA.name}
                        sx={{ width: 100, height: 100, marginRight: 1 }}
                      />
                    ) : null,
                }}
              />
            )}
            freeSolo={false}
          />
        </FormControl>

        <FormControl fullWidth>
          {
            //<InputLabel id="fan-team">Your Team</InputLabel>
            //Note in case I forget: function parameter I'm leaving blank is event
          }
          <Autocomplete
            options={filteredOptions}
            filterOptions={(x) => x}
            value={valueB}
            onChange={(_, newValue) => {
              if (!newValue || teamOptions.includes(newValue!)) {
                setValueB(newValue);
                sethideLogoB(false);
              }
            }}
            getOptionLabel={(option) => option.name}
            inputValue={teamA}
            onInputChange={(_, newTeamA) => {
              setTeamA(newTeamA);
              fuzzySearchItems(newTeamA);
              sethideLogoB(true);
            }}
            renderOption={(props, option) => (
              <MenuItem {...props} key={option.name} sx={{ fontSize: "2rem" }}>
                <img
                  src={option.logoPath()}
                  alt={option.name}
                  style={{ width: "100px", height: "100px", marginRight: 8 }}
                />
                {option.name}
              </MenuItem>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "2rem", // adjust as needed
                  },
                }}
                label="First Team Playing"
                onFocus={() => {
                  fuzzySearchItems(teamA);
                }}
                onBlur={() => sethideLogoB(false)}
                InputProps={{
                  ...params.InputProps,
                  startAdornment:
                    valueB && !hideLogoB ? (
                      <Avatar
                        src={valueB.logoPath()}
                        alt={valueB.name}
                        sx={{ width: 100, height: 100, marginRight: 1 }}
                      />
                    ) : null,
                }}
              />
            )}
            freeSolo={false}
          />
        </FormControl>

        <FormControl fullWidth>
          <Autocomplete
            options={filteredOptions}
            filterOptions={(x) => x}
            value={valueC}
            onChange={(_, newValue) => {
              if (!newValue || teamOptions.includes(newValue!)) {
                setValueC(newValue);
                sethideLogoC(false);
              }
            }}
            getOptionLabel={(option) => option.name}
            inputValue={teamB}
            onInputChange={(_, newTeamB) => {
              setTeamB(newTeamB);
              fuzzySearchItems(newTeamB);
              sethideLogoC(true);
            }}
            renderOption={(props, option) => (
              <MenuItem {...props} key={option.name} sx={{ fontSize: "2rem" }}>
                <img
                  src={option.logoPath()}
                  alt={option.name}
                  style={{ width: "100px", height: "100px", marginRight: 8 }}
                />
                {option.name}
              </MenuItem>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "2rem", // adjust as needed
                  },
                }}
                label="Second Team Playing"
                onFocus={() => {
                  fuzzySearchItems(teamB);
                }}
                onBlur={() => sethideLogoC(false)}
                InputProps={{
                  ...params.InputProps,
                  startAdornment:
                    valueC && !hideLogoC ? (
                      <Avatar
                        src={valueC.logoPath()}
                        alt={valueC.name}
                        sx={{ width: 100, height: 100, marginRight: 1 }}
                      />
                    ) : null,
                }}
              />
            )}
            freeSolo={false}
          />
        </FormControl>

        <Box>
          <Button variant="contained" color="primary" onClick={findResult}>
            Submit Selection
          </Button>
        </Box>
      </div>
      {rootFor && <RootPathGrid rootFor={rootFor} rootPath={rootPath} />}
    </Box>
  );
};

export default RootingChooser;
