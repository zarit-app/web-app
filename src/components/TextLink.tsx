import React from "react";

import styles from "@/styles/TextLink.module.css";

import Link from "next/link";

interface Props {
  onClick?: () => void;
  text: string;
  href?: string;
  variant?: "primary" | "secondary";
}
export const TextLink = ({
  onClick,
  text,
  href,
  variant = "primary",
}: Props) => {
  return href ? (
    <Link href={href || "#"}>
      <a
        className={
          variant === "primary" ? styles.element : styles.elementSecondary
        }
        onClick={() => {
          onClick?.();
        }}
      >
        {text}
      </a>
    </Link>
  ) : (
    <span
      className={
        variant === "primary" ? styles.element : styles.elementSecondary
      }
      onClick={() => {
        onClick?.();
      }}
    >
      {" "}
      {text}
    </span>
  );
};
