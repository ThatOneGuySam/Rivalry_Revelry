import { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography, Button, Box } from "@mui/material";
import { Vertex, Path, Graph } from '../classes/graph';
import { makeOriginalWeb } from '../data/rivalryWeb';

const RootingChooser = () => {
      const [teamFan, setFan] = useState("");
      const [teamA, setTeamA] = useState("");
      const [teamB, setTeamB] = useState("");
      const [rootFor, setRootFor] = useState("");
      const [rootPath, setRootPath] = useState(new Path([],[]));
    
      const rivalryWeb: Graph = makeOriginalWeb();
    
      const teamOptions: Vertex[] = rivalryWeb.vertices;

      console.log(teamOptions[0].logoPath());

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
        <Box>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "200px" }}>
                <FormControl fullWidth>
                    <InputLabel id="fan-team">Your Team</InputLabel>
                    <Select
                    labelId="Fandom"
                    value={teamFan}
                    onChange={(e) => setFan(e.target.value)}
                    >
                    {teamOptions.map((team) => (
                        <MenuItem key={team.name} value={team.name}><img src={team.logoPath()} style={{width: "50px", height: "50px"}}/>{team.name}</MenuItem>
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
                        <MenuItem key={team.name} value={team.name}><img src={team.logoPath()} style={{width: "50px", height: "50px"}}/>{team.name}</MenuItem>
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
                        <MenuItem key={team.name} value={team.name}><img src={team.logoPath()} style={{width: "50px", height: "50px"}}/>{team.name}</MenuItem>
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
        </Box>
      )
};

export default RootingChooser;