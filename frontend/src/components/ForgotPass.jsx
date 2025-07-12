import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPass = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSendOtp = async () => {
    if (!email) return setMessage("Please enter your email");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent" + ` to ${email}`);
        setMessage("OTP sent to your email");
        setStep(2);
      } else {
        toast.error("Failed to send OTP: " + (data.message || data.detail));
        setMessage(data.message || "Something went wrong");
      }
    } catch {
      toast.error("Server error. Try again later.");
      setMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async () => {
    if (!otp || !newPassword) {
      toast.error("Please enter OTP and new password");
      setMessage("Please enter OTP and new password");
      return;
    }
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordPattern.test(newPassword)) {
      setMessage(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/verify-pass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password updated successfully!");
        setMessage("Password updated successfully!");
        setPasswordUpdated(true);
      } else {
        toast.error(
          "Failed to update password: " + (data.message || data.detail)
        );
        setMessage(
          "Invalid OTP or password pattern - must be at least 8 characters long, contain uppercase, lowercase, digit, and special character."
        );
      }
    } catch {
      toast.error("Server error. Try again later.");
      setMessage("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateOtp = () => handleSendOtp();

  const handleGoToLogin = () => navigate("/login");

  return (
    <Container maxWidth="xs">
      <Paper elevation={10} sx={{ mt: 8, p: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Forgot Password
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {step === 1 && (
            <>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Send OTP"}
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  navigate("/login");
                }}
                disabled={loading}
              >
                Back to Login
              </Button>
            </>
          )}

          {step === 2 && !passwordUpdated && (
            <>
              <Typography variant="body2" color="text.secondary">
                OTP sent to <strong>{email}</strong>
              </Typography>
              <TextField
                label="OTP"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleVerifyOtpAndReset}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Verify & Reset Password"
                  )}
                </Button>
                <Button onClick={handleRegenerateOtp} disabled={loading}>
                  Resend OTP
                </Button>
              </Box>
            </>
          )}

          {passwordUpdated && (
            <>
              <Typography color="success.main" variant="body1">
                🎉 Password updated successfully!
              </Typography>
              <Button variant="contained" onClick={handleGoToLogin}>
                Go to Login
              </Button>
            </>
          )}

          {message && (
            <Typography
              sx={{ mt: 1 }}
              color={
                message.includes("success") ? "success.main" : "error.main"
              }
            >
              {message}
            </Typography>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPass;
