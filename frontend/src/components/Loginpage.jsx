import React, { useState } from "react";
import {
  Avatar,
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  Grid,
  Link,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, auth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const url = `${API_URL}/auth`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${url}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setError(data.message || "Email/Password is incorrect.");
      } else {
        login({ email, masterPassword: password });

        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("user", email);

        setPassword(""); 

        setTimeout(() => {
          toast.success("Login successful!");
        }, 1);

        navigate("/");
      }
    } catch (err) {
      toast.error("Network error. Please try again later.");
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (auth.isLoggedIn) return <Navigate to="/" />;

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
            PassVault
          </Typography>
          <Typography variant="h6" mb={3}>
            Securely store and manage all your passwords in one safe place.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            With high-grade encryption and easy access, PassVault protects your
            digital life - so you never forget a password again.
          </Typography>
        </Box>

        <Box
          sx={{
            p: 5,
            flex: 1,
            backgroundColor: "background.paper",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Avatar sx={{ bgcolor: "secondary.main", mx: "auto" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
              Sign In
            </Typography>
          </Box>

          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.5 }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>

          <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
            <Grid item>
              <Link component={RouterLink} to="/forgot" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
