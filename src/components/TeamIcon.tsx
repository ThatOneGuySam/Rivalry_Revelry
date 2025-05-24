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
      <Typography
        sx={{
          fontSize: "clamp(1rem, 1.5vw, 2rem)", // ⬅ scales between 1rem and 3rem based on viewport width
        }}
      >
        {team_name}
      </Typography>
    </Box>
  );
};

export default TeamIcon;
