import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/Post.module.css";
import Image from "next/image";
import wave from "../../public/images/wave.svg";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Button } from "@mui/material";
import Prism from "prismjs";
import { stateToHTML } from "draft-js-export-html";
import { convertFromRaw } from "draft-js";
import moment from "moment";
import Footer from "../../components/Footer";
import Card from "../../components/Card";
import options from "../../functions/editorOptions";

export default function Post({ post }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [relatedposts, setRelatedposts] = useState(null);
  const handleLikes = () => {
    setLiked((liked) => !liked);
    if (liked) {
      setLikes((likes) => likes - 1);
    } else {
      setLikes((likes) => likes + 1);
    }
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
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
          .then((result) => {})
          .catch((err) => console.log(err.response ? err.response.data : err));
    }
  };

  // const body = stateToHTML(convertFromRaw(post.body), options);

  useEffect(async () => {
    if (typeof window !== "undefined") {
      Prism.highlightAll();
    }
    try {
      const result = await axios.get(
        `${process.env.server}/post/relatedposts?limit=2?currentpost=${post.id}`
      );
      result && setRelatedposts(result.data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <div className={styles.postpage}>
      <div className={styles.waveBox}>
        <Image className={styles.wave} src={wave} layout="fill" />
      </div>
      <div className={styles.section}>
        <div className={styles.twoGrid}>
          <div className={styles.post}>
            <div className={styles.header}>
              <div className={styles.postInfo}>
                <h1 className={styles.title}>{post.title}</h1>
                <div
                  className="flex space-between"
                  style={{ marginBottom: "16px" }}
                >
                  <p className={`${styles.smallText} ${styles.secondary}`}>
                    {post.author} | {moment(post.createdAt).fromNow()}
                  </p>
                </div>
                <div className={styles.tags}>
                  {post.tags.map((tag, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      color="success"
                      sx={{ margin: "4px" }}
                      fontSize="small"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              <div className={styles.postImage}>
                <Image
                  src={
                    post.imgUrl ? `${process.env.server}/${post.imgUrl}` : "/"
                  }
                  layout="fill"
                  className={styles.image}
                />
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
              </div>
            </div>
            <div
              className={styles.body}
              dangerouslySetInnerHTML={{ __html: post.body }}
            ></div>
            <div className="divider my-8"></div>
            <div className={styles.readmore}>
              <p className="title">Related posts</p>
              <div className={styles.morePosts}>
                {relatedposts &&
                  relatedposts.map((post, index) => {
                    return <Card key={index} post={post} />;
                  })}
              </div>
            </div>
          </div>
          <div className={styles.additional}></div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export const getServerSideProps = async (context) => {
  try {
    const id = context.params.id;
    const post = await axios.get(`${process.env.server}/post/${id}`);
    if (post) {
      return {
        props: {
          post: post.data,
        },
      };
    }
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
