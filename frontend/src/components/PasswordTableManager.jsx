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
  verifyMasterPassword,
} from "../utils/api";
import { encryptPassword, decryptPassword } from "../utils/encryption";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";

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

  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [masterPasswordInput, setMasterPasswordInput] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  const { auth, setAuth } = useAuth(); 

  // fetch and decrypt passwords only when vault is unlocked
  const fetchAndDecryptPasswords = async (masterPassword) => {
    try {
      const rawPasswords = await getPasswords();

      if (!masterPassword) {
        toast.error("Master password missing.");
        return;
      }

      // Decrypt all passwords using the provided master password
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
            console.error("Decryption error for", item.website, e);
            decryptedPwd = "Error decrypting";
          }
          return { ...item, decrypted_password: decryptedPwd };
        })
      );

      setPasswords(decrypted);
    } catch (err) {
      toast.error("Error fetching or decrypting passwords.");
    }
  };

  // On mount, check if logged in but vault not unlocked => show unlock dialog
  useEffect(() => {
    if (auth.isLoggedIn) {
      if (auth.masterPassword) {
        // vault already unlocked (from context)
        setVaultUnlocked(true);
        fetchAndDecryptPasswords(auth.masterPassword);
      } else {
        // vault locked, ask for master password
        setVaultUnlocked(false);
      }
    }
  }, [auth.isLoggedIn, auth.masterPassword]);

  // Unlock vault handler
  const handleUnlockVault = async () => {
    if (!masterPasswordInput) {
      toast.error("Please enter master password");
      return;
    }

    setUnlocking(true);

    try {
      // Call backend to verify master password correctness
      const email = localStorage.getItem("user");
      const result = await verifyMasterPassword(email, masterPasswordInput);

      if (result.valid) {
        setVaultUnlocked(true);
        setAuth((prev) => ({ ...prev, masterPassword: masterPasswordInput }));
        toast.success("Vault unlocked!");
        await fetchAndDecryptPasswords(masterPasswordInput);
      } else {
        toast.error("Master password incorrect.");
      }
    } catch (err) {
      toast.error("Failed to verify master password.");
    }

    setUnlocking(false);
  };
  // Password dialog handlers etc remain unchanged...

  const handleOpenDialog = (index = null) => {
    if (!vaultUnlocked) {
      toast.error("Unlock vault first!");
      return;
    }

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
    if (!vaultUnlocked) {
      toast.error("Unlock vault first!");
      return;
    }

    try {
      const masterPassword = auth.masterPassword;
      if (!masterPassword) {
        toast.error("Something went wrong.");
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

      // Pass masterPassword explicitly here to avoid missing password error
      await fetchAndDecryptPasswords(masterPassword);

      handleCloseDialog();
      toast.success(
        editIndex !== null
          ? "Password updated successfully!"
          : "Password added successfully!"
      );
    } catch (err) {
      toast.error("Error saving password: " + (err.message || err));
    }
  };

  const handleDelete = async (index) => {
    try {
      const password = passwords[index];
      await deletePassword(password.id);
      await fetchAndDecryptPasswords(auth.masterPassword);
    } catch (err) {
      toast.error("Error deleting password: " + (err.message || err));
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const togglePasswordVisibility = (index) => {
    setShowPassword((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // If not logged in, optionally show "Please login first" or redirect

  if (!auth.isLoggedIn) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">
          Please login to view your passwords.
        </Typography>
      </Box>
    );
  }

  // If vault locked, show unlock vault dialog only

  if (!vaultUnlocked) {
    return (
      <Dialog open fullWidth maxWidth="xs" disableEscapeKeyDown>
        <DialogTitle>Unlock Vault</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <Typography>
            Enter your master password to unlock your vault and decrypt your
            saved passwords.
          </Typography>
          <TextField
            label="Master Password"
            type="password"
            value={masterPasswordInput}
            onChange={(e) => setMasterPasswordInput(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleUnlockVault}
            disabled={unlocking}
            variant="contained"
          >
            {unlocking ? "Unlocking..." : "Unlock"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Vault unlocked: show normal password manager UI

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
