import { React, useRef } from "react";
import TopBar from "./TopBar.jsx";
import { Container, Box } from "@mui/material";
import AboutPage from "./AboutPage.jsx";
import Generator from "./Generator.jsx";
import PasswordTableManager from "./PasswordTableManager.jsx";
import { ToastContainer } from "react-toastify";

const Homepage = () => {
  const aboutRef = useRef(null);
  const generateRef = useRef(null);
  const passwordsRef = useRef(null);

  return (
    <>
      <Box sx={{ width: "100%", overflowX: "hidden" }}>
        <TopBar
          scrollToGenerate={() =>
            generateRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          scrollToPasswords={() =>
            passwordsRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          scrollToAbout={() =>
            aboutRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        />

        <div ref={aboutRef}>
          <AboutPage />
        </div>

        <div ref={generateRef}>
          <Generator />
        </div>

        <div ref={passwordsRef}>
          <PasswordTableManager />
        </div>
      </Box>
    </>
  );
};

export default Homepage;
