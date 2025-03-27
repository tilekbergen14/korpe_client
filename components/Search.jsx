import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
export default function Search(props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(props.keyword ? props.keyword : "");
  const handleSearch = () => {
    if (props.setKeyword) {
    } else {
      router.replace(`/search/${keyword}`);
    }
  };
  return (
    <div className={styles.search}>
      <input
        placeholder="Search..."
        style={{ margin: props.margin }}
        className={styles.input}
        type="text"
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value), props.setKeyword(e.target.value);
        }}
      />

      <SearchIcon
        onClick={handleSearch}
        color="primary"
        sx={{ margin: "8px" }}
        className="c-pointer"
      />
    </div>
  );
}
