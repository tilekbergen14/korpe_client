import React, { useState } from "react";
import styles from "../../styles/Admin.module.css";
import { useRouter } from "next/router";
import useSWR from "swr";
import { ListItem, ListItemText } from "@mui/material";
import Dashboard from "../../components/admin/Dashboard";
import Users from "../../components/admin/Users";
import Lessons from "../../components/admin/Lessons";
import Posts from "../../components/admin/Posts";

export default function index() {
  const router = useRouter();
  const [state, setState] = useState({
    navState: "Dashboard",
  });
  const { data, error } = useSWR("user", async () => {
    try {
      if (typeof window !== "undefined") {
        let user = localStorage.getItem("user");
        if (user) {
          let role = JSON.parse(user).role;
          return role;
        } else {
          router.push("/auth");
        }
      }
    } catch (err) {
      return err.message;
    }
  });

  if (error || data !== "admin")
    return (
      <div className={styles.notAllowed}>Sorry you don't have permission</div>
    );
  if (!data) return <div>Loading</div>;

  const handleNav = (e) => {
    setState({ ...state, navState: e });
  };

  return (
    <div className={styles.page}>
      <div className={styles.hornav}>
        <div className={styles.fixed}>
          <ListItem
            button
            key="dashboard"
            onClick={() => handleNav("Dashboard")}
          >
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button key="users" onClick={() => handleNav("Users")}>
            <ListItemText primary="Users" />
          </ListItem>
          <ListItem button key="posts" onClick={() => handleNav("Posts")}>
            <ListItemText primary="Posts" />
          </ListItem>
          <ListItem button key="lessons" onClick={() => handleNav("Lessons")}>
            <ListItemText primary="Lessons" />
          </ListItem>
        </div>
      </div>
      <div className={styles.body}>
        {state.navState === "Dashboard" && <Dashboard />}
        {state.navState === "Users" && <Users />}
        {state.navState === "Lessons" && <Lessons />}
        {state.navState === "Posts" && <Posts />}
      </div>
    </div>
  );
}
