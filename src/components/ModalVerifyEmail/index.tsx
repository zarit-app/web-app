import { useLocale } from "@/hooks/useLocale";
import { TextLink } from "../TextLink";
import styles from "./styles.module.css";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { getMessageKey } from "@/libs/alertMessages";
import { useAlert } from "react-alert";
import { Modal } from "@/components/Modal";
import { useStore } from "src/stores";

export const ModalVerifyEmail = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { L } = useLocale();
  const [updating, setUpdating] = useState(false);
  const { rootStore } = useStore();

  const [emailValue, setEmailValue] = useState<string>(
    rootStore.userStore.user?.email || ""
  );
  const emailRef = useRef<HTMLInputElement>(null);

  const alert = useAlert();

  const [showDeleteAccountModal, setShowDeleteAccountModal] =
    useState<boolean>(false);

  /* useEffect(() => {
    if (app.user && app.user?.emailVerified) {
      appDispatch({ type: "SET_MODAL_VERIFY_EMAIL", payload: false });
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.user, app.user?.emailVerified]); */

  const componentRef = useRef(false);

  useEffect(() => {
    componentRef.current = true;
    return () => {
      componentRef.current = false;
    };
  }, []);

  async function checkVerification() {
    setLoading(true);
    await rootStore.userStore.refreshCurentUser();
    setLoading(false);
  }

  async function onResend() {
    setLoading(true);
    try {
      await rootStore.userStore.sendEmailVerification();
    } catch (err) {
      const message = getMessageKey(err.code);
      alert.error(L(message));
    }
    setLoading(false);
  }

  function isReloginNeeded() {
    const lastSignInTime = rootStore.userStore.getLastSignInTime();
    const newDate = new Date();
    const seconds = (lastSignInTime.getTime() - newDate.getTime()) / 1000;
    const minutes = Math.abs(seconds / 60);
    return minutes > 2;
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoading(true);
      if (isReloginNeeded()) {
        alert.info(L("relogin_to_action"));
        rootStore.userStore.logout();
      } else {
        if (
          emailRef.current?.value &&
          rootStore.userStore.user?.uid &&
          emailRef.current.value !== rootStore.userStore.user.email
        ) {
          await rootStore.userStore.updateEmail(emailRef.current.value || "");
          await rootStore.userStore.updateDatabaseEmail(
            emailRef.current.value || "",
            rootStore.userStore.user.uid || ""
          );
          onResend();
        }
        await rootStore.userStore.refreshCurentUser();
        setUpdating(false);
      }
    } catch (err) {
      if (err.code === "auth/requires-recent-login") {
        alert.info(L("relogin_to_action"));
        rootStore.userStore.logout();
      } else {
        const message = getMessageKey(err.code);
        alert.error(L(message));
      }
    }
    componentRef.current && setLoading(false);
  }

  async function onDeleteAccount() {
    try {
      if (isReloginNeeded()) {
        alert.info(L("relogin_to_action"));
        rootStore.userStore.logout();
      } else {
        if (rootStore.userStore.user) {
          await rootStore.userStore.deleteAccount();
        }
      }
    } catch (err) {
      const message = getMessageKey(err.code);
      alert.error(L(message));
    }
  }

  function onCancelDeleteAccountModal() {
    setShowDeleteAccountModal(false);
  }

  return (
    <div className={styles.modal}>
      <div className={styles["modal-content"]}>
        <div className={styles.container}>
          <div className={styles.container}>
            <h1 className={styles.title}>{L("verify_email")}</h1>
            <h2 className={styles.subtitle}>{L("verify_email_subtitle")}</h2>
            <div className={styles.content}>
              <form className={styles.form} onSubmit={onSave}>
                {!updating ? (
                  <div>
                    {L("verify_email_description")}:{" "}
                    {rootStore.userStore.user?.email}
                  </div>
                ) : (
                  <Input
                    label="email"
                    forwardRef={emailRef}
                    placeholder="email"
                    value={emailValue}
                    onChange={(event) => {
                      setEmailValue(event.target.value);
                    }}
                    required
                    type="email"
                  />
                )}
                {!updating ? (
                  <>
                    <p>
                      {L("not_your_email")}{" "}
                      <TextLink
                        onClick={() => {
                          setUpdating(true);
                        }}
                        text={L("update")}
                      />
                    </p>
                    <Button
                      type="button"
                      disabled={loading}
                      text="check_verification"
                      variant="primary"
                      loading={loading}
                      onClick={checkVerification}
                    />
                    <TextLink onClick={onResend} text={L("resend")} />
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        setUpdating(false);
                      }}
                      type="button"
                      text="cancel"
                      disabled={loading}
                      variant="danger"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      text="save"
                      variant="primary"
                      loading={loading}
                    />
                  </>
                )}
              </form>
              <Button
                disabled={loading}
                text="remove_account"
                type="button"
                variant="link-danger"
                onClick={() => setShowDeleteAccountModal(true)}
              />
            </div>
            {showDeleteAccountModal && (
              <Modal
                onAction={onDeleteAccount}
                onCancel={onCancelDeleteAccountModal}
                title="remove_account"
                question="remove_account_question"
                actionText="delete"
                cancelText="cancel"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
