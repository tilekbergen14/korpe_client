import React, { useState } from "react";
import styles from "../../../styles/Admin.module.css";
import { useRouter } from "next/router";
import useSWR from "swr";
import Delete from "../../../components/Delete";
import Switch from "@mui/material/Switch";
import MenuIcon from "@mui/icons-material/Menu";
import {
  ListItem,
  ListItemText,
  Typography,
  ListItemButton,
  ListItemIcon,
  MenuItem,
  Divider,
  InputAdornment,
} from "@mui/material";
import Link from "next/link";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { TextField, Button } from "@mui/material";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import MyEditor from "../../../components/Editor";
import axios from "axios";
import Backdrop from "../../../components/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import ImageUpload from "../../../components/ImageUpload";

export default function index({ lesson }) {
  const router = useRouter();
  const [openHB, setOpenHB] = useState(false);
  const [state, setState] = useState({
    navState: "Dashboard",
    piece: {
      title: "",
      position: 1,
      body: EditorState.createEmpty(),
      serieId: null,
      blockTitle: "",
      blockPosition: 1,
      blockId: null,
    },
    loading: false,
    create: "nothing",
    length: lesson.blocks.length,
    loading: false,
  });
  const [details, setDetails] = useState({
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    price: lesson.price,
    imgUrl: lesson.imgUrl,
    published: lesson.published,
    edited: false,
  });
  const [editDetails, setEditDetails] = useState({
    slug: false,
    title: false,
    description: false,
    price: false,
    imgUrl: false,
  });
  const handleLessonChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
    if (!details.edited) {
      setDetails({ ...details, edited: true });
    }
  };
  const cancelChanges = () => {
    setDetails({
      ...lesson,
      edited: false,
    });
  };
  const [error, setError] = useState(null);
  const [loadingPiece, setLoadingPiece] = useState(false);

  const { data, err } = useSWR("user", async () => {
    try {
      if (typeof window !== "undefined") {
        let user = localStorage.getItem("user");
        if (user) {
          let role = JSON.parse(user).role;
          return role;
        } else {
          router.push("/auth");
        }
      }
    } catch (err) {
      return err.message;
    }
  });

  if (err || data !== "admin")
    return <div>Sorry you don't have permission</div>;
  if (!data) return <div>Loading...</div>;

  const handleChange = (e) => {
    if (e.target) {
      setState({
        ...state,
        piece: { ...state.piece, [e.target.name]: e.target.value },
      });
    } else {
      setState({ ...state, piece: { ...state.piece, body: e } });
    }
  };
  const handlePieceCreate = async (e) => {
    e.preventDefault();

    try {
      setState({ ...state, loading: true });
      const user = JSON.parse(localStorage.getItem("user"));
      const result = await axios.post(
        `${process.env.server}/serie`,
        {
          title: state.piece.title,
          position: state.piece.position,
          body: convertToRaw(state.piece.body.getCurrentContent()),
          blockId: state.piece.blockId,
        },
        {
          headers: {
            authorization: "Bearer " + user.token,
          },
        }
      );
      if (result) {
        router.replace(router.asPath);
        setState({ ...state, loading: false });
      }
    } catch (err) {
      setState({ ...state, loading: false });
      console.log(err);
    }
  };

  const handleEditLessonDetails = async () => {
    const formData = new FormData();
    const user = JSON.parse(localStorage.getItem("user"));
    formData.append("title", details.title);
    formData.append("slug", details.slug);
    formData.append("description", details.description);
    formData.append("file", details.imgUrl);
    formData.append("price", details.price);
    formData.append("published", details.published);
    setState({ ...state, loading: true });
    try {
      const result = await axios.put(
        `${process.env.server}/lesson/${lesson._id}`,
        formData,
        {
          headers: {
            authorization: "Bearer " + user.token,
          },
        }
      );
      if (result) {
        router.reload(router.asPath);
        setState({ ...state, loading: false });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleBlockCreate = async (e) => {
    e.preventDefault();
    try {
      setState({ ...state, loading: true });
      let result;
      const user = JSON.parse(localStorage.getItem("user"));
      if (!state.piece.blockId) {
        result = await axios.post(
          `${process.env.server}/block`,
          {
            lessonId: lesson._id,
            blockTitle: state.piece.blockTitle,
            position: state.piece.blockPosition,
          },
          {
            headers: {
              authorization: "Bearer " + user.token,
            },
          }
        );
      } else {
        result = await axios.put(
          `${process.env.server}/block`,
          {
            lessonId: lesson._id,
            blockTitle: state.piece.blockTitle,
            position: state.piece.blockPosition,
            blockId: state.piece.blockId,
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
        setState({ ...state, loading: false });
      }
    } catch (err) {
      setState({
        ...state,
        error: err.response
          ? err.response.data
          : "Something absolutely went wrong!",
      });
      setState({ ...state, loading: false });
    }
  };
  const handleSerie = async (serie, index, block, blockIndex) => {
    if (serie._id !== state.piece.serieId) {
      setLoadingPiece(true);
      try {
        const { data } = await axios.get(
          `${process.env.server}/serie/${serie._id}`
        );
        setState({
          ...state,
          create: "serie",
          piece: {
            ...state.piece,
            title: serie.title,
            blockId: block._id,
            blockTitle: block.title,
            position: index + 1,
            serieId: serie._id,
            body:
              data.body &&
              EditorState.createWithContent(convertFromRaw(data.body)),
          },
        });
        setLoadingPiece(false);
      } catch (error) {
        console.log(error);
        setLoadingPiece(false);
      }
    }
  };
  const handleBlock = (block, index) => {
    setState({
      ...state,
      create: "block",
      piece: {
        ...state.piece,
        blockId: block._id,
        blockTitle: block.title,
        blockPosition: index + 1,
      },
    });
  };
  const IconHandle = (block, index) => {
    setState({
      ...state,
      create: "serie",
      piece: {
        ...state.piece,
        title: "",
        blockId: block._id,
        position: block.series.length + 1,
        serieId: null,
        body: EditorState.createEmpty(),
      },
    });
  };
  return (
    <div className={styles.page}>
      <div className={`${styles.navbar2} flex align-center space-between`}>
        <MenuIcon
          color="success"
          className="c-pointer"
          onClick={() => setOpenHB(!openHB)}
        />
        <Typography variant="h6" sx={{ fontWeight: "800", color: "#406343" }}>
          {lesson.title}
        </Typography>
      </div>
      <div className="flex flex-1">
        <div className={`${styles.hornav} tablet-none`}>
          <div className={styles.fixed}>
            <div className="m-8 grid grid-gap-8 grid-2-column">
              <Button
                variant="contained"
                color="success"
                onClick={() =>
                  setState({
                    ...state,
                    create: "nothing",
                  })
                }
              >
                Details
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() =>
                  setState({
                    ...state,
                    create: "block",
                    piece: {
                      ...state.piece,
                      blockId: null,
                      blockTitle: "",
                      blockPosition: state.length + 1,
                    },
                  })
                }
              >
                New block
              </Button>
            </div>
            {lesson?.blocks.map((block, blockIndex) => (
              <div key={blockIndex}>
                <ListItemButton
                  sx={{
                    padding: "0px 8px",
                    textTransform: "uppercase",
                  }}
                  className="b-t-1"
                >
                  <div
                    className="w-100"
                    style={{ minHeight: "25.2px" }}
                    onClick={() => handleBlock(block, blockIndex)}
                  >
                    <p className="fw-600 m-0 w-100">{`${block.title}`}</p>
                  </div>
                  <ListItemIcon sx={{ margin: 0, minWidth: "auto" }}>
                    <AddCircleIcon
                      sx={{ margin: 0, color: "#01579b" }}
                      className="c-pointer"
                      onClick={() => IconHandle(block, index)}
                    />
                  </ListItemIcon>
                </ListItemButton>
                {block.series.map(
                  (serie, index) =>
                    serie && (
                      <ListItemButton
                        key={index}
                        onClick={() => setState({ ...state, create: "block" })}
                        sx={{ padding: "0px 8px", zIndex: "100" }}
                        onClick={() =>
                          handleSerie(serie, index, block, blockIndex)
                        }
                      >
                        <ListItemText
                          sx={{ textTransform: "capitalize", margin: 0 }}
                          primary={`${serie.title}`}
                        />
                      </ListItemButton>
                    )
                )}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.body}>
          {state.create === "block" ? (
            <form>
              <TextField
                fullWidth
                id="standard-basic"
                label="Title"
                variant="outlined"
                margin="dense"
                name="blockTitle"
                value={state.piece.blockTitle}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                id="standard-basic"
                label="Position"
                variant="outlined"
                margin="dense"
                value={state.piece.blockPosition}
                name="blockPosition"
                onChange={handleChange}
              />
              <div className="flex space-between my-16">
                <Button variant="contained" color="secondary">
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color={state.piece.blockId ? "success" : "info"}
                  onClick={handleBlockCreate}
                  type="submit"
                >
                  {state.piece.blockId ? "Edit" : "Create"}
                </Button>
              </div>
              {state.piece.blockId !== null && (
                <div className="w-100 mt-16">
                  <Divider />
                  <Typography
                    sx={{ margin: "16px 0" }}
                    color="text.secondary"
                    variant="body2"
                  >
                    Additional
                  </Typography>

                  <div className="my-16">
                    <Delete
                      setLoading={setState}
                      wheredelete="lesson"
                      fullWidth
                      id={lesson._id}
                      additional={`blockId=${state.piece.blockId}`}
                    />
                  </div>
                </div>
              )}
            </form>
          ) : state.create === "serie" && !loadingPiece ? (
            <form>
              <div className="flex">
                <TextField
                  required
                  fullWidth
                  id="standard-basic"
                  label="Title"
                  variant="outlined"
                  margin="dense"
                  name="title"
                  onChange={handleChange}
                  value={state.piece.title}
                />
                <TextField
                  fullWidth
                  id="standard-basic"
                  label="Position"
                  variant="outlined"
                  margin="dense"
                  name="position"
                  onChange={handleChange}
                  sx={{ width: "20%", marginLeft: 2 }}
                  value={state.piece.position}
                />
              </div>
              <div
                style={{
                  height: "500px",
                  backgroundColor: "#fff",
                  margin: "24px 0",
                }}
              >
                <MyEditor
                  editorState={state.piece.body}
                  onEditorChange={handleChange}
                  loading={state.loading}
                  height="500px"
                />
              </div>
              <div className="flex space-between">
                <Button variant="contained" color="secondary">
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color={state.piece.serieId ? "success" : "info"}
                  onClick={handlePieceCreate}
                  type="submit"
                >
                  {state.piece.serieId ? "Edit" : "Create"}
                </Button>
              </div>
              <div className="w-100 mt-16">
                <Divider />
                <Typography
                  sx={{ margin: "16px 0" }}
                  color="text.secondary"
                  variant="body2"
                >
                  Additional
                </Typography>
                <div className="flex space-between">
                  <TextField
                    fullWidth
                    id="standard-basic"
                    label="Block"
                    variant="outlined"
                    name="blockId"
                    select
                    value={state.piece.blockId}
                    onChange={handleChange}
                  >
                    {lesson?.blocks.map((block) => (
                      <MenuItem key={block._id} value={block._id}>
                        {block.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </div>

                <div className="my-16">
                  {state.piece.serieId && (
                    <Delete
                      setLoading={setState}
                      wheredelete="block"
                      fullWidth
                      id={state.piece.blockId}
                      additional={`serieId=${state.piece.serieId}`}
                    />
                  )}
                </div>
              </div>
            </form>
          ) : state.create === "nothing" ? (
            <div className="">
              <p id="aboutyou" className="title" style={{ margin: "0" }}>
                Details
              </p>
              <div className="flex space-between align-center mt-8">
                <p style={{ margin: "0" }}>Published</p>
                <Switch
                  onChange={(e) => {
                    setDetails({
                      ...details,
                      published: e.target.checked,
                      edited: true,
                    });
                  }}
                  color="info"
                  checked={details.published}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </div>
              <div className={styles.details}>
                <ImageUpload
                  height="100%"
                  width="100%"
                  margin="0"
                  setImgUrl={setDetails}
                  existedImg={details.imgUrl}
                />
                <div className="grid grid-gap-16 grid-center">
                  <TextField
                    size="small"
                    name="title"
                    label="Title"
                    variant="outlined"
                    fullWidth
                    onChange={handleLessonChange}
                    value={details.title}
                    disabled={!editDetails.title}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="text"
                            color={editDetails.title ? "success" : "info"}
                            onClick={() =>
                              setEditDetails({
                                ...editDetails,
                                title: !editDetails.title,
                              })
                            }
                          >
                            {editDetails.title ? "Save" : "Edit"}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    size="small"
                    name="slug"
                    label="Slug"
                    variant="outlined"
                    fullWidth
                    onChange={handleLessonChange}
                    value={details.slug}
                    disabled={!editDetails.slug}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="text"
                            color={editDetails.slug ? "success" : "info"}
                            onClick={() =>
                              setEditDetails({
                                ...editDetails,
                                slug: !editDetails.slug,
                              })
                            }
                          >
                            {editDetails.slug ? "Save" : "Edit"}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    size="small"
                    label="Price"
                    name="price"
                    variant="outlined"
                    fullWidth
                    onChange={handleLessonChange}
                    value={details.price}
                    disabled={!editDetails.price}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="text"
                            color={editDetails.price ? "success" : "info"}
                            onClick={() =>
                              setEditDetails({
                                ...editDetails,
                                price: !editDetails.price,
                              })
                            }
                          >
                            {editDetails.price ? "Save" : "Edit"}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    size="small"
                    label="Description"
                    variant="outlined"
                    fullWidth
                    name="description"
                    onChange={handleLessonChange}
                    value={details.description}
                    disabled={!editDetails.description}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="text"
                            color={editDetails.description ? "success" : "info"}
                            onClick={() =>
                              setEditDetails({
                                ...editDetails,
                                description: !editDetails.description,
                              })
                            }
                          >
                            {editDetails.description ? "Save" : "Edit"}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </div>
              <div className="flex space-between mb-16">
                <Button
                  size="small"
                  variant="contained"
                  color="danger"
                  disabled={!details.edited}
                  onClick={cancelChanges}
                >
                  Cancel changes
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  disabled={!details.edited}
                  onClick={handleEditLessonDetails}
                >
                  Save Changes
                </Button>
              </div>
              <p id="aboutyou" className="title" style={{ margin: "0" }}>
                Danger zone
              </p>
              <p>
                Do you want to delete this lesson?{" "}
                <Delete
                  variant="p"
                  wheredelete="lesson"
                  id={lesson._id}
                  lessonDelete={true}
                />
              </p>
            </div>
          ) : (
            <div className="h-100 flex justify-center align-center">
              <CircularProgress />
            </div>
          )}
          {state.loading && <Backdrop loading={state.loading} />}
        </div>
        {error && (
          <Snackbar
            open={error}
            message={error}
            color="error"
            setOpen={setError}
          />
        )}
      </div>
      {openHB && (
        <div className={`${styles.tabletHornav} `}>
          <div className={styles.fixed}>
            <div className="m-8 grid grid-gap-8 grid-2-column">
              <Button
                variant="contained"
                color="success"
                onClick={() =>
                  setState({
                    ...state,
                    create: "nothing",
                  })
                }
              >
                Details
              </Button>
              <Button
                variant="contained"
                color="info"
                onClick={() =>
                  setState({
                    ...state,
                    create: "block",
                    piece: {
                      ...state.piece,
                      blockId: null,
                      blockTitle: "",
                      blockPosition: state.length + 1,
                    },
                  })
                }
              >
                New block
              </Button>
            </div>
            {lesson?.blocks.map((block, blockIndex) => (
              <div key={blockIndex}>
                <ListItemButton
                  sx={{
                    padding: "0px 8px",
                    textTransform: "uppercase",
                  }}
                  className="b-t-1"
                >
                  <div
                    className="w-100"
                    style={{ minHeight: "25.2px" }}
                    onClick={() => handleBlock(block, blockIndex)}
                  >
                    <p className="fw-600 m-0 w-100">{`${block.title}`}</p>
                  </div>
                  <ListItemIcon sx={{ margin: 0, minWidth: "auto" }}>
                    <AddCircleIcon
                      sx={{ margin: 0, color: "#01579b" }}
                      className="c-pointer"
                      onClick={() => IconHandle(block, index)}
                    />
                  </ListItemIcon>
                </ListItemButton>
                {block.series.map(
                  (serie, index) =>
                    serie && (
                      <ListItemButton
                        key={index}
                        onClick={() => setState({ ...state, create: "block" })}
                        sx={{ padding: "0px 8px", zIndex: "100" }}
                        onClick={() =>
                          handleSerie(serie, index, block, blockIndex)
                        }
                      >
                        <ListItemText
                          sx={{ textTransform: "capitalize", margin: 0 }}
                          primary={`${serie.title}`}
                        />
                      </ListItemButton>
                    )
                )}
              </div>
            ))}
          </div>
          <div
            onClick={() => setOpenHB(!openHB)}
            className="flex-1 h-100"
          ></div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = async (context) => {
  try {
    const slug = context.params.slug;
    const lesson = await axios.get(`${process.env.server}/lesson/${slug}`);

    if (lesson) {
      return {
        props: {
          lesson: lesson.data,
        },
      };
    }
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
