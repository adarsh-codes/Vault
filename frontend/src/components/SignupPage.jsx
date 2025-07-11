import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { Link as RouterLink, Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { EmailWithOtpVerify } from "./EmailwithOtpverify";
import { toast } from "react-toastify";

const SignupPage = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { auth } = useAuth();

  const url = "http://127.0.0.1:8000/auth";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isVerified) {
      setError("Please verify your email first.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordPattern.test(password)) {
      setError(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      const res = await fetch(`${url}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed. Please try again.");
      } else {
        toast.success("Signup successful! You can now log in.");
      }
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  if (auth.isLoggedIn) return <Navigate to="/home" />;

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper
        elevation={12}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            p: 5,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Welcome to PassVault
          </Typography>
          <Typography variant="h6" mb={3}>
            Create your account and start managing your passwords securely.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            PassVault uses strong encryption to keep your data safe and
            accessible only by you.
          </Typography>
        </Box>

        {/* Right signup form */}
        <Box sx={{ p: 5, flex: 1, backgroundColor: "background.paper" }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar sx={{ bgcolor: "secondary.main", mx: "auto" }}>
              <PersonAddIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
              Sign Up
            </Typography>
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              fullWidth
              required
              margin="normal"
              // Optionally you can add onChange for full name if you want to store it
            />
            <EmailWithOtpVerify
              email={email}
              setEmail={setEmail}
              setisVerified={setIsVerified}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              required
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <FormControlLabel
              control={<Checkbox value="agree" color="primary" />}
              label="I agree to the Terms and Conditions"
              sx={{ mt: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
            >
              Register
            </Button>
          </Box>

          <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignupPage;
