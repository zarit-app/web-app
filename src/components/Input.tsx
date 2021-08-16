import React, { RefObject } from "react";
import { useLocale } from "@/hooks/useLocale";
import { AllKeysOfLanguage } from "@/libs/locale";

import styles from "@/styles/Input.module.css";

interface Props {
  forwardRef?: RefObject<HTMLInputElement>;
  forwardRefTextArea?: RefObject<HTMLTextAreaElement>;
  placeholder: AllKeysOfLanguage;
  type: string;
  autoComplete?: string;
  label?: AllKeysOfLanguage;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeTextArea?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string;
  required?: boolean;
  readOnly?: boolean;
  textarea?: boolean;
}

export const Input = ({
  forwardRef,
  placeholder,
  type,
  autoComplete,
  label,
  onChange,
  value,
  required,
  readOnly,
  textarea,
  forwardRefTextArea,
  onChangeTextArea,
}: Props) => {
  const { L } = useLocale();

  return (
    <div className={styles.inputContainer}>
      {label && <label className={styles.label}>{L(label)}</label>}
      {textarea ? (
        <textarea
          className={styles.input}
          ref={forwardRefTextArea}
          placeholder={L(placeholder)}
          rows={4}
          value={value}
          onChange={onChangeTextArea}
          required={required}
          readOnly={readOnly}
          maxLength={150}
        />
      ) : (
        <input
          className={styles.input}
          ref={forwardRef}
          placeholder={L(placeholder)}
          type={type}
          autoComplete={autoComplete}
          onChange={onChange}
          value={value}
          required={required}
          readOnly={readOnly}
          maxLength={50}
        />
      )}
    </div>
  );
};
