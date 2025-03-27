import React, { useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { useRouter } from "next/router";

export default function VerifyEmail({ user }) {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      user && localStorage.setItem("user", JSON.stringify(user));
      router.push("/");
    }
  }, []);
  return (
    <div className="flex flex-column justify-center align-center h-100">
      <p>Once we are verified you will be directed to the homepage!</p>
      <CircularProgress />
    </div>
  );
}

export const getServerSideProps = async (context) => {
  try {
    const token = context.params.token;
    const user = await axios.get(`${process.env.server}/verify/email/${token}`);
    if (user) {
      return {
        props: {
          user: user.data,
        },
      };
    }
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
