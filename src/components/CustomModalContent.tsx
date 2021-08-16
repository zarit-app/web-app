import React from "react";

import styles from "@/styles/Modal.module.css";

interface Props {
  children: React.ReactNode;
}

export const CustomModalContent = ({ children }: Props) => {
  return (
    <div className={styles.modal}>
      <form className={styles["modal-content"]}>
        <div className={styles.container}>{children}</div>
      </form>
    </div>
  );
};
