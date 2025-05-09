import { Box, Typography } from "@mui/material";
type Props = {
    logoPath: string;
    team_name: string;
  };
const TeamIcon: React.FC<Props> = ({logoPath, team_name}) => {
    return(
    <Box>
        <img src={logoPath} style={{width: "200px", height: "200px"}} />
        <br></br>
        <Typography variant="h4">{team_name}</Typography>
    </Box>
    )
}

export default TeamIcon;