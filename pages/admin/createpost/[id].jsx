import React from "react";
import CreatePost from "../../../components/modal/CreatePost";
import axios from "axios";

export default function Post({ post }) {
  return <CreatePost existedPost={post} />;
}

export const getServerSideProps = async (context) => {
  try {
    const postId = context.params.id;
    const post = await axios.get(`${process.env.server}/post/${postId}`);
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
