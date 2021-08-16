import React from "react";

import styles from "@/styles/Switch.module.css";

interface Props {
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}

export const Switch = ({ checked, onChange, disabled }: Props) => {
  return (
    <label className={styles.switch}>
      <input
        disabled={disabled}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span
        className={
          disabled
            ? `${styles.slider} ${styles.round} ${styles.disabled}`
            : `${styles.slider} ${styles.round}`
        }
      />
    </label>
  );
};
