import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../styles/Posts.module.css";
import Question from "../../components/Question";
import { Button } from "@mui/material";
import Image from "next/image";
import adbox from "../../public/images/adbox.png";
import QuestionModal from "../../components/Askquestion";
import Snackbar from "../../components/Snackbar";
import Languages from "../../components/Links";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/router";
import { route } from "next/dist/server/router";
export default function questions(props) {
  const [questions, setQuestions] = useState(props.questions);
  const [askquestion, setAskquestion] = useState(false);
  const [questionCreated, setQuestionCreated] = useState(false);
  const [loadmore, setLoadmore] = useState(false);
  const [category, setCategory] = useState("latest");
  const router = useRouter();

  const handleLoadMore = async () => {
    try {
      setLoadmore(true);
      const { data } = await axios.get(
        `${process.env.server}/question?offset=${questions?.length}`
      );
      setQuestions([...questions, ...data]);
      setLoadmore(false);
    } catch (err) {
      setLoadmore(false);
    }
  };

  const handleQuestions = async (e) => {
    if (e === "latest") {
      setCategory("latest");
      setQuestions(props.questions);
      router.replace(router.asPath);
    }
    if (e === "top") {
      setCategory("top");
      const { data } = await axios.get(
        `${process.env.server}/question?category=top`
      );
      setQuestions(data);
    }
  };
  useEffect(() => {
    setQuestions(props.questions);
  }, [props.questions]);

  return (
    <div className={styles.postsPage}>
      {askquestion && (
        <QuestionModal
          setAskquestion={setAskquestion}
          setQuestionCreated={setQuestionCreated}
        />
      )}
      {questionCreated && (
        <Snackbar
          open={questionCreated}
          setPostCreated={setQuestionCreated}
          message="Question created succesfully!"
          color="success"
        />
      )}
      <div className={styles.left}>
        <Languages />
        <div className={styles.ad}>
          <Image src={adbox} layout="fill" className="b-radius-8" />
        </div>
      </div>
      <div className={styles.second}>
        <div className="flex space-between">
          <div className="flex">
            <Button
              onClick={() => handleQuestions("latest")}
              variant="text"
              color={category === "latest" ? "info" : "primary"}
              sx={{ textTransform: "none" }}
            >
              Latest
            </Button>
            <Button
              onClick={() => handleQuestions("top")}
              variant="text"
              color={category === "top" ? "info" : "primary"}
              sx={{ textTransform: "none" }}
            >
              Top
            </Button>
          </div>
          <Button
            variant="contained"
            color="success"
            sx={{ textTransform: "none" }}
            onClick={() => setAskquestion(true)}
          >
            Ask Question
          </Button>
        </div>
        {questions.map((question) => (
          <Question key={question.id} question={question} />
        ))}
        <div className="flex justify-center m-8">
          {loadmore ? (
            <CircularProgress color="inherit" />
          ) : (
            <p
              className="c-pointer m-0 smallTitle"
              onClick={() => {
                handleLoadMore();
              }}
            >
              Load more
            </p>
          )}
        </div>
      </div>
      <div className={styles.third}>
        <Image src={adbox} layout="fill" className="b-radius-8" />
      </div>
    </div>
  );
}

export const getStaticProps = async () => {
  try {
    const questions = await axios.get(`${process.env.server}/question`);
    return {
      props: { questions: questions.data ? questions.data : [] },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
