import styles from "../styles/Home.module.css";
import Image from "next/image";
import axios from "axios";
import adbox from "/public/images/pillow.jpg";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { padding } from "@mui/system";
import { useState } from "react";
import Link from "next/link";

export default function Home({ posts, questions }) {
  const [list, setList] = useState([
    {
      name: "Шикізат",
      link: "/materials",
    },
    {
      name: "Маталар",
      link: "/items",
    },
    {
      name: "Қызметтер",
      link: "/services",
    },
    {
      name: "Қаптар",
      link: "/cases",
    },
  ]);
  return (
    <div className={styles.homepage} style={{ height: "100%" }}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flex: 1, position: "relative", height: "100%" }}>
          <Image src={adbox} layout="fill" />
        </div>
        <div style={{ flex: 1, padding: "16px" }}>
          <List
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              borderRadius: "16px",
              padding: "16px",
            }}
          >
            {list.map((value) => (
              <ListItem key={value}>
                <Link href={value.link}>
                  <ListItemText
                    primary={`${value.name}`}
                    style={{ cursor: "pointer" }}
                  />
                </Link>
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps = async () => {
  try {
    const posts = await axios.get(`${process.env.server}/post`);
    const questions = await axios.get(`${process.env.server}/question`);
    return {
      props: {
        posts: posts.data ? posts.data : [],
        questions: questions.data ? questions.data : [],
      },
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
