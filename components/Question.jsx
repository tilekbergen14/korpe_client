import React, { useState } from "react";
import styles from "../styles/PostComponent.module.css";
import Avatar from "@mui/material/Avatar";
import Link from "next/link";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";
import { Button } from "@mui/material";
import moment from "moment";

export default function Question({ question, mini }) {
  const [liked, setLiked] = useState(
    question.userLiked ? question.userLiked : false
  );
  const [likes, setLikes] = useState(question.likes ? question.likes : 0);

  const handleLikes = () => {
    setLiked((liked) => !liked);
    if (liked) {
      setLikes((likes) => likes - 1);
    } else {
      setLikes((likes) => likes + 1);
    }
    const user = JSON.parse(localStorage.getItem("user"));
    user.token &&
      axios
        .post(
          `${process.env.server}/question/like`,
          { id: question.id },
          {
            headers: {
              authorization: "Bearer " + user.token,
            },
          }
        )
        .then((result) => console.log(result))
        .catch((err) => console.log(err.response ? err.response.data : err));
  };
  if (mini)
    return (
      <div className={styles.post}>
        <div className="flex space-between">
          <p className={styles.createdAt}>
            {moment(question.createdAt).fromNow()}
          </p>{" "}
          <div className={styles.tags}>
            {question.tags.map((tag, index) => (
              <Link key={index} href={tag}>
                <p className={styles.tag}>#{tag}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.body}>
          <Link href={`/questions/${question._id}`}>
            <h2 className={styles.title}>{question.title}</h2>
          </Link>

          <div className={styles.footer}>
            <div className={styles.likes}>
              {liked ? (
                <FavoriteIcon
                  color="danger"
                  className="c-pointer"
                  fontSize="small"
                  sx={{ marginRight: "4px" }}
                  onClick={handleLikes}
                />
              ) : (
                <FavoriteBorderIcon
                  color="danger"
                  className="c-pointer"
                  fontSize="small"
                  sx={{ marginRight: "4px" }}
                  onClick={handleLikes}
                />
              )}
              <p className={styles.smallText}>
                {likes} {likes === 0 || likes === 1 ? "like" : "likes"}
              </p>
            </div>
            <Link href={`/questions/${question.id}`}>
              <Button variant="contained" color="info" size="small">
                Answer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.post}>
      <div className={styles.header}>
        <Avatar
          alt="avatar"
          src={question.authorProfile}
          className={styles.avatar}
        />
        <div>
          <p className={styles.name}>{question.author}</p>
          <p className={styles.createdAt}>
            {moment(question.createdAt).fromNow()}
          </p>
        </div>
      </div>
      <div className={styles.body}>
        <Link href={`/questions/${question.id}`}>
          <h2 className={styles.title}>{question.title}</h2>
        </Link>
        <div className={styles.tags}>
          {question.tags.map((tag, index) => (
            <Link key={index} href={tag}>
              <p className={styles.tag}>#{tag}</p>
            </Link>
          ))}
        </div>
        <div className={styles.footer}>
          <div className={styles.likes}>
            {liked ? (
              <FavoriteIcon
                color="danger"
                className="c-pointer"
                fontSize="small"
                sx={{ marginRight: "4px" }}
                onClick={handleLikes}
              />
            ) : (
              <FavoriteBorderIcon
                color="danger"
                className="c-pointer"
                fontSize="small"
                sx={{ marginRight: "4px" }}
                onClick={handleLikes}
              />
            )}
            <p className={styles.smallText}>
              {likes} {likes === 0 || likes === 1 ? "like" : "likes"}
            </p>
          </div>
          <Link href={`/questions/${question.id}`}>
            <Button variant="contained" color="info" size="small">
              Answer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
