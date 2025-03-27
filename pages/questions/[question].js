import React, { useState, useEffect } from "react";
import styles from "../../styles/Posts.module.css";
import { Button } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import adbox from "../../public/images/adbox.png";
import { stateToHTML } from "draft-js-export-html";
import Prism from "prismjs";
import { Avatar, ListItemIcon, ListItemText } from "@mui/material";
import moment from "moment";
import Likes from "../../components/Likes";
import MyEditor from "../../components/Editor";
import { EditorState, convertFromRaw, convertToRaw, Editor } from "draft-js";
import axios from "axios";
import Backdrop from "../../components/Backdrop";
import Links from "../../components/Links";
import Delete from "../../components/Delete";
import Snackbar from "../../components/Snackbar";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EditQuestion from "../../components/Askquestion";
import Edit from "@mui/icons-material/Edit";

export default function questions({ question }) {
  const toolbar = ["blockType", "list", "link"];
  const router = useRouter();
  const [deleted, setDeleted] = useState(false);
  const [questionDeleted, setQuestionDeleted] = useState(false);
  const [answers, setAnswers] = useState(
    question.answers ? question.answers : []
  );
  const [questionEdit, setQuestionEdit] = useState(false);
  const [answerEdit, setAnswerEdit] = useState(false);
  const [questionEdited, setQuestionEdited] = useState(false);
  const [answerEdited, setAnswerEdited] = useState(false);
  const [error, setError] = useState(null);
  const [answerAdded, setAnswerAdded] = useState(false);
  const [answerLength, setAnswerLength] = useState(question?.answers?.length);
  const [loading, setLoading] = useState(false);
  const blockType = ["Normal", "Blockquote", "Code"];
  const [answer, setAnswer] = useState({
    editorState: EditorState.createEmpty(),
  });
  const handleChange = (e) => {
    setAnswer({ editorState: e });
  };
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      Prism.highlightAll();
      setUser(JSON.parse(localStorage.getItem("user")));
    }
    setAnswers(question?.answers);
    setAnswer({ ...answer, editorState: EditorState.createEmpty() });
    setAnswerLength(question?.answers?.length);
  }, [question]);

  let options = {
    blockRenderers: {
      code: (block) => {
        return (
          "<pre><code class='language-javascript'>" +
          block.getText() +
          "</pre></code>"
        );
      },
    },
  };
  let body;

  try {
    body = stateToHTML(convertFromRaw(question.body), options);
  } catch (err) {}
  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (user) {
        const result = await axios.post(
          `${process.env.server}/answer`,
          {
            body: convertToRaw(answer.editorState.getCurrentContent()),
            question_id: question.id,
          },
          {
            headers: {
              authorization: "Bearer " + user.token,
            },
          }
        );
        if (result) {
          router.replace(router.asPath);
          setAnswerAdded(true);
        }
      }
      if (!user) {
        console.log("please log in");
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Something went wrong!");
      console.log(err);
    }
  };

  return (
    <div className={styles.postsPage}>
      <div className={styles.first}>
        <Links />
      </div>
      <div className={styles.second}>
        <h3 className="title" style={{ margin: "8px 0" }}>
          Question
        </h3>
        <div className={styles.question}>
          <div className="flex space-between">
            <div className="flex align-center">
              <ListItemIcon>
                <Avatar variant="rounded" src={question.authorProfile} />
              </ListItemIcon>
              <ListItemText
                sx={{ margin: 0 }}
                primary={question.author}
                secondary={moment(question.createdAt).fromNow()}
              />
            </div>

            <Likes
              likewhere="question"
              id={question.id}
              isLiked={question.userLiked}
              likeNumber={question.likes}
            />
          </div>
          <h2 className={`${styles.questionTitle}`}>{question.title}</h2>
          <div
            className={styles.body}
            dangerouslySetInnerHTML={{ __html: body }}
          ></div>
          <div className="flex  mb-16 space-between align-center">
            <EditIcon
              size="small"
              sx={{ color: "#757575" }}
              className="hover c-pointer"
              onClick={() => {
                setQuestionEdit(true);
              }}
            />
            {questionEdit && (
              <EditQuestion
                setAskquestion={setQuestionEdit}
                setQuestionCreated={setQuestionEdited}
                existedQuestion={question}
              />
            )}
            {questionEdited && (
              <Snackbar
                setOpen={setQuestionEdited}
                open={questionEdited}
                message="Question edited successfully!"
                color="success"
              />
            )}
            <Delete
              wheredelete="question"
              setDeleted={setQuestionDeleted}
              id={question.id}
              color="#757575"
              questionDelete={true}
            />
          </div>
        </div>
        {answerLength === 0 ? (
          <p className={styles.blockquote}>
            There is no answers yet! Be first one to answer
          </p>
        ) : (
          <div className="flex space-between">
            <h3 className="title" style={{ margin: "8px 0" }}>
              {answerLength === 1
                ? answerLength + " Answer"
                : answerLength + " Answers"}
            </h3>
            <div>
              <Button variant="text" sx={{ textTransform: "none" }}>
                Top
              </Button>
              <Button variant="text" sx={{ textTransform: "none" }}>
                Latest
              </Button>
            </div>
          </div>
        )}
        {answers.map(
          (answer, index) =>
            answer.body !== null && (
              <div className={styles.answer} key={answer.id}>
                <div
                  className={styles.body}
                  dangerouslySetInnerHTML={{
                    __html: stateToHTML(convertFromRaw(answer.body), options),
                  }}
                ></div>
                <div className="flex space-between">
                  <div className="flex align-center">
                    <ListItemIcon>
                      <Avatar variant="rounded" src={answer?.authorProfile} />
                    </ListItemIcon>
                    <ListItemText
                      sx={{ margin: 0 }}
                      primary={answer.author}
                      secondary={moment(answer.createdAt).fromNow()}
                    />
                  </div>
                  {user &&
                    (user.id === answer?.author_id ? (
                      <div className="grid grid-center b-r-2">
                        <div className="flex flex-end align-center">
                          <EditIcon
                            size="small"
                            sx={{ color: "#757575" }}
                            className="hover c-pointer"
                            onClick={() => {
                              setAnswerEdit(true);
                            }}
                          />
                          <Delete
                            wheredelete="answer"
                            setDeleted={setDeleted}
                            setAnswers={setAnswers}
                            setAnswerLength={setAnswerLength}
                            id={answer.id}
                            color="#757575"
                          />
                          {answerEdit && (
                            <EditQuestion
                              setAskquestion={setAnswerEdit}
                              setQuestionCreated={setAnswerEdited}
                              existedAnswer={answer}
                            />
                          )}
                          {answerEdited && (
                            <Snackbar
                              setOpen={setAnswerEdited}
                              open={answerEdited}
                              message="Answer edited successfully!"
                              color="success"
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <Likes
                        likewhere="answer"
                        id={answer.id}
                        isLiked={answer.userLiked}
                        likeNumber={answer.likes}
                      />
                    ))}
                </div>
              </div>
            )
        )}
        <h3 className="title" style={{ margin: "8px 0 0 0" }}>
          Write your answer
        </h3>
        <div className={styles.editor} id="editor">
          <MyEditor
            onEditorChange={handleChange}
            toolbar={toolbar}
            blockType={blockType}
            editorState={answer.editorState}
            height="100%"
          />
        </div>
        <div className="flex flex-end">
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            sx={{ marginTop: "16px" }}
          >
            Answer
          </Button>
        </div>
      </div>
      <div className={styles.third}>
        <Image src={adbox} layout="fill" className="b-radius-8" />
      </div>
      {loading && <Backdrop loading={loading} />}
      {answerAdded && (
        <Snackbar
          setOpen={setAnswerAdded}
          open={answerAdded}
          message="Comment created successfully!"
          color="success"
        />
      )}
      {deleted && (
        <Snackbar
          setOpen={setDeleted}
          open={deleted}
          message="Comment eleted successfully!"
          color="danger"
        />
      )}
      {questionDeleted && (
        <div>
          {router.push("/questions")}
          <Snackbar
            setOpen={setQuestionDeleted}
            open={questionDeleted}
            message="Question eleted successfully!"
            color="danger"
          />
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const questionId = context.params.question;
    const question = await axios.get(
      `${process.env.server}/question/${questionId}`
    );
    if (question) {
      return {
        props: {
          question: question.data,
        },
      };
    }
  } catch (err) {
    return {
      notFound: true,
    };
  }
}
