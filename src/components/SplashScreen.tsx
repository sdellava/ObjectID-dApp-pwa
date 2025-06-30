// src/components/SplashScreen.tsx
import { Box, Button, Typography } from "@mui/material";

interface Props {
  onAccept: () => void;
}

export default function SplashScreen({ onAccept }: Props) {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#1976d2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography variant="h3" gutterBottom>
        Welcome to My PWA App
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Please accept to continue
      </Typography>
      <Button variant="contained" color="secondary" onClick={onAccept}>
        Accept
      </Button>
    </Box>
  );
}
