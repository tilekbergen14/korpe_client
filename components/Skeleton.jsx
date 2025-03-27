import React from "react";
import styles from "../styles/Skeleton.module.css";

export default function Skeleton({
  aspectRatio,
  height,
  width,
  bgColor,
  margin,
}) {
  const skeleton = {
    height: height,
    backgroundColor: bgColor ? bgColor : "#fff",
    width: width,
    margin: margin ? margin : "16px 0 8px 0",
    borderRadius: "8px",
    aspectRatio: aspectRatio,
  };

  return (
    <div className={styles.skeleton} style={skeleton}>
      <div className={styles.mover}></div>
    </div>
  );
}
