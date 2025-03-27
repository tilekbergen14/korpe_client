import React, { useState, useEffect } from "react";
import { TextField, MenuItem } from "@mui/material";
import styles from "../../styles/Courses.module.css";
import axios from "axios";
import Card from "../../components/Card";
import Search from "../../components/Search";

export default function index(props) {
  const [keyword, setKeyword] = useState("");
  const [lessons, setLessons] = useState(props.lessons);
  useEffect(() => {
    let filteredLessons = [];
    if (keyword !== "") {
      for (let i = 0; i < props.lessons.length; i++) {
        if (
          props.lessons[i].title.toUpperCase().indexOf(keyword.toUpperCase()) >
          -1
        ) {
          filteredLessons.push(props.lessons[i]);
        }
      }
      setLessons(filteredLessons);
    } else {
      setLessons(props.lessons);
    }
  }, [keyword]);

  return (
    <div className={`${styles.body} container m-auto`}>
      <div className="p-container">
        <div className="flex space-between align-center py-24">
          <div style={{ width: "100%" }}>
            <Search margin="8px" keyword={keyword} setKeyword={setKeyword} />
          </div>
        </div>
        <div className={`${styles.gridView}`}>
          {lessons.map((lesson, index) => (
            <Card key={index} content={lesson} to={`courses/${lesson.slug}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  try {
    const lessons = await axios.get(`${process.env.server}/lesson/`);

    if (lessons) {
      return {
        props: {
          lessons: lessons.data,
        },
      };
    }
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
