import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Tooltip,
  Typography,
  TableContainer,
  Stack,
} from "@mui/material";
import {
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  ContentCopy,
} from "@mui/icons-material";
import {
  getPasswords,
  addPassword,
  updatePassword,
  deletePassword,
} from "../utils/api";
import { encryptPassword, decryptPassword } from "../utils/encryption";
import { toast } from "react-toastify";

const PasswordTableManager = () => {
  const [passwords, setPasswords] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    website: "",
    username: "",
    password: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [showPassword, setShowPassword] = useState({});

  const fetchAndDecryptPasswords = async () => {
    try {
      const rawPasswords = await getPasswords();
      const masterPassword = localStorage.getItem("masterPassword");
      if (!masterPassword) {
        toast.error("Master password not set.");
        return;
      }

      const decrypted = await Promise.all(
        rawPasswords.map(async (item) => {
          let decryptedPwd = "";
          try {
            decryptedPwd = await decryptPassword(
              masterPassword,
              item.encrypted_password,
              item.salt,
              item.iv
            );
          } catch (e) {
            decryptedPwd = "Error decrypting";
          }
          return { ...item, decrypted_password: decryptedPwd };
        })
      );

      setPasswords(decrypted);
    } catch (err) {
      toast.error("Error fetching or decrypting:", err);
    }
  };

  useEffect(() => {
    fetchAndDecryptPasswords();
  }, []);

  const handleOpenDialog = (index = null) => {
    if (index !== null) {
      const item = passwords[index];
      setForm({
        id: item.id,
        website: item.website,
        username: item.username,
        password: item.decrypted_password || "",
      });
      setEditIndex(index);
    } else {
      setForm({ id: null, website: "", username: "", password: "" });
      setEditIndex(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({ id: null, website: "", username: "", password: "" });
    setEditIndex(null);
  };

  const handleSave = async () => {
    try {
      const masterPassword = localStorage.getItem("masterPassword");
      if (!masterPassword) {
        toast.error("Master password is required.");
        return;
      }

      const encrypted = await encryptPassword(masterPassword, form.password);

      const payload = {
        website: form.website,
        username: form.username,
        encrypted_password: encrypted.encrypted_password,
        iv: encrypted.iv,
        salt: encrypted.salt,
      };

      if (editIndex !== null) {
        await updatePassword(form.id, payload);
      } else {
        await addPassword(payload);
      }

      await fetchAndDecryptPasswords();
      handleCloseDialog();
      toast.success(
        editIndex !== null ? "Password updated successfully!" : "Password added successfully!"
      );
    } catch (err) {
      toast.error("Error saving password:", err);
    }
  };

  const handleDelete = async (index) => {
    try {
      const password = passwords[index];
      await deletePassword(password.id);
      await fetchAndDecryptPasswords();
    } catch (err) {
      toast.error("Error deleting password:", err);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const togglePasswordVisibility = (index) => {
    setShowPassword((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          Your Saved Passwords
        </Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add Password
        </Button>
      </Stack>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Website / App</TableCell>
                <TableCell>Username / Email</TableCell>
                <TableCell>Password</TableCell>
                <TableCell>Date Added</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {passwords.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell>{item.website}</TableCell>
                  <TableCell>{item.username}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center">
                      <Typography variant="body2">
                        {showPassword[index]
                          ? item.decrypted_password
                          : "••••••••"}
                      </Typography>
                      <IconButton
                        onClick={() => togglePasswordVisibility(index)}
                        size="small"
                      >
                        {showPassword[index] ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                      <Tooltip title="Copy Password">
                        <IconButton
                          onClick={() =>
                            handleCopy(item.decrypted_password || "")
                          }
                          size="small"
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>{item.date || "-"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenDialog(index)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(index)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editIndex !== null ? "Edit Password" : "Add Password"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Website / App"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            fullWidth
          />
          <TextField
            label="Username / Email"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            fullWidth
          />
          <TextField
            label="Password"
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PasswordTableManager;
