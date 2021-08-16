import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLocale } from "@/hooks/useLocale";
import React, { useRef, useState } from "react";
import { useStore } from "src/stores";
import styles from "./styles.module.css";

export const Recover = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { L } = useLocale();
  const { rootStore } = useStore();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    try {
      setError("");
      setMessage("");
      setLoading(true);
      await rootStore.userStore.resetPassword(emailRef.current?.value || "");
      setMessage("success_forgot_passowrd");
    } catch (err) {
      setError(err.code);
    }

    setLoading(false);
  }

  return (
    <>
      <h1 className={styles.title}>{L("recover_password")}</h1>
      <h2 className={styles.subtitle}>{L("forgot_password_description")}</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputs}>
          <Input
            forwardRef={emailRef}
            placeholder="placeholder_email"
            type="email"
            autoComplete="false"
            required
          />
        </div>
        {!!message && <Alert message={message} variant="success" />}
        {!!error && <Alert message={error} variant="danger" />}
        <Button
          type="submit"
          disabled={loading}
          text="recover"
          variant="primary"
          loading={loading}
        />
      </form>
    </>
  );
};
