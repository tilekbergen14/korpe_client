import React, { useState } from "react";
import styles from "../styles/Profiler.module.css";
import Avatar from "@mui/material/Avatar";
import avatars from "../public/avatars";
import { Button } from "@mui/material";

export default function Profiler({ setShowProfiler, setInfo }) {
  const [choosen, setChoosen] = useState(null);
  return (
    <div className={styles.profiler}>
      <div
        onClick={() => setShowProfiler(false)}
        className={styles.closer}
      ></div>
      <div className={styles.modal}>
        <p className="title mt-0">Choose yourself profile!</p>
        <div className={styles.gridBox}>
          {avatars.map((avatar, index) => (
            <Avatar
              alt="avatar"
              variant="rounded"
              src={avatar.src}
              key={index}
              sx={{ height: "64px", width: "64px" }}
              className={`${styles.avatar} c-pointer ${
                choosen === avatar.src && styles.choosen
              }`}
              onClick={() => setChoosen(avatar.src)}
            />
          ))}
        </div>
        <Button
          onClick={() => {
            setShowProfiler(false);
            setInfo((info) => ({ ...info, profileImg: choosen }));
          }}
          variant="contained"
          color="success"
          fullWidth
          className="mt-16"
        >
          Choose
        </Button>
      </div>
    </div>
  );
}
