import { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography, Button, Box } from "@mui/material";
import reactLogo from './assets/react.svg';
import viteLogo from '../public/vite.svg';
import './App.css';
import { Path, Graph } from './classes/graph';
import { makeOriginalWeb } from './data/rivalryWeb';

function App() {
  const [count, setCount] = useState(0);
  const [teamFan, setFan] = useState("");
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [rootFor, setRootFor] = useState("");
  const [rootPath, setRootPath] = useState(new Path([],[]));

  const rivalryWeb: Graph = makeOriginalWeb();

  const teamOptions: string[] = rivalryWeb.vertices.map(v => v.name);

  function findResult(){
    const paths = rivalryWeb.Dijkstra(teamFan);
    if(paths.get(teamA)!.weight < paths.get(teamB)!.weight){
      setRootFor(paths.get(teamA)!.evenParity() ? teamA : teamB)
      setRootPath(paths.get(teamA)!);
      return;
    }else{
      setRootFor(paths.get(teamB)!.evenParity() ? teamB : teamA)
      setRootPath(paths.get(teamB)!);
      return;
    }
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "200px" }}>
      <FormControl fullWidth>
        <InputLabel id="fan-team">Your Team</InputLabel>
        <Select
          labelId="Fandom"
          value={teamFan}
          onChange={(e) => setFan(e.target.value)}
        >
          {teamOptions.map((team) => (
            <MenuItem key={team} value={team}>{team}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="teamA">First Team Playing</InputLabel>
        <Select
          labelId="teamA"
          value={teamA}
          onChange={(e) => setTeamA(e.target.value)}
        >
          {teamOptions.map((team) => (
            <MenuItem key={team} value={team}>{team}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="teamB">Second Team Playing</InputLabel>
        <Select
          labelId="teamB"
          value={teamB}
          onChange={(e) => setTeamB(e.target.value)}
        >
          {teamOptions.map((team) => (
            <MenuItem key={team} value={team}>{team}</MenuItem>
          ))}
        </Select>
      </FormControl>

    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={findResult}
      >
        Submit Selection
      </Button>
    </Box>

    </div>
    
    <div>
      {rootFor && 
        <Typography variant="h3">
          You should be rooting for {rootFor} due to the following rivalries
        </Typography>}
      {rootPath && 
      <Typography variant="h5">
        {rootPath.stringForm()}
        </Typography>}
    </div>
    </>
  )
}

export default App
