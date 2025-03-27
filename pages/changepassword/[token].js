import React, { useState } from "react";
import axios from "axios";
import { Grid, Paper, TextField, Button, Typography } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/router";
import Snackbar from "../../components/Snackbar";

export default function Password() {
  const [visibility, setVisibility] = useState({
    password1: true,
    password2: true,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passChanged, setPassChanged] = useState(false);
  const [password, setPassword] = useState({
    password1: "",
    password2: "",
  });
  const router = useRouter();
  function handleVisibility(value) {
    if (value === 1) {
      setVisibility({ ...visibility, password1: !visibility.password1 });
    }
    if (value === 2) {
      setVisibility({ ...visibility, password2: !visibility.password2 });
    }
  }

  const handlePasswordChange = async () => {
    if (password.password1 !== password.password2)
      return setError("Passwords doesn't match!");
    setError(null);
    setLoading(true);
    try {
      const token = router.query.token;
      const result = await axios.post(
        `${process.env.server}/user/changepassword/${token}`,
        {
          newpassword: password.password1,
          newpassword2: password.password2,
        }
      );
      if (result) {
        setPassChanged(true);
        router.push("/");
        setLoading(false);
      }
    } catch (err) {
      setError("Something went wrong!");
      setLoading(false);
    }
  };
  return (
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
        <Typography sx={{ color: "#e41749", mb: 1 }} variant="body2">
          {error && "* " + error}
        </Typography>
        <TextField
          id="password1"
          required
          label="Password"
          variant="outlined"
          onChange={(e) =>
            setPassword({ ...password, password1: e.target.value })
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
                  {visibility.password1 ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          id="password2"
          required
          label="Confirm password"
          variant="outlined"
          onChange={(e) =>
            setPassword({ ...password, password2: e.target.value })
          }
          color="primary"
          margin="dense"
          type={visibility.password2 ? "password" : "text"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => handleVisibility(2)}
                  edge="end"
                >
                  {visibility.password2 ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="success"
          disabled={loading ? true : false}
          sx={{ color: "white", marginTop: "1rem" }}
          onClick={handlePasswordChange}
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
            "Change password"
          )}
        </Button>
        {passChanged && (
          <Snackbar
            open={passChanged}
            setOpen={setPassChanged}
            message="Password changed succesfully!"
            color="success"
          />
        )}
        {console.log(passChanged)}
      </Paper>
    </Grid>
  );
}

export const getServerSideProps = async (context) => {
  try {
    const token = context.params.token;
    const result = await axios.post(
      `${process.env.server}/user/changepassword/${token}`
    );
    if (result) {
      return {
        props: {},
      };
    }
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
