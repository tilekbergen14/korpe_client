import React, { useState } from "react";
import axios from "axios";
import styles from "../../styles/Posts.module.css";
import Post from "../../components/Post";
import { Button, CircularProgress } from "@mui/material";
import Image from "next/image";
import adbox from "../../public/images/adbox.png";
import Languages from "../../components/Links";
import { useRouter } from "next/router";

export default function posts(props) {
  const [loadmore, setLoadmore] = useState(false);
  const [posts, setPosts] = useState(props.posts);
  const [category, setCategory] = useState("latest");
  const router = useRouter();

  const handleLoadMore = async () => {
    try {
      setLoadmore(true);
      let newposts;
      if (category === "latest") {
        const { data } = await axios.get(
          `${process.env.server}/post?offset=${posts.length}`
        );
        newposts = data;
      }
      if (category === "top") {
      }
      setPosts([...posts, ...newposts]);
      setLoadmore(false);
    } catch (err) {
      setLoadmore(false);
    }
  };

  const handleCategory = async (e) => {
    if (e === "latest") {
      setCategory("latest");
      setPosts(props.posts);
    }
    if (e === "top") {
      setCategory("top");
      const { data } = await axios.get(
        `${process.env.server}/post?category=top&limit=20`
      );
      setPosts(data);
    }
  };

  return (
    <div className={styles.postsPage}>
      <div className={styles.first}>
        <Languages />
      </div>
      <div className={styles.second}>
        <div className="flex">
          <Button
            variant="text"
            onClick={() => handleCategory("latest")}
            color={category === "latest" ? "info" : "primary"}
            sx={{ textTransform: "none" }}
          >
            Latest
          </Button>
          <Button
            variant="text"
            onClick={() => handleCategory("top")}
            color={category === "top" ? "info" : "primary"}
            sx={{ textTransform: "none" }}
          >
            Top
          </Button>
        </div>
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
        <div className="flex justify-center m-8">
          {loadmore ? (
            <CircularProgress color="inherit" />
          ) : (
            <p
              className="c-pointer m-0 smallTitle"
              onClick={() => {
                handleLoadMore();
              }}
            >
              Load more
            </p>
          )}
        </div>
      </div>
      <div className={styles.third}>
        <Image src={adbox} layout="fill" className="b-radius-8" />
      </div>
    </div>
  );
}

export const getStaticProps = async () => {
  try {
    const posts = await axios.get(`${process.env.server}/post?limit=20`);
    return {
      props: { posts: posts.data ? posts.data : [] },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
