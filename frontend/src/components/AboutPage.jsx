import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SyncIcon from "@mui/icons-material/Sync";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import StorageIcon from "@mui/icons-material/Storage";

const features = [
  {
    icon: <StorageIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Centralized Vault",
    description:
      "Store all your credentials in one place - organized, and secure.",
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "End-to-End Encryption",
    description:
      "Your data is encrypted on your device-not even we can see it.",
  },
  {
    icon: <VpnKeyIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Password Generator",
    description:
      "Create strong, secure passwords in one click, using our service.",
  },
  {
    icon: <SyncIcon sx={{ fontSize: 40, color: "primary.main" }} />,
    title: "Cross-Platform",
    description: "Access your vault from mobile, tablet, or desktop anytime.",
  },
];

const AboutPage = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#222424",
        borderRadius: 2,
        p: { xs: 4, md: 6 },
        maxWidth: 960,
        mx: "auto",
        mt: 6,
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        textAlign="center"
        sx={{ mb: 6 }}
      >
        Why Use PassVault?
      </Typography>
      <Grid container spacing={6}>
        {features.map(({ icon, title, description }) => (
          <Grid
            item
            xs={12}
            md={4}
            key={title}
            sx={{ textAlign: { xs: "center", md: "left" } }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "primary.light",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </Box>
            </Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AboutPage;
