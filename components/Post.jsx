import React, { useState } from "react";
import styles from "../styles/PostComponent.module.css";
import Avatar from "@mui/material/Avatar";
import Link from "next/link";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";
import moment from "moment";

export default function Post({ post }) {
  const [liked, setLiked] = useState(post.userLiked ? post.userLiked : false);
  const [likes, setLikes] = useState(post.likes ? post.likes : 0);

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
          `${process.env.server}/post/like`,
          { id: post.id },
          {
            headers: {
              authorization: "Bearer " + user.token,
            },
          }
        )
        .then((result) => console.log(result))
        .catch((err) => console.log(err.response ? err.response.data : err));
  };

  return (
    <div className={styles.post}>
      <div className={styles.header}>
        <Avatar
          alt="avatar"
          src={post.authorProfile}
          className={styles.avatar}
        />
        <div>
          <p className={styles.name}>{post.author}</p>
          <p className={styles.createdAt}>{moment(post.createdAt).fromNow()}</p>
        </div>
      </div>
      <div className={styles.body}>
        <Link href={`/posts/${post.id}`}>
          <h2 className={styles.title}>{post.title}</h2>
        </Link>
        <div className={styles.tags}>
          {post.tags.map((tag, index) => (
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
          {post.readtime && (
            <p className={styles.smallText}>
              <span className={styles.successText}>Readtime: </span>
              {post.readtime}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
