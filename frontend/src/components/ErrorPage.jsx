import { Typography, Box } from "@mui/material";
import React from "react";
const ErrorPage = () => {
  return (
    <>
      <Box
        sx={{
          height: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: 2,
        }}
      >
        <Typography variant="h1">ERROR! 404 - PAGE NOT FOUND</Typography>
      </Box>
    </>
  );
};

export default ErrorPage;
