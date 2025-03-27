import React, { useState, useEffect } from "react";
import styles from "../../styles/QuestionModal.module.css";
import { TextField, Button } from "@mui/material";
import axios from "axios";
import Snackbar from "../Snackbar";
import { useRouter } from "next/router";
import CloseIcon from "@mui/icons-material/Close";
import ImageUpload from "../ImageUpload";
import Link from "next/link";

export default function CreateLesson({
  setCreateLesson,
  setLessonCreated,
  exisetedLesson,
  setDeleted,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [lesson, setLesson] = useState({
    title: exisetedLesson ? exisetedLesson.title : "",
    price: exisetedLesson?.price ? exisetedLesson.price : "",
    imgUrl: exisetedLesson?.imgUrl ? exisetedLesson.imgUrl : "",
    slug: exisetedLesson?.slug ? exisetedLesson.slug : "",
    description: exisetedLesson?.description ? exisetedLesson.description : "",
  });
  const [imgUpdated, setImgUpdated] = useState(false);
  const body = document.body;
  body.classList.add("overflow-hidden");
  let data = new FormData();
  const handleChange = (e) => {
    if (e.target) {
      setLesson({ ...lesson, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    try {
      if (lesson.title !== "" && lesson.slug !== "") {
        setError(null);
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));

        let result;
        data.append("title", lesson.title);
        data.append("slug", lesson.slug);
        data.append("price", lesson.price);
        data.append("file", lesson.imgUrl);
        data.append("description", lesson.description);
        result = await axios.post(`${process.env.server}/lesson`, data, {
          headers: {
            authorization: "Bearer " + user.token,
          },
        });
        if (result) {
          setLoading(false);
          setCreateLesson(false);
          setLessonCreated(true);
          router.replace(router.asPath);
        }
      } else {
        setError("Title and slug required!");
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
        <div className="flex space-between">
          <h3 className="my-16 mt-0 title">
            {exisetedLesson ? "Edit this lesson!" : "Add lesson!"}
          </h3>
          <CloseIcon
            onClick={() => setCreateLesson(false)}
            color="text.secondary"
            className="c-pointer"
          />
        </div>
        <div className="divider mb-16"></div>
        <ImageUpload
          setImgUrl={setLesson}
          existedImg={lesson.imgUrl}
          aspectRatio="16 / 9"
          setImgUpdated={setImgUpdated}
        />
        <TextField
          disabled={exisetedLesson}
          fullWidth
          id="standard-basic"
          label="Title"
          variant="outlined"
          margin="dense"
          name="title"
          defaultValue={lesson.title}
          onChange={handleChange}
        />
        <TextField
          disabled={exisetedLesson}
          fullWidth
          id="standard-basic"
          label="Description"
          variant="outlined"
          margin="dense"
          name="description"
          defaultValue={lesson.description}
          onChange={handleChange}
        />
        <div className="flex">
          <TextField
            disabled={exisetedLesson}
            fullWidth
            id="standard-basic"
            label="Price"
            variant="outlined"
            margin="dense"
            name="price"
            defaultValue={lesson.price}
            onChange={handleChange}
            sx={{ marginRight: 1 }}
          />
          <TextField
            disabled={exisetedLesson}
            fullWidth
            id="standard-basic"
            label="Slug"
            variant="outlined"
            margin="dense"
            name="slug"
            defaultValue={lesson.slug}
            onChange={handleChange}
          />
        </div>
        <div className="flex space-between mt-16">
          {exisetedLesson ? (
            <Link href={`/admin/lesson/${exisetedLesson.slug}`}>
              <Button color="info" variant="contained" size="small">
                Manage lesson
              </Button>
            </Link>
          ) : (
            <Button
              color="secondary"
              variant="contained"
              onClick={() => setCreateLesson(false)}
              size="small"
            >
              Cancel
            </Button>
          )}
          {!exisetedLesson && (
            <Button
              color="success"
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              size="small"
            >
              {loading ? "Loading..." : exisetedLesson ? "Edit" : "Add"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
