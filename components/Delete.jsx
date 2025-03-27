import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/router";

export default function Delete({
  wheredelete,
  questionDelete,
  setDeleted,
  setAnswers,
  id,
  redirectTo,
  variant,
  color,
  setLoading,
  setCreateLesson,
  setAnswerLength,
  lessonDelete,
  fullWidth,
  additional,
}) {
  const [verify, setVerify] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    try {
      setVerify(false);
      setLoading && setLoading((state) => ({ ...state, loading: true }));

      setAnswerLength && setAnswerLength((answerLength) => answerLength - 1);
      setAnswers &&
        setAnswers((answers) => answers.filter((answer) => answer.id !== id));
      const user = JSON.parse(localStorage.getItem("user"));
      const result = await axios.delete(
        `${process.env.server}/${wheredelete}/${id}${
          additional ? `?${additional}` : ""
        }`,
        {
          headers: {
            authorization: "Bearer " + user.token,
          },
        }
      );

      if (result && questionDelete) {
        router.push("/");
      }
      if (result && lessonDelete) {
        router.push("/admin/");
      }
      if (result && redirectTo) {
        return router.push(`/${redirectTo}/`);
      }
      if (setLoading && result) {
        setLoading((state) => ({ ...state, loading: false, create: "" }));
        router.replace(router.asPath);
      }

      setCreateLesson && setCreateLesson(false);
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <span>
      {variant !== "p" ? (
        <Button
          onClick={() => setCreateLesson(true)}
          variant="contained"
          color="danger"
          onClick={() => setVerify(true)}
          size="small"
          fullWidth={fullWidth ? true : false}
        >
          Delete
        </Button>
      ) : (
        <span
          onClick={() => setVerify(true)}
          style={{ color: "#FD3A69" }}
          className="c-pointer"
        >
          Delete
        </span>
      )}
      {verify && (
        <div style={styles.box}>
          <div style={styles.modal}>
            Do you really wanna delete this!
            <div style={styles.buttons}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setVerify(false)}
                size="small"
              >
                Cancel
              </Button>
              <Button variant="contained" color="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}

const styles = {
  box: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    height: "100vh",
    zIndex: "5",
    display: "grid",
    placeContent: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "8px",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "24px",
  },
};
