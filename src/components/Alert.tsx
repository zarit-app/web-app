import React from "react";

import styles from "@/styles/Alert.module.css";
import { useLocale } from "@/hooks/useLocale";
import { getMessageKey } from "@/libs/alertMessages";
import { AlertVariants } from "@/libs/types";

interface Props {
  message: string;
  variant: AlertVariants;
}

function getStyleClass(variant: AlertVariants) {
  return styles[`alert-${variant}`];
}

export const Alert = ({ message, variant }: Props) => {
  const { L } = useLocale();
  const mess = getMessageKey(message);

  return (
    <div className={`${styles.alertContainer} ${getStyleClass(variant)}`}>
      {L(mess)}
    </div>
  );
};
