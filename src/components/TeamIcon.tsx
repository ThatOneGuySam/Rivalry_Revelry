import { Box, Typography } from "@mui/material";
type Props = {
  logoPath: string;
  team_name: string;
};
const TeamIcon: React.FC<Props> = ({ logoPath, team_name }) => {
  return (
    <Box>
      <img src={logoPath} style={{ width: "150px", height: "150px" }} />
      <br></br>
      <Typography variant="h5">{team_name}</Typography>
    </Box>
  );
};

export default TeamIcon;
