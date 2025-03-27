import React from "react";
import { Button } from "@mui/material";

export default function Languages() {
  return (
    <div style={styles.box}>
      <h3 className="title" style={{ margin: "0 4px 8px 4px" }}>
        Might be interesting
      </h3>
      <div style={styles.languages}>
        {/* <Button
          style={styles.button}
          variant="contained"
          sx={{ textTransform: "none" }}
          size="small"
        >
          Python
        </Button> */}
      </div>
    </div>
  );
}

const styles = {
  box: {
    backgroundColor: "#fff",
    height: "max-content",
    padding: "8px 4px",
    borderRadius: "8px",
    width: "100%",
  },
  languages: {
    display: "flex",
    flexWrap: "wrap",
  },
  button: {
    margin: "4px",
  },
};

// export const getStaticProps = async () => {
//   try {
//     return {
//       props: { questions: questions.data ? questions.data : [] },
//     };
//   } catch (err) {
//     return {
//       notFound: true,
//     };
//   }
// };
