import React, { useState } from "react";
import styles from "../styles/QuestionModal.module.css";
import { TextField, Button } from "@mui/material";
import MyEditor from "./Editor";
import { convertToRaw, EditorState } from "draft-js";
import axios from "axios";
import Snackbar from "./Snackbar";
import { convertFromRaw } from "draft-js";
import { useRouter } from "next/router";

export default function Askquestion({
  setAskquestion,
  setQuestionCreated,
  existedQuestion,
  existedAnswer,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const router = useRouter();
  const [question, setQuestion] = useState({
    title: existedQuestion ? existedQuestion.title : "",
    body: existedQuestion?.body
      ? EditorState.createWithContent(convertFromRaw(existedQuestion.body))
      : existedAnswer?.body
      ? EditorState.createWithContent(convertFromRaw(existedAnswer.body))
      : EditorState.createEmpty(),
    tags: existedQuestion?.tags ? existedQuestion.tags : "",
  });
  const handleChange = (e) => {
    if (e.target) {
      setQuestion({ ...question, [e.target.name]: e.target.value });
    } else {
      setQuestion({ ...question, body: e });
    }
  };
  const toolbar = ["blockType", "list", "link"];
  const blockType = ["Normal", "Blockquote", "Code"];

  const handleSubmit = async () => {
    try {
      setError(null);
      if (question.title === "" && !existedAnswer)
        return setError("Title is required!");
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      let result = null;
      if (existedQuestion) {
        result = await axios.put(
          `${process.env.server}/question/${existedQuestion.id}`,
          {
            ...question,
            body: convertToRaw(question.body.getCurrentContent()),
          },
          {
            headers: {
              authorization: "Bearer " + user.token,
            },
          }
        );
      } else if (existedAnswer) {
        result = await axios.put(
          `${process.env.server}/answer/${existedAnswer.id}`,
          {
            body: convertToRaw(question.body.getCurrentContent()),
          },
          {
            headers: {
              authorization: "Bearer " + user.token,
            },
          }
        );
      } else {
        result = await axios.post(
          `${process.env.server}/question`,
          {
            ...question,
            body: convertToRaw(question.body.getCurrentContent()),
          },
          {
            headers: {
              authorization: "Bearer " + user.token,
            },
          }
        );
      }

      if (result) {
        router.replace(router.asPath);
        setLoading(false);
        setAskquestion(false);
        setQuestionCreated(true);
      }
    } catch (err) {
      setLoading(false);
      setError(
        err.response
          ? err.response.data
          : "Something went wrong, please try again!"
      );
    }
  };

  if (existedAnswer) {
    return (
      <div className={styles.addquestion}>
        <div className={styles.questionModal}>
          {error && (
            <Snackbar
              open={error && true}
              setError={setError}
              message={error}
              color="error"
            />
          )}
          <h3 className="m-0 title">You are editing question!</h3>
          <p className={styles.info}>Please describe your answer clearly!</p>
          <div className={styles.editor}>
            <MyEditor
              onEditorChange={handleChange}
              toolbar={toolbar}
              blockType={blockType}
              editorState={question.body}
              wrapper={true}
              height="300px"
            />
          </div>
          <div className="flex space-between">
            <Button
              color="secondary"
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={() => setAskquestion(false)}
            >
              Cancel
            </Button>
            <Button
              color="success"
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Loading..." : "Edit"}
            </Button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={styles.addquestion}>
        <div className={styles.questionModal}>
          {error && (
            <Snackbar
              open={error && true}
              setError={setError}
              message={error}
              color="error"
            />
          )}
          <h3 className="m-0 title">You are adding question!</h3>
          <p className={styles.info}>Please describe your question clearly!</p>
          <TextField
            fullWidth
            id="standard-basic"
            label="Title"
            variant="outlined"
            margin="dense"
            name="title"
            defaultValue={question.title}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            id="standard-basic"
            label="Tags"
            variant="outlined"
            margin="dense"
            name="tags"
            defaultValue={question.tags}
            onChange={handleChange}
          />
          <div className={styles.editor}>
            <MyEditor
              onEditorChange={handleChange}
              toolbar={toolbar}
              blockType={blockType}
              editorState={question.body}
              wrapper={true}
              height="300px"
            />
          </div>
          <div className="flex space-between">
            <Button
              color="secondary"
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={() => setAskquestion(false)}
            >
              Cancel
            </Button>
            <Button
              color="success"
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Loading..." : existedQuestion ? "Edit" : "Ask"}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
