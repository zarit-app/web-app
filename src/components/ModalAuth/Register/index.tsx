import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

import { Input } from "@/components/Input";
import { useLocale } from "@/hooks/useLocale";
import { Button } from "@/components/Button";
import { Alert } from "@/components/Alert";
import { TextLink } from "@/components/TextLink";
import { useStore } from "src/stores";

export const Register = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { L } = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const componentRef = useRef(false);
  const { rootStore } = useStore();

  useEffect(() => {
    componentRef.current = true;
    return () => {
      componentRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await rootStore.userStore.signup(
        emailRef.current?.value || "",
        passwordRef.current?.value || ""
      );
      await rootStore.userStore.sendEmailVerification();
    } catch (err) {
      setError(err.code);
    }
    componentRef.current && setLoading(false);
  }
  return (
    <>
      <h1 className={styles.title}>{L("register_text")}</h1>
      <h2 className={styles.subtitle}>{L("write_data")}</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputs}>
          <Input
            forwardRef={emailRef}
            placeholder={"placeholder_email"}
            type="email"
            autoComplete="false"
          />
          <Input
            forwardRef={passwordRef}
            placeholder={"placeholder_password"}
            type={!showPassword ? "password" : "text"}
            autoComplete="false"
          />
          <div>
            {L("show_password")}{" "}
            <input
              type="checkbox"
              onChange={() => setShowPassword(!showPassword)}
            />
          </div>
        </div>
        {!!error && <Alert message={error} variant="danger" />}
        <div className={styles.infoEmail}>{L("verify_email_warning")}</div>
        <Button
          type="submit"
          disabled={loading}
          text="enter"
          variant="primary"
          loading={loading}
        />
      </form>
      <div className={styles.text}>
        {L("already_have_account")}{" "}
        <TextLink
          onClick={() => {
            rootStore.appStore.setAuthModalPage("login");
          }}
          text={L("login")}
        />
      </div>
    </>
  );
};
