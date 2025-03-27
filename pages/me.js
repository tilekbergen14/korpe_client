import React, { useRef, useState, useEffect } from "react";
import styles from "../styles/Me.module.css";
import TextField from "@mui/material/TextField";
import Question from "../components/Question";
import {
  InputAdornment,
  Button,
  ListItem,
  ListItemText,
  List,
  Typography,
  CircularProgress,
} from "@mui/material";
import Image from "next/image";
import useSWR from "swr";
import axios from "axios";
import Skeleton from "../components/Skeleton";
import Snackbar from "../components/Snackbar";
import Profiler from "../components/Profiler";
import Backdrop from "../components/Backdrop";
import { useRouter } from "next/router";
import MenuIcon from "@mui/icons-material/Menu";

export default function me() {
  const [showProfiler, setShowProfiler] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [info, setInfo] = useState(null);
  const [openHB, setOpenHB] = useState(false);
  const [menu, setMenu] = useState("information");
  const [readOnly, setReadOnly] = useState({
    username: true,
    email: true,
    password: true,
  });
  const [initialData, setInitialData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const router = useRouter();
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    !user && router.push("/auth");
  }
  const handleChange = async (e) => {
    try {
      if (e.target) {
        setInfo({
          ...info,
          [e.target.name]: e.target.value,
        });
        setInitialData({
          ...initialData,
          [e.target.name]: e.target.value,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleMenu = async (e) => {
    if (e === "courses") {
      () => setMenu("posts");
    }
    if (e === "questions") {
      try {
        setMenu("questions");
        const { data } = await axios.get(
          `${process.env.server}/question/getuserquestions/${localUser.id}`
        );
        setQuestions(data);
      } catch (err) {
        console.log(err);
      }
    }
  };
  let { data, error } = useSWR(
    `${process.env.server}/user/${localUser?.id}`,
    async (key) => {
      return await axios.get(key);
    }
  );
  useEffect(() => {
    if (data) {
      setInitialData({
        username: data.data.username,
        email: data.data.email,
        password: "",
      });
    }
    setLocalUser(JSON.parse(localStorage.getItem("user")));
  }, [data]);

  const handleLogout = () => {
    localStorage.clear();
    router.reload();
  };

  const handleUpdate = async (e) => {
    setReadOnly((readOnly) => {
      return {
        ...readOnly,
        update: true,
        [e]: !readOnly[e],
      };
    });
  };

  const saveChangesToServer = async () => {
    try {
      setLoading(true);
      const result = await axios.put(`${process.env.server}/user`, info, {
        headers: {
          authorization: "Bearer " + localUser.token,
        },
      });
      setLoading(false);
      setUpdated(true);
      setInfo(null);
      router.replace(router.asPath);
      setReadOnly({
        username: true,
        email: true,
        password: true,
      });
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };
  return (
    <div className={styles.mepage}>
      <div className={`${styles.navbar2} flex align-center space-between`}>
        <MenuIcon
          color="success"
          className="c-pointer"
          onClick={() => setOpenHB(!openHB)}
        />
        <Typography variant="h6" sx={{ fontWeight: "800", color: "#406343" }}>
          Hello
        </Typography>
      </div>
      <div className="flex">
        <div className={`${styles.hornav}`}>
          <List style={{ paddingTop: 0 }}>
            <ListItem
              selected={menu === "information"}
              button
              onClick={() => setMenu("information")}
            >
              <ListItemText primary="Information" />
            </ListItem>
            <ListItem
              selected={menu === "questions"}
              button
              onClick={() => handleMenu("questions")}
            >
              <ListItemText primary="My questions" />
            </ListItem>
            <ListItem
              selected={menu === "courses"}
              button
              onClick={() => handleMenu("courses")}
            >
              <ListItemText primary="My courses" />
            </ListItem>
          </List>
          <div className="p-16">
            <Button
              variant="contained"
              fullWidth
              color={localUser ? "danger" : "success"}
              onClick={
                localUser
                  ? handleLogout
                  : () => {
                      router.push("/auth");
                    }
              }
            >
              {localUser ? "Log out" : "Sign up"}
            </Button>
          </div>
        </div>
        <div className={styles.content}>
          {menu === "information" && (
            <div>
              <p id="aboutyou" className="title" style={{ margin: "0" }}>
                Information
              </p>
              {showProfiler && (
                <Profiler setShowProfiler={setShowProfiler} setInfo={setInfo} />
              )}
              <div className={styles.information}>
                {data ? (
                  <div className="flex">
                    <div
                      onClick={() => setShowProfiler(true)}
                      style={{
                        aspectRatio: "1/1",
                        margin: "16px 8px 0 0",
                      }}
                      className={`${styles.imgUploadBox} c-pointer imgUploadBox flex justify-center align-center`}
                    >
                      {data?.data?.profile || info?.profileImg ? (
                        <Image
                          src={
                            info?.profileImg
                              ? info.profileImg
                              : data.data.profile
                          }
                          layout="fill"
                          className={styles.image}
                        />
                      ) : (
                        "Choose profile"
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`${styles.imgUploadBox} `}
                    style={{
                      aspectRatio: "1/1",
                      margin: "0",
                      marginRight: "8px",
                    }}
                  >
                    <Skeleton width="100%" height="100%" aspectRatio="1/1" />
                  </div>
                )}
                <div style={{ width: "100%" }}>
                  {data ? (
                    <TextField
                      id="standard-basic"
                      label="Name"
                      variant="standard"
                      value={initialData.username}
                      margin="normal"
                      fullWidth
                      name="username"
                      onChange={handleChange}
                      variant="outlined"
                      InputProps={{
                        readOnly: readOnly.username,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              size="small"
                              variant="contained"
                              color={readOnly.username ? "secondary" : "info"}
                              onClick={() => handleUpdate("username")}
                            >
                              {readOnly.username ? "Edit" : "Save"}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                  ) : (
                    <Skeleton height="61px" width="100%" />
                  )}
                  {data ? (
                    <TextField
                      fullWidth
                      name="email"
                      id="standard-basic"
                      label="Email"
                      variant="outlined"
                      margin="normal"
                      onChange={handleChange}
                      value={initialData.email}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              size="small"
                              variant="contained"
                              color={readOnly.email ? "secondary" : "info"}
                              onClick={() => handleUpdate("email")}
                            >
                              {readOnly.email ? "Edit" : "Save"}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                  ) : (
                    <Skeleton height="61px" width="100%" />
                  )}
                  {data ? (
                    <TextField
                      id="standard-basic"
                      variant="outlined"
                      name="password"
                      label="Change password"
                      margin="normal"
                      onChange={handleChange}
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              size="small"
                              variant="contained"
                              color={readOnly.password ? "secondary" : "info"}
                              onClick={() => handleUpdate("password")}
                            >
                              {readOnly.password ? "Edit" : "Save"}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                  ) : (
                    <Skeleton height="61px" width="100%" />
                  )}
                </div>
                {updated && (
                  <Snackbar
                    open={updated}
                    message="Updated successfully!"
                    color="success"
                    setOpen={setUpdated}
                  />
                )}
                {loading && <Backdrop loading={loading} />}
              </div>
              <div className="flex space-between mt-16">
                <Button
                  variant="contained"
                  disabled={info === null}
                  color="info"
                  onClick={() => {
                    setInfo(null);
                    setReadOnly({
                      username: true,
                      email: true,
                      password: true,
                    });
                    setInitialData({
                      username: data.data.username,
                      email: data.data.email,
                      email,
                    });
                  }}
                >
                  Discard Changes
                </Button>
                <Button
                  variant="contained"
                  sx={{ widht: "max-content" }}
                  color="success"
                  onClick={saveChangesToServer}
                  disabled={info === null ? true : false}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
          {menu === "posts" && (
            <>
              <p id="aboutyou" className="title" style={{ margin: "0" }}>
                Posts
              </p>
            </>
          )}
          {menu === "questions" && (
            <div className="h-100">
              <p
                className="title"
                style={{ margin: "0", maxHeight: "max-content" }}
              >
                Questions
              </p>
              {questions ? (
                questions.length === 0 ? (
                  <div className="h-100 grid grid-center">
                    There is no questions yet
                  </div>
                ) : (
                  <div className="grid grid-gap-8 mt-8">
                    {questions.map((question, index) => (
                      <Question key={index} question={question} mini={true} />
                    ))}
                  </div>
                )
              ) : (
                <CircularProgress />
              )}
            </div>
          )}
        </div>
      </div>
      {openHB && (
        <div className={`${styles.tabletHornav} `}>
          <div className={`${styles.fixed}`}>
            <div className={`flex flex-column space-between h-100`}>
              <List style={{ paddingTop: 0 }}>
                <ListItem
                  selected={menu === "information"}
                  button
                  onClick={() => {
                    setMenu("information");
                    setOpenHB(false);
                  }}
                >
                  <ListItemText primary="Information" />
                </ListItem>
                <ListItem
                  selected={menu === "questions"}
                  button
                  onClick={() => {
                    handleMenu("questions"), setOpenHB(false);
                  }}
                >
                  <ListItemText primary="My questions" />
                </ListItem>
                <ListItem
                  selected={menu === "courses"}
                  button
                  onClick={() => {
                    handleMenu("courses"), setOpenHB(false);
                  }}
                >
                  <ListItemText primary="My courses" />
                </ListItem>
              </List>
              <div className="p-16">
                <Button
                  variant="contained"
                  fullWidth
                  color={localUser ? "danger" : "success"}
                  onClick={
                    localUser
                      ? handleLogout
                      : () => {
                          router.push("/auth");
                        }
                  }
                >
                  {localUser ? "Log out" : "Sign up"}
                </Button>
              </div>
            </div>
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
