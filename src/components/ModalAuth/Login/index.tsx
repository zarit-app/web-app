import { Alert } from "@/components/Alert";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { TextLink } from "@/components/TextLink";
import { useLocale } from "@/hooks/useLocale";
import React, { useEffect, useRef, useState } from "react";
import { useStore } from "src/stores";
import styles from "./styles.module.css";

export const Login = () => {
  const { L } = useLocale();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const componentRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
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
      await rootStore.userStore.login(
        emailRef.current?.value || "",
        passwordRef.current?.value || ""
      );
    } catch (err) {
      setError(err.code);
    }

    componentRef.current && setLoading(false);
  }
  return (
    <>
      <h1 className={styles.title}>{L("welcome_again")}</h1>
      <h2 className={styles.subtitle}>{L("write_credentials")}</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputs}>
          <Input
            forwardRef={emailRef}
            placeholder="placeholder_email"
            type="email"
            autoComplete="false"
          />
          <Input
            forwardRef={passwordRef}
            placeholder="placeholder_password"
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
        <Button
          type="submit"
          disabled={loading}
          text="enter"
          variant="primary"
          loading={loading}
        />
      </form>
      <div className={styles.text}>
        <p>
          {L("do_not_have_account")}{" "}
          <TextLink
            onClick={() => {
              rootStore.appStore.setAuthModalPage("register");
            }}
            text={L("sign_up")}
          />
        </p>
      </div>
      <div className={styles.text}>
        {L("forgot_password")}{" "}
        <TextLink
          onClick={() => {
            rootStore.appStore.setAuthModalPage("recover");
          }}
          text={L("recover")}
        />
      </div>
      <div className={styles.buttonsContainer}></div>
    </>
  );
};
