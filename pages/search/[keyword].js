import { useState } from "react";
import styles from "../../styles/Home.module.css";
import Image from "next/image";
import homepage from "../../public/images/homepage.png";
import Search from "../../components/Search";
import Links from "../../components/Links";
import { TextField, MenuItem, CircularProgress } from "@mui/material";
import axios from "axios";
import Question from "../../components/Question";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Link from "next/link";
import Card from "../../components/Card";

export default function SearchResults(props) {
  const [category, setCategory] = useState("All");
  const [loadmore, setLoadmore] = useState(false);
  const categories = ["All", "Posts", "Questions", "Lessons"];
  const [posts, setPosts] = useState(props.posts);
  const [lessons, setLessons] = useState(props.lessons);
  const [questions, setQuestions] = useState(props.questions);
  const handleLoadMore = async () => {
    try {
      setLoadmore(true);
      const { data } = await axios.get(
        `${process.env.server}/search?keyword=${props.keyword}&limit=6&questions=${posts.length}`
      );
      setPosts([...posts, ...data.posts]);
      setQuestions([...questions, ...data.questions]);
      setLessons([...lessons, ...data.lessons]);
      setLoadmore(false);
    } catch (err) {
      setLoadmore(false);
    }
  };

  return (
    <div className={styles.homepage}>
      <div className={`${styles.header} ${styles.spHeader}`}>
        <div className={`${styles.openingText} ${styles.spOpeningText}`}>
          <h1 className={styles.bigText}>
            <span className={styles.learn}>Learn</span>
            <span className={styles.teach}>Teach</span>
            <span className={styles.explore}>Explore with us!</span>
          </h1>
          <p className={styles.optSmall}>
            We are the comminity of code learners from Kazakhstan! We learn,
            teach and much more. Join the team.
          </p>
        </div>
        <div className={styles.searchBox}>
          <Search value={props.keyword} />
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.bodyRight}>
          <div className="flex space-between mt-16">
            <h3 className="title">Results</h3>
            <TextField
              id="standard-basic"
              label="Category"
              variant="standard"
              name="blockId"
              className="mobile-none"
              select
              value={category}
              sx={{ width: "100px" }}
            >
              {categories.map((category, index) => (
                <MenuItem
                  key={index}
                  value={category}
                  onClick={() => setCategory(category)}
                >
                  {category}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div className={styles.posts}>
            {(category === "Posts" || category === "All") &&
              posts.map((post, index) => <Card post={post} key={index} />)}
            {(category === "Lessons" || category === "All") &&
              lessons.map((lesson, index) => (
                <Card
                  key={index}
                  content={lesson}
                  to={`courses/${lesson.slug}`}
                />
              ))}
          </div>

          {(category === "Questions" || category === "All") &&
            questions.map((question, index) => (
              <Question key={index} question={question} mini={true} />
            ))}
          <div className="flex justify-center m-8">
            {loadmore ? (
              <CircularProgress color="inherit" />
            ) : (
              <p className="c-pointer m-0 smallTitle" onClick={handleLoadMore}>
                Load more
              </p>
            )}
          </div>
        </div>
        <div className="mobile-none">
          <Links />
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  try {
    const keyword = context.params.keyword;

    const result = await axios.get(
      `${process.env.server}/search?keyword=${keyword}&limit=6`
    );
    return {
      props: {
        posts: result.data.posts ? result.data.posts : [],
        questions: result.data.questions ? result.data.questions : [],
        lessons: result.data.lessons ? result.data.lessons : [],
        keyword,
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
