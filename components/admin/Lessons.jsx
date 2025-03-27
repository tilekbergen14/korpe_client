import React, { useState, useEffect } from "react";
import styles from "../../styles/Lessons.module.css";
import Card from "../Card";
import Select from "../Select";
import { Button, CircularProgress } from "@mui/material";
import CreateLesson from "../modal/CreateLesson";
import Snackbar from "../../components/Snackbar";
import axios from "axios";

export default function Lessons() {
  const [selected, setSelected] = useState("All");
  const [createLesson, setCreateLesson] = useState(false);
  const [editLesson, setEditLesson] = useState(false);
  const [lessonEdited, setLessonEdited] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [lessonCreated, setLessonCreated] = useState(false);
  const [lessons, setLessons] = useState(null);
  useEffect(async () => {
    try {
      const result = await axios.get(`${process.env.server}/lesson`);
      setLessons(result.data);
    } catch (err) {
      console.log(err);
    }
  }, [createLesson, editLesson, deleted]);

  return (
    <div className={styles.page}>
      <p className="title m-0" style={{ color: "#000" }}>
        Lessons
      </p>
      <div className="flex space-between align-center my-8">
        <Select
          options={["All", "Published", "Unpublished"]}
          setSelected={setSelected}
          selected={selected}
        />
        <Button
          onClick={() => setCreateLesson(true)}
          variant="contained"
          color="success"
        >
          New lesson
        </Button>
        {createLesson && (
          <CreateLesson
            setCreateLesson={setCreateLesson}
            setLessonCreated={setLessonCreated}
          />
        )}
        {editLesson !== false && (
          <CreateLesson
            setCreateLesson={setEditLesson}
            setLessonCreated={setLessonEdited}
            exisetedLesson={lessons[editLesson]}
            setDeleted={setDeleted}
          />
        )}
      </div>
      {lessons ? (
        lessons.length !== 0 ? (
          <div className={styles.gridBox}>
            {lessons.map((lesson, index) => {
              return (
                <Card
                  key={index}
                  content={{ ...lesson, setEditLesson, index }}
                  to={`admin/lesson/${lesson.slug}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-1 justify-center align-center">
            There is no lessons
          </div>
        )
      ) : (
        <div className="flex flex-1 justify-center align-center">
          <CircularProgress />
        </div>
      )}
      {lessonCreated && (
        <Snackbar
          open={lessonCreated}
          setPostCreated={setLessonCreated}
          message="New lesson created succesfully!"
          color="success"
        />
      )}
      {lessonEdited && (
        <Snackbar
          open={lessonEdited}
          setPostCreated={setLessonEdited}
          message="Lesson edited successfully!"
          color="success"
        />
      )}
      {deleted && (
        <Snackbar
          open={deleted}
          setPostCreated={setDeleted}
          message="Lesson deleted successfully!"
          color="success"
        />
      )}
    </div>
  );
}
