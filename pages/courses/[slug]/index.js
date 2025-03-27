import React, { useState, useEffect } from "react";
import styles from "../../../styles/Admin.module.css";
import { useRouter } from "next/router";
import useSWR from "swr";
import Link from "next/link";
import options from "../../../functions/editorOptions";
import { stateToHTML } from "draft-js-export-html";
import {
  ListItem,
  ListItemText,
  Typography,
  ListItemButton,
  ListItemIcon,
  MenuItem,
  Divider,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { TextField, Button } from "@mui/material";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import MyEditor from "../../../components/Editor";
import axios from "axios";
import Backdrop from "../../../components/Backdrop";

export default function Course({ lesson, serie, series }) {
  const router = useRouter();
  const [state, setState] = useState({
    piece: {
      title: serie?.title,
      position: serie?.position,
      body: serie?.body && stateToHTML(convertFromRaw(serie.body), options),
      serieId: serie?._id,
    },
    loading: false,
    length: lesson.blocks.length,
    loading: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    setState({
      ...state,
      piece: {
        title: serie?.title,
        body: serie?.body && stateToHTML(convertFromRaw(serie.body), options),
        serieId: serie?._id,
        position: serie?.position,
      },
    });
  }, [serie]);
  const handleMoving = (direction) => {
    const position = state.piece.position;
    if (direction === "previous") {
      if (position === 0) {
        router.push(`/`);
      } else {
        router.push(`/courses/${lesson.slug}/${series[position - 1]}`);
      }
    }
    if (direction === "next") {
      if (position === series.length - 1) {
        router.push(`/`);
      } else {
        router.push(`/courses/${lesson.slug}/${series[position + 1]}`);
      }
    }
  };
  if (!serie)
    return <div className="grid grid-center h-100">There is nothing</div>;
  return (
    <div className={styles.page}>
      <div className={styles.hornav}>
        <div className={`${styles.fixed}`}>
          {lesson?.blocks.map((block, blockIndex) => (
            <div key={blockIndex}>
              <ListItemButton
                sx={{
                  padding: "0px 8px",
                  textTransform: "uppercase",
                }}
                className="b-t-1 pt-8"
              >
                <div className="w-100" style={{ minHeight: "25.2px" }}>
                  <p className="fw-600 m-0 w-100">{`${block.title}`}</p>
                </div>
              </ListItemButton>
              {block.series.map(
                (serie, index) =>
                  serie && (
                    <Link
                      key={index}
                      href={`/courses/${lesson.slug}/${serie._id}`}
                    >
                      <ListItemButton
                        key={index}
                        onClick={() => setState({ ...state, create: "block" })}
                        sx={{
                          padding: "0px 8px",
                          backgroundColor:
                            serie._id === state.piece.serieId &&
                            "#757575 !important",
                          color:
                            serie._id === state.piece.serieId &&
                            "#fff !important",
                        }}
                      >
                        <ListItemText
                          sx={{ textTransform: "capitalize", margin: 0 }}
                          primary={`${serie.title}`}
                        />
                      </ListItemButton>
                    </Link>
                  )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.body}>
        <div className="flex">
          <Typography variant="h3">{state.piece.title}</Typography>
        </div>
        <div className="flex space-between my-16">
          <Button
            variant="contained"
            color="success"
            onClick={() => handleMoving("previous")}
          >
            {state.piece.position === 0 ? "Home" : "Previous"}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleMoving("next")}
          >
            {state.piece.position === series.length - 1 ? "Home" : "Next"}
          </Button>
        </div>
        <div
          style={{
            margin: "24px 0",
          }}
          dangerouslySetInnerHTML={{ __html: state.piece.body }}
        ></div>
        <div className="flex space-between my-16">
          <Button
            variant="contained"
            color="success"
            onClick={() => handleMoving("previous")}
          >
            {state.piece.position === 0 ? "Home" : "Previous"}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleMoving("next")}
          >
            {state.piece.position === series.length - 1 ? "Home" : "Next"}
          </Button>
        </div>
        {state.loading && <Backdrop loading={state.loading} />}
      </div>
      <div className={`${styles.rightSide} tablet-none`}>Rigth side</div>
      {error && (
        <Snackbar
          open={error}
          message={error}
          color="error"
          setOpen={setError}
        />
      )}
    </div>
  );
}

export const getServerSideProps = async (context) => {
  try {
    const { slug } = context.params;
    const lesson = await axios.get(`${process.env.server}/lesson/${slug}`);
    let serie,
      series = [],
      position = null;
    if (lesson.data?.blocks[0]?.series[0]) {
      serie = await axios.get(
        `${process.env.server}/serie/${lesson.data.blocks[0].series[0]._id}`
      );
      lesson.data.blocks.map((block) => {
        for (let i = 0; i < block.series.length; i++) {
          series.push(block.series[i]._id);
        }
      });
      for (let i = 0; i < series.length; i++) {
        if (series[i] === serie.data._id) {
          position = i;
        }
      }
    }

    if (lesson) {
      return {
        props: {
          lesson: lesson.data,
          serie: serie?.data ? { ...serie.data, position: position } : null,
          series: series,
        },
      };
    }
  } catch (err) {
    console.log(err.message);
    return {
      notFound: true,
    };
  }
};
