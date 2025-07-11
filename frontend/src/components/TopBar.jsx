import { Divider, IconButton, Toolbar, Typography, Button, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyIcon from '@mui/icons-material/Key';


const TopBar = ({ scrollToGenerate, scrollToPasswords, scrollToAbout }) => {
  return (
    <>
      <Toolbar sx={{ backgroundColor: '#1e1e2f', color: 'white', boxShadow: 2}}>
      
      <IconButton edge="start" sx={{ color: 'white', mr: 2 }}>
        <KeyIcon />
      </IconButton>

      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        PassVault
      </Typography>

      <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
        <Button  onClick={scrollToGenerate} color="inherit" variant="outlined" sx={{ borderColor: 'white', color: 'white', '&:hover': { backgroundColor: '#333' } }}>
          Generate Password
        </Button>
        <Button onClick={scrollToPasswords} color="inherit" variant="outlined" sx={{ borderColor: 'white', color: 'white', '&:hover': { backgroundColor: '#333' } }}>
          Your Passwords
        </Button>
        <Button onClick={scrollToAbout} href="#about" color="inherit" variant="outlined" sx={{ borderColor: 'white', color: 'white', '&:hover': { backgroundColor: '#333' } }}>
          About Us
        </Button>
      </Box>

      <IconButton sx={{ color: 'white', ml: 2 }}>
        <AccountCircleIcon />
      </IconButton>
    </Toolbar>

      <Divider />

       <Toolbar sx={{fontSize:20, justifyContent:"center", textTransform:"uppercase", fontFamily:"monospace"}}>
        Can’t remember passwords? We got you covered.
       </Toolbar>
    </>
  );
};

export default TopBar;
