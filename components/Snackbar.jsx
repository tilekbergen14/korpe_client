import React, { useState } from "react";
import Stack from "@mui/material/Stack";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomizedSnackbars({
  open,
  setPostCreated,
  setError,
  setOpen,
  color,
  message,
  vertical,
  horizontal,
  autoHideDuration,
}) {
  const [sopen, setSopen] = useState(open);
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setPostCreated && setPostCreated(false);
    setError && setError(false);
    setOpen && setOpen(false);
  };

  return (
    <Stack spacing={2} sx={{ width: "100%", position: "absolute" }}>
      <Snackbar
        anchorOrigin={{
          vertical: vertical ? vertical : "bottom",
          horizontal: horizontal ? horizontal : "center",
        }}
        open={sopen}
        autoHideDuration={autoHideDuration ? parseInt(autoHideDuration) : 3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} color={color} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
