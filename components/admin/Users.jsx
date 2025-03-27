import React from "react";
import styles from "../../styles/Users.module.css";

export default function Users() {
  return (
    <div>
      <p className="title" style={{ color: "#000" }}>
        Users
      </p>
      <div className="divider" />
      <div className={styles.usersTable}>
        <div className={styles.cell}>
          <p className="title" style={{ color: "#000" }}>
            Id
          </p>
        </div>
        <div>
          <p className="title" style={{ color: "#000" }}>
            Username
          </p>
        </div>
        <div>
          <p className="title" style={{ color: "#000" }}>
            Email
          </p>
        </div>
        <div>
          <p className="title" style={{ color: "#000" }}>
            Role
          </p>
        </div>
      </div>
    </div>
  );
}
