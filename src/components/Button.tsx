import React, { ButtonHTMLAttributes, ReactElement } from "react";
import { useLocale } from "@/hooks/useLocale";
import { AllKeysOfLanguage } from "@/libs/locale";

import styles from "@/styles/Button.module.css";
import { Spinner } from "@/components/Spinner";
import Link from "next/link";

type Variants =
  | "danger"
  | "primary"
  | "outline-danger"
  | "link"
  | "secondary"
  | "link-danger"
  | "dark"
  | "link-primary";

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

type Props = RequireAtLeastOne<Props1, "text" | "info"> & Props2;

interface Props1 {
  text: AllKeysOfLanguage;
  info: string | React.ReactNode;
}

interface Props2 {
  disabled: boolean;
  type: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: () => void;
  variant: Variants;
  style?: ButtonHTMLAttributes<HTMLButtonElement>["style"];
  loading?: boolean;
  href?: string;
  icon?: ReactElement;
}

function getStyleClass(variant: Variants) {
  return styles[variant];
}

export const Button = ({
  disabled,
  type,
  text,
  onClick,
  variant,
  style,
  info,
  loading,
  href,
  icon,
}: Props) => {
  const { L } = useLocale();

  return (
    <div>
      {href ? (
        <Link href={href} passHref>
          <button
            className={
              disabled
                ? `${styles.button} ${getStyleClass(variant)}  ${
                    styles.disabled
                  }`
                : `${styles.button} ${getStyleClass(variant)}`
            }
            type={type}
            disabled={disabled}
            onClick={onClick}
            style={style}
          >
            {loading ? <Spinner /> : text ? L(text) : info}
            {!!icon && icon}
          </button>
        </Link>
      ) : (
        <button
          className={
            disabled
              ? `${styles.button} ${getStyleClass(variant)}  ${styles.disabled}`
              : `${styles.button} ${getStyleClass(variant)}`
          }
          type={type}
          disabled={disabled}
          onClick={onClick}
          style={style}
        >
          {loading ? <Spinner /> : text ? L(text) : info}
          {!!icon && icon}
        </button>
      )}
    </div>
  );
};
