import React, { useEffect, useRef, useState } from "react";

import styles from "@/styles/DeleteModal.module.css";
import { Button } from "./Button";
import { AllKeysOfLanguage } from "@/libs/locale";
import { useLocale } from "@/hooks/useLocale";

interface Props {
  onCancel: () => void;
  onAction: () => Promise<void>;
  cancelText: AllKeysOfLanguage;
  actionText: AllKeysOfLanguage;
  title: AllKeysOfLanguage;
  question: AllKeysOfLanguage;
}

export const Modal = ({
  onCancel,
  onAction,
  cancelText,
  actionText,
  title,
  question,
}: Props) => {
  const { L } = useLocale();
  const [loading, setLoading] = useState<boolean>(false);

  const componentRef = useRef(false);

  useEffect(() => {
    componentRef.current = true;
    return () => {
      componentRef.current = false;
    };
  }, []);

  async function onPress() {
    setLoading(true);
    await onAction();
    componentRef.current && setLoading(false);
  }

  return (
    <div className={styles.modal}>
      <form className={styles["modal-content"]}>
        <div className={styles.container}>
          <h1>{L(title)}</h1>
          <p>{L(question)}</p>
          <div className={styles.clearfix}>
            <Button
              type="button"
              variant="secondary"
              text={cancelText}
              disabled={false}
              onClick={onCancel}
            />
            <Button
              type="button"
              variant="danger"
              text={actionText}
              disabled={false}
              onClick={onPress}
              loading={loading}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
