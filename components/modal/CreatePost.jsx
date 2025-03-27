import React, { useEffect, useState } from "react";
import MyEditor from "../Editor";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { convertFromHTML, EditorState, ContentState } from "draft-js";
import axios from "axios";
import Backdrop from "../Backdrop";
import Snackbar from "../Snackbar";
import { useRouter } from "next/router";
import ImageUpload from "../ImageUpload";
import { stateToHTML } from "draft-js-export-html";
import options from "../../functions/editorOptions";
import Delete from "../../components/Delete";

export default function createpost({ existedPost }) {
  const [loading, setLoading] = useState(false);
  const [postCreated, setPostCreated] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState({
    title: existedPost ? existedPost.title : "",
    tags: existedPost ? existedPost.tags.join(" ") : "",
    readtime: existedPost ? existedPost.readtime : "",
    imgUrl: existedPost ? existedPost.imgUrl : "",
    body: existedPost ? EditorState.createEmpty() : EditorState.createEmpty(),
  });
  const router = useRouter();
  const handleChange = (e) => {
    if (e.target) {
      setInfo({
        ...info,
        [e.target.name]: e.target.value,
      });
    } else {
      setInfo({ ...info, body: e });
    }
  };
  let user,
    isAdmin = false;

  if (typeof window !== "undefined") {
    user = localStorage.getItem("user");
    if (user) {
      let role = JSON.parse(user).role;
      user = JSON.parse(user);
      role === "admin" ? (isAdmin = true) : router.push("/");
    } else {
      router.push("/auth");
    }
  }
  useEffect(() => {
    if (existedPost) {
      const blocksFromHTML = convertFromHTML(
        existedPost.body ? existedPost.body : "<div></div>"
      );
      const state = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap
      );
      setInfo({ ...info, body: EditorState.createWithContent(state) });
    }

    user = localStorage.getItem("user");
    if (user) {
      let role = JSON.parse(user).role;
      user = JSON.parse(user);
      role === "admin" ? (isAdmin = true) : router.push("/");
    } else {
      router.push("/auth");
    }
  }, []);
  const createPost = async () => {
    try {
      if (info.title === "") return setError("Title is required!");
      setLoading(true);
      const formData = new FormData();
      formData.append("title", info.title);
      formData.append("tags", info.tags);
      formData.append("file", info.imgUrl);
      formData.append("readtime", info.readtime);
      const body = stateToHTML(info.body.getCurrentContent(), options);
      formData.append("body", body);
      let result = null;
      if (existedPost) {
        result = await axios.put(
          `${process.env.server}/post/${existedPost.id}`,
          formData,
          {
            headers: {
              authorization: "Bearer " + user.token,
            },
          }
        );
      } else {
        result = await axios.post(`${process.env.server}/post`, formData, {
          headers: {
            authorization: "Bearer " + user.token,
          },
        });
      }
      result &&
        setLoading(false) &
          setError(null) &
          setPostCreated(true) &
          setTimeout(() => {
            router.push("/admin/");
          }, 3000);
    } catch (err) {
      setLoading(false);
      console.log(err.message);
      setError(
        err.response
          ? err.response.data
          : "Something went wrong, please try again!"
      );
      if (err.response) {
        if (err.response.data === "jwt expired") {
          localStorage.clear();
          router.push("/");
        }
      }
    }
  };

  return (
    <div className="grid grid-center">
      <div
        className="container container-x"
        style={{ backgroundColor: "#fff" }}
      >
        <p className="title">Create post!</p>
        <TextField
          fullWidth
          id="standard-basic"
          label="Title"
          value={info.title}
          variant="outlined"
          name="title"
          onChange={handleChange}
        />
        <div className="flex mt-24">
          {/* <ImageUpload setImgUrl={setInfo} height="auto" width="auto" /> */}
          <ImageUpload
            height="120px"
            setImgUrl={setInfo}
            existedImg={info.imgUrl}
          />
          <div className="grid grid-gap-8 w-100 ml-8">
            <TextField
              value={info.tags}
              fullWidth
              id="standard-basic"
              label="Tags"
              variant="outlined"
              name="tags"
              sx={{ height: "max-content" }}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              value={info.readtime}
              id="standard-basic"
              sx={{ height: "max-content" }}
              label="Read time"
              variant="outlined"
              name="readtime"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="mt-16 mb-16" style={{ height: "500px" }}>
          <MyEditor
            editorState={info.body}
            onEditorChange={handleChange}
            loading={loading}
            height="500px"
          />
        </div>
        <div className="flex space-between">
          <Button
            variant="contained"
            color="danger"
            sx={{ marginBottom: "16px" }}
          >
            cancel
          </Button>
          <Button
            onClick={createPost}
            variant="contained"
            color="success"
            sx={{ marginBottom: "16px" }}
          >
            {existedPost ? "Edit post" : "Create blog"}
          </Button>
        </div>
        <div className="divider"></div>
        {existedPost && (
          <>
            <Typography
              sx={{ margin: "16px 0" }}
              color="text.secondary"
              variant="body2"
            >
              Additional
            </Typography>
            <div className="mt-16 mb-16">
              <Delete
                setLoading={setLoading}
                wheredelete="post"
                redirectTo="admin"
                fullWidth
                id={existedPost.id}
              />
            </div>
          </>
        )}
        {loading && <Backdrop loading={loading} />}
        {postCreated && (
          <Snackbar
            open={postCreated}
            setPostCreated={setPostCreated}
            message={
              existedPost
                ? "Post edited succesfully!"
                : "Post created succesfully!"
            }
            color="success"
          />
        )}
        {error && (
          <Snackbar
            open={error && true}
            setError={setError}
            message={error}
            color="error"
          />
        )}
      </div>
    </div>
  );
}
