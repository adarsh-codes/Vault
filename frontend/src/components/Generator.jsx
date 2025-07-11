import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const generatePassword = (length, strength) => {
  const charSets = {
    low: "abcdefghijklmnopqrstuvwxyz",
    medium: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    high: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?",
  };
  const chars = charSets[strength] || charSets.medium;

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const Generator = () => {
  const [length, setLength] = useState(12);
  const [strength, setStrength] = useState("high");
  const [password, setPassword] = useState("");

  const handleGenerate = () => {
    const pwd = generatePassword(length, strength);
    setPassword(pwd);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
  };

  return (
    <Box
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 3,
        border: "1px solid rgba(255, 255, 255, 0.2)",
        p: { xs: 3, sm: 5 },
        maxWidth: 400,
        mt: 5,
        mx: "auto",
        textAlign: "center",
        color: "white",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      <LockIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Generate a Secure Password
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: "gray" }}>
        Customize length and strength, then click generate.
      </Typography>

      <Box sx={{ mb: 3, px: { xs: 1, sm: 5 } }}>
        <Typography gutterBottom>Length: {length} characters</Typography>
        <Slider
          min={6}
          max={32}
          value={length}
          onChange={(e, val) => setLength(val)}
          valueLabelDisplay="auto"
          sx={{ color: "primary.main" }}
        />
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="strength-label" sx={{ color: "gray" }}>
          Password Strength
        </InputLabel>
        <Select
          labelId="strength-label"
          value={strength}
          label="Password Strength"
          onChange={(e) => setStrength(e.target.value)}
          sx={{
            color: "white",
            ".MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.light",
            },
          }}
        >
          <MenuItem value="low">Low (letters only)</MenuItem>
          <MenuItem value="medium">Medium (letters + numbers)</MenuItem>
          <MenuItem value="high">High (letters + numbers + symbols)</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        fullWidth
        onClick={handleGenerate}
        sx={{ mb: 3, py: 1.5 }}
      >
        Generate Password
      </Button>

      {password && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "#333",
            borderRadius: 1,
            p: 1,
            px: 2,
            userSelect: "all",
            justifyContent: "space-between",
            fontFamily: "monospace",
            fontSize: "1.1rem",
            wordBreak: "break-all",
          }}
        >
          <Typography sx={{ flexGrow: 1, color: "white" }}>
            {password}
          </Typography>
          <Tooltip title="Copy to clipboard">
            <IconButton
              onClick={handleCopy}
              sx={{ color: "primary.main", ml: 1 }}
              size="small"
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default Generator;
