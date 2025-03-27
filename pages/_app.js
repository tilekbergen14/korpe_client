import "../styles/globals.css";
import "../styles/prism.css";
import Navbar from "../components/Navbar";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Footer from "../components/Footer";

const theme = createTheme({
  typography: {
    fontFamily: "inherit",
  },
  palette: {
    primary: {
      main: "#111f4d",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f2f4f7",
      contrastText: "#757575",
    },
    danger: {
      main: "#FD3A69",
      contrastText: "#fff",
    },
    success: {
      main: "#406343",
      contrastText: "#fff",
    },
    blue: {
      main: "#bae8e8",
      contrastText: "#000",
    },
    green: {
      main: "#264653",
      contrastText: "#fff",
    },
    text: {
      main: "#365acf",
      contrastText: "#fff",
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <div className="content">
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
}

export default MyApp;
