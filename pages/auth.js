import { useState } from "react";
import { Paper, Button, TextField, Grid, Typography } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { useRouter } from "next/router";

export default function auth() {
  const [visibility, setVisibility] = useState({
    password1: true,
    password2: true,
  });
  const [signin, setSignin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [forgetpass, setForgetpass] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    password: "",
    password2: "",
  });

  function handleVisibility(value) {
    if (value === 1) {
      setVisibility({ ...visibility, password1: !visibility.password1 });
    }
    if (value === 2) {
      setVisibility({ ...visibility, password2: !visibility.password2 });
    }
  }

  const handleLogin = () => {
    setSignin((signin) => !signin);
    setError(null);
    setUserData({
      ...userData,
      email: "",
      username: "",
      password: "",
      password2: "",
    });
    setLoading(false);
    setVerifyEmail("");
    setForgetpass(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      if (signin) {
        const initialData = {
          emailOrUsername: userData.username,
          password: userData.password,
        };
        const result = await axios.post(`${process.env.server}/user/login`, {
          ...initialData,
        });
        setLoading(false);
        if (result) {
          localStorage.setItem("user", JSON.stringify(result.data));
        }
        router.push("/");
        router.reload();
      }
      if (userData.password !== userData.password2 && !signin) {
        setError("Passwords does not match!");
        setLoading(false);
      }
      if (userData.password === userData.password2 && !signin) {
        const result = await axios.post(`${process.env.server}/user/register`, {
          ...userData,
        });
        if (result) {
          setVerifyEmail(result?.data ? result.data : "Something went wrong!");
        }
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError(
        err.response ? err.response.data : "Please try again after some time!"
      );
      setLoading(false);
    }
  };
  let user = null;
  if (typeof window !== "undefined") {
    user = localStorage.getItem("user");
    user && router.push("/");
  }

  const handleForgetpass = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await axios.post(
        `${process.env.server}/user/forgetpassword`,
        { email: userData.email }
      );
      if (result) {
        setForgetpass(false);
        setVerifyEmail("Please check your email!");
      }
    } catch (err) {
      setError(err?.response ? err.response.data : "Something went wrong!");
      setLoading(false);
    }
  };

  return (
    <div>
      <Grid
        container
        sx={{
          p: 2,
          width: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 64px)",
          height: "auto",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 2,
            display: "flex",
            width: "100%",
            maxWidth: 480,
            flexDirection: "column",
          }}
        >
          {forgetpass ? (
            <div className="flex flex-column ">
              <Typography sx={{ color: "#e41749", mb: 1 }} variant="body2">
                {error && "* " + error}
              </Typography>
              <TextField
                id="email"
                label="Please enter your email"
                required
                type="email"
                variant="outlined"
                autoComplete="off"
                color="primary"
                margin="dense"
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
              />
              <Button
                onClick={handleForgetpass}
                type="submit"
                variant="contained"
                color="success"
                disabled={loading ? true : false}
                sx={{ color: "white", marginTop: "1rem" }}
              >
                {loading ? (
                  <div>
                    <CircularProgress
                      size={16}
                      color="primary"
                      sx={{ marginRight: 1 }}
                    />{" "}
                    Loading
                  </div>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          ) : verifyEmail !== "" ? (
            <div className="flex justify-center">{verifyEmail}</div>
          ) : (
            <>
              <Typography sx={{ color: "#e41749", mb: 1 }} variant="body2">
                {error && "* " + error}
              </Typography>

              <form
                onSubmit={handleAuth}
                style={{ display: "flex", flexDirection: "column" }}
              >
                {!signin && (
                  <TextField
                    id="email"
                    label="Email"
                    required
                    type="email"
                    value={userData.email}
                    variant="outlined"
                    autoComplete="off"
                    color="primary"
                    margin="dense"
                    onChange={(e) =>
                      setUserData({ ...userData, email: e.target.value })
                    }
                  />
                )}

                <TextField
                  id="username"
                  required
                  value={userData.username}
                  label={signin ? "Username or email" : "Username"}
                  variant="outlined"
                  color="primary"
                  autoComplete="off"
                  margin="dense"
                  onChange={(e) =>
                    setUserData({ ...userData, username: e.target.value })
                  }
                />
                <TextField
                  id="password1"
                  value={userData.password}
                  required
                  label="Password"
                  variant="outlined"
                  onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                  }
                  color="primary"
                  margin="dense"
                  type={visibility.password1 ? "password" : "text"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => handleVisibility(1)}
                          edge="end"
                        >
                          {visibility.password1 ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {!signin && (
                  <TextField
                    required
                    id="password2"
                    label="Confirm Password"
                    variant="outlined"
                    color="primary"
                    value={userData.password2}
                    type={visibility.password2 ? "password" : "text"}
                    margin="dense"
                    onChange={(e) =>
                      setUserData({ ...userData, password2: e.target.value })
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            edge="end"
                            onClick={() => handleVisibility(2)}
                          >
                            {visibility.password2 ? (
                              <Visibility />
                            ) : (
                              <VisibilityOff />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  disabled={loading ? true : false}
                  sx={{ color: "white", marginTop: "1rem" }}
                >
                  {loading ? (
                    <div>
                      <CircularProgress
                        size={16}
                        color="primary"
                        sx={{ marginRight: 1 }}
                      />{" "}
                      Loading
                    </div>
                  ) : signin ? (
                    "Sign in"
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </form>
            </>
          )}
        </Paper>
        <Typography variant="body1" sx={{ m: 1 }}>
          {signin ? "Don't have an account?" : "Already have an account"}
          {"  "}
          <span className="link" onClick={handleLogin}>
            {signin ? "Sign up" : "Sign in"}
          </span>
        </Typography>
        {!forgetpass && (
          <Typography variant="body1">
            <span
              onClick={() => {
                setForgetpass(true);
              }}
              className="link"
            >
              Forget password
            </span>
          </Typography>
        )}
      </Grid>
    </div>
  );
}
