import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import {toast} from "react-toastify";

export const EmailWithOtpVerify = ({ email, setEmail, setisVerified }) => {
  const url = "http://127.0.0.1:8000/auth";

  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async () => {
    if (!email) {
      setMessage("Please enter your email first.");
      return;
    }
    const res = await fetch(`${url}/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data.message + ` to ${email}`)
      setOtpVisible(true);
      setMessage(data.message + ` to ${email}`);
    } else {
      toast.error("Failed to send OTP:" + (data.message || data.detail));
      setMessage(data.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length <= 6) {
      toast.error("Please enter a 6-digit OTP.");
      setMessage("Please enter a 6-digit OTP.");
      return;
    }

    const res = await fetch(`${url}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, otp: otp }),
    });
    const data = await res.json();

    if (res.ok) {
      toast.success("OTP verified for email:", email);
      setMessage(data.message + ` for ${email}`);
      setOtpVisible(false);
      setisVerified(true);
    } else {
      toast.error("Failed to verify OTP:", data.detail || data.message);
      setMessage(data.detail || "Failed to verify OTP");
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <TextField
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{ flex: 1, mr: 1 }}
        />
        <Button variant="outlined" onClick={handleSendOtp}>
          Verify Email
        </Button>
      </Box>

      {otpVisible && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            slotProps={{ maxLength: 6 }}
            sx={{ width: "150px", mr: 1 }}
          />
          <Button variant="contained" onClick={handleVerifyOtp}>
            Verify OTP
          </Button>
        </Box>
      )}

      {message && (
        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
          {message}
        </Typography>
      )}
    </>
  );
};
