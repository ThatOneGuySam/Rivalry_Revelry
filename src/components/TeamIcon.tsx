import { Box, Typography } from "@mui/material";
type Props = {
  logoPath: string;
  team_name: string;
  size: { width: number; height: number };
};
const TeamIcon: React.FC<Props> = ({ logoPath, team_name, size }) => {
  const minSize = Math.min(size.width, size.height);
  return (
    <Box>
      <img src={logoPath} style={{ width: minSize, height: minSize }} />
      <br></br>
      <Typography variant="h5">{team_name}</Typography>
    </Box>
  );
};

export default TeamIcon;
