import { useState, useMemo } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Typography, Button, Box, Autocomplete, TextField, Avatar } from "@mui/material";
import { Vertex, Path, Graph } from '../classes/graph';
import { makeOriginalWeb } from '../data/rivalryWeb';
import Fuse from 'fuse.js';
import TeamIcon from './TeamIcon';
import CustomArrow from './customArrow';

const RootingChooser = () => {
      const [teamFan, setFan] = useState("");
      const [teamA, setTeamA] = useState("");
      const [teamB, setTeamB] = useState("");
      const [rootFor, setRootFor] = useState("");
      const [rootPath, setRootPath] = useState(new Path([],[]));
      const [value, setValue] = useState<Vertex | null>(null);
      const [boxAFocus, setBoxAFocus] = useState<boolean>(false);
      
    
      const rivalryWeb: Graph = makeOriginalWeb();
    
      const teamOptions: Vertex[] = useMemo(() => {return rivalryWeb.vertices}, []);
      const [filteredOptions, setFilteredOptions] = useState(teamOptions);
      
      const spellingsToItemMap: { spelling: string; team: Vertex }[] = useMemo(() =>
        {
            console.log("runnin");
        const tempMap: { spelling: string; team: Vertex }[] = [];
        for (const team of teamOptions) {
            for (const spelling of team.spellings) {
                tempMap.push({ spelling, team });
            }
        }
        return tempMap
        }, [teamOptions]);
        

        // Setup Fuse
        const fuse = useMemo(() => {return new Fuse(spellingsToItemMap, {
            keys: ['spelling'],
            threshold: 0.4,
            includeScore: true,
            location: 0,
            distance: 25
            })
        }, [spellingsToItemMap]);

        // Search
        function fuzzySearchItems(query: string, maxResults = 5): Vertex[] {
            const results = fuse.search(query);
          
            const bestScores = new Map<Vertex, number>();
          
            for (const result of results) {
              const vertex = result.item.team;
              const score = result.score ?? 1;
          
              if (!bestScores.has(vertex) || score < bestScores.get(vertex)!) {
                bestScores.set(vertex, score);
              }
            }
            console.log(bestScores);
            // Sort by best score
            const sorted = Array.from(bestScores.entries())
              .sort((a, b) => a[1] - b[1])
              .slice(0, maxResults)
              .map(([vertex]) => vertex);

            setFilteredOptions(sorted);
          
            return sorted;
        }


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
                    {//<InputLabel id="fan-team">Your Team</InputLabel>
                    //Note in case I forget: function parameter I'm leaving blank is event
                    }
                    <Autocomplete
                        options={filteredOptions}
                        filterOptions={(x) => x}
                        value={value}
                        onChange={(_, newValue) => {
                            if (!newValue || teamOptions.includes(newValue!)) {
                            setValue(newValue);
                            }
                        }}
                        getOptionLabel={(option) => option.name}
                        inputValue={teamFan}
                        onInputChange={(_, newTeamFan) => {
                            setFan(newTeamFan);
                            fuzzySearchItems(newTeamFan);
                        }}
                        renderOption={(props, option) => (
                            <MenuItem {...props} key={option.name}>
                            <img
                                src={option.logoPath()}
                                alt={option.name}
                                style={{ width: '50px', height: '50px', marginRight: 8 }}
                            />
                            {option.name}
                            </MenuItem>
                        )}
                        renderInput={(params) => (
                            <TextField
                            {...params}
                            label="Your Team"
                            onFocus={() => setBoxAFocus(true)}
                            onBlur={() => setBoxAFocus(false)}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: value && !boxAFocus ? (
                                <Avatar
                                    src={value.logoPath()}
                                    alt={value.name}
                                    sx={{ width: 50, height: 50, marginRight: 1 }}
                                />
                                ) : null,
                            }}
                            />)
                        }
                        freeSolo={false}
                        />
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
                rootPath.vertices.map((step) => {
                    return <Box>
                        <TeamIcon key={step.name} logoPath={step.logoPath()} team_name={step.logo_name}/>
                        <CustomArrow />
                    </Box>;
                })}
                </div>
        </Box>
      )
};

export default RootingChooser;