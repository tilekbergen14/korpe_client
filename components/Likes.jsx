import React, { useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";

export default function Likes({ likewhere, isLiked, id, likeNumber }) {
  const [liked, setLiked] = useState(isLiked ? isLiked : false);
  const [likes, setLikes] = useState(likeNumber ? likeNumber : 0);

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
          `${process.env.server}/${likewhere}/like`,
          { id },
          {
            headers: {
              authorization: "Bearer " + user.token,
            },
          }
        )
        .then((result) => {})
        .catch((err) => console.log(err.response ? err.response.data : err));
  };
  return liked ? (
    <div className="grid grid-center">
      <FavoriteIcon
        color="danger"
        className="c-pointer"
        fontSize="small"
        onClick={handleLikes}
      />
      <p style={styles.likeText}>
        {likes}
        {likes === 0 || likes === 1 ? " Like" : " Likes"}
      </p>
    </div>
  ) : (
    <div className="grid grid-center">
      <FavoriteBorderIcon
        color="danger"
        className="c-pointer"
        fontSize="small"
        onClick={handleLikes}
      />

      <p style={styles.likeText}>
        {likes}
        {likes === 0 || likes === 1 ? " Like" : " Likes"}
      </p>
    </div>
  );
}

const styles = {
  likeText: {
    margin: "0",
    fontSize: "12px",
    color: "#757575",
    fontWeight: "400",
  },
};
