import { AppBar, Container } from "@mui/material";
import TopBar from "./components/TopBar";
import "./App.css";
import SignupPage from "./components/SignupPage";
import { Navigate, Route, Routes } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import Homepage from "./components/Homepage"
import Loginpage from "./components/Loginpage"
import ForgotPass from "./components/ForgotPass";
import { useAuth } from "./AuthContext";
import { ToastContainer } from "react-toastify";

function App() {
  const {auth} = useAuth();
  
  return (
    <>
      <Routes>
        <Route path="/" element={auth.isLoggedIn ? <Homepage/> :<Loginpage/>}/>
        <Route path="/home" element={auth.isLoggedIn? <Homepage/>: <Loginpage/>}/>
        <Route path="/login" element={auth.isLoggedIn? <Homepage/>: <Loginpage/>}/>
        <Route path="/register" element={<SignupPage/>}/>
        <Route path="/forgot" element={<ForgotPass/>}/>
        <Route path="*" element={<ErrorPage/>}></Route>
      </Routes>
    </>
  );
}

export default App;
