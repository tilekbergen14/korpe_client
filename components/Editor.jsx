import React, { Component } from "react";
import { convertToRaw } from "draft-js";
import styles from "../styles/Editor.module.css";
import "../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import axios from "axios";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

export default class ControlledEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      server: process.env.server,
      images: [],
    };
  }

  onEditorStateChange = (editorState) => {
    this.props.onEditorChange(editorState);
  };

  imageUpload = async (e) => {
    try {
      const formData = new FormData();
      formData.append("file", e);
      const { data } = await axios.post(`${this.state.server}/image`, formData);
      this.setState({
        images: [...this.state.images, `${this.state.server}/${data.imageUrl}`],
      });
      return { data: { link: `${this.state.server}/${data.imageUrl}` } };
    } catch (err) {
      console.log(err);
    }
  };

  clickHandler = () => {
    const currentContentState = convertToRaw(
      this.props.editorState.getCurrentContent()
    );

    const images = [];

    let i = 0;
    while (currentContentState.entityMap[i]) {
      if (currentContentState.entityMap[i].type === "IMAGE") {
        images.push(currentContentState.entityMap[i].data.src);
      }
      i++;
    }

    let j = 0;
    while (this.state.images[j]) {
      if (!images.includes(this.state.images[j])) {
        axios
          .delete(this.state.images[j])
          .then((result) => {})
          .catch((err) => console.log(err));
      }
      j++;
    }
  };

  render() {
    const { editorState } = this.props;
    this.props.loading && this.clickHandler();

    return (
      <>
        <Editor
          editorState={editorState}
          toolbarClassName={styles.toolbar}
          wrapperClassName={styles.wrapper}
          wrapperStyle={{
            height: this.props?.height ? this.props.height : "auto",
          }}
          editorClassName={styles.editor}
          onEditorStateChange={this.onEditorStateChange}
          toolbar={{
            options: this.props.toolbar
              ? this.props.toolbar
              : [
                  "inline",
                  "blockType",
                  "fontSize",
                  "fontFamily",
                  "list",
                  "textAlign",
                  "colorPicker",
                  "link",
                  "embedded",
                  "emoji",
                  "image",
                  "remove",
                  "history",
                ],
            blockType: {
              className: "blocktype",
              options: this.props.blockType
                ? this.props.blockType
                : [
                    "Normal",
                    "H1",
                    "H2",
                    "H3",
                    "H4",
                    "H5",
                    "H6",
                    "Blockquote",
                    "Code",
                  ],
            },
            image: {
              defaultSize: {
                width: "100%",
              },
              uploadCallback: this.imageUpload,
            },
          }}
        />
      </>
    );
  }
}
