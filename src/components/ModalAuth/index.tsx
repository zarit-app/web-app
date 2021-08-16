import React from "react";
import { TextLink } from "../TextLink";
import styles from "./styles.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Login } from "./Login";
import { Register } from "./Register";
import { Recover } from "./Recover";
import { useLocale } from "@/hooks/useLocale";
import { useStore } from "src/stores";
import { observer } from "mobx-react-lite";

function AuthPage() {
  const { rootStore } = useStore();
  const { L } = useLocale();

  return (
    <>
      <h1 className={styles.title}>{L("welcome")}</h1>
      <h2 className={styles.subtitle}>{L("auth_text")}</h2>
      <div className={styles.buttonsContainer}>
        <TextLink
          text={L("login")}
          onClick={() => rootStore.appStore.setAuthModalPage("login")}
        />
        <div className={styles.divider}>|</div>
        <TextLink
          text={L("register")}
          onClick={() => rootStore.appStore.setAuthModalPage("register")}
        />
      </div>
    </>
  );
}

const ShowPage = observer(() => {
  const { rootStore } = useStore();

  switch (rootStore.appStore.authModal.page) {
    case "login":
      return <Login />;
    case "register":
      return <Register />;
    case "recover":
      return <Recover />;
    default:
      return <AuthPage />;
  }
});

const ArrowIcon = observer(() => {
  const { rootStore } = useStore();
  return (
    <>
      {rootStore.appStore.authModal.page && (
        <div
          className={styles.arrow}
          onClick={() => rootStore.appStore.setAuthModalPage(null)}
        >
          <div className={styles.fixedClose}>
            <FontAwesomeIcon
              icon={faArrowLeft}
              className={styles.iconClose}
            ></FontAwesomeIcon>
          </div>
        </div>
      )}
    </>
  );
});

export const ModalAuth = observer(() => {
  const { L } = useLocale();
  const { rootStore } = useStore();

  return (
    <>
      {rootStore.appStore.authModal.shown && (
        <div className={styles.modal}>
          <div className={styles["modal-content"]}>
            <div className={styles.container}>
              <div
                className={styles.close}
                onClick={rootStore.appStore.closeAuthModal}
              >
                <div className={styles.fixedClose}>
                  <FontAwesomeIcon
                    icon={faTimes}
                    className={styles.iconClose}
                  ></FontAwesomeIcon>
                </div>
              </div>
              <ArrowIcon />
              <div className={styles.container}>
                <ShowPage />
                <div className={styles.acceptTerms}>
                  {L("accept_terms_and_privacy_descriptions")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
