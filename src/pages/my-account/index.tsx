import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useLocale } from "@/hooks/useLocale";
import { DateTimeFormatOptions, User } from "@/libs/types";
import styles from "@/styles/my-account.module.css";
import { Modal } from "@/components/Modal";
import { getMessageKey } from "@/libs/alertMessages";
import firebase from "@/firebase";
import { useAlert } from "react-alert";
import { TextLink } from "@/components/TextLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import { useStore } from "src/stores";
import { observer } from "mobx-react-lite";

const MyAccount = observer(() => {
  const [loading, setLoading] = useState<boolean>(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");
  const { L } = useLocale();
  const [showDeleteAccountModal, setShowDeleteAccountModal] =
    useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const { rootStore } = useStore();
  const [phoneValue, setPhoneValue] = useState<string>(
    !!rootStore.userStore.user?.phoneNumber
      ? rootStore.userStore.user?.phoneNumber
      : "+34 "
  );
  const [emailValue, setEmailValue] = useState<string>(
    rootStore.userStore.user?.email || ""
  );
  const [firstNameValue, setFirstNameValue] = useState<string>(
    rootStore.userStore.user?.firstName || ""
  );
  const [lastNameValue, setLastNameValue] = useState<string>(
    rootStore.userStore.user?.lastName || ""
  );

  const [loadingRedirect, setLoadingRedirect] = useState(false);

  const alert = useAlert();

  const options: DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const date = rootStore.userStore.user?.createdAt
    ?.toDate()
    .toLocaleDateString("es-ES", options);

  const router = useRouter();

  const componentRef = useRef(false);

  useEffect(() => {
    componentRef.current = true;
    return () => {
      componentRef.current = false;
    };
  }, []);

  useEffect(() => {
    setEmailValue(rootStore.userStore.user?.email || "");
    setFirstNameValue(rootStore.userStore.user?.firstName || "");
    setLastNameValue(rootStore.userStore.user?.lastName || "");
    setPhoneValue(
      !!rootStore.userStore.user?.phoneNumber
        ? rootStore.userStore.user?.phoneNumber
        : "+34 "
    );
  }, [rootStore.userStore.user]);

  async function redirectToCustomerPortal() {
    try {
      setLoadingRedirect(true);
      const functionRef = firebase
        .app()
        .functions("europe-west6")
        .httpsCallable("ext-firestore-stripe-subscriptions-createPortalLink");
      const { data } = await functionRef({ returnUrl: window.location.origin });
      window.location.assign(data.url);
      setLoadingRedirect(false);
    } catch (err) {
      const message = getMessageKey(err.code);
      alert.error(L(message));
      setLoadingRedirect(false);
    }
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      if (phoneRef.current && phoneRef.current.value?.length < 9) {
        alert.error(L("incorrect_phone_number"));
      } else {
        if (isReloginNeeded()) {
          alert.info(L("relogin_to_action"));
          setShowLogoutModal(true);
          //rootStore.userStore.logout();
        } else {
          if (
            rootStore.userStore.user &&
            firstNameRef.current?.value &&
            lastNameRef.current?.value &&
            emailRef.current?.value &&
            phoneRef.current?.value
          ) {
            if (emailRef.current.value !== rootStore.userStore.user.email) {
              await rootStore.userStore.updateEmail(
                emailRef.current.value || ""
              );
              await rootStore.userStore.sendEmailVerification();
            }
            let user: User = {
              ...rootStore.userStore.user,
              firstName: firstNameRef.current.value,
              lastName: lastNameRef.current.value,
              email: emailRef.current.value,
              phoneNumber: phoneRef.current.value.replace(" ", ""),
            };
            await rootStore.userStore.updateUser(user);
            await rootStore.userStore.refreshCurentUser();
          }
        }
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

  function onSelectService(index: number) {
    rootStore.appStore.setSelectedServiceIndex(index);
  }

  function onServices() {
    onSelectService(0);
  }

  function onCancelDeleteAccountModal() {
    setShowDeleteAccountModal(false);
  }

  function onCancelLogoutModal() {
    setShowLogoutModal(false);
  }

  function isReloginNeeded() {
    const lastSignInTime = rootStore.userStore.getLastSignInTime();
    const newDate = new Date();
    const seconds = (lastSignInTime.getTime() - newDate.getTime()) / 1000;
    const minutes = Math.abs(seconds / 60);
    return minutes > 2;
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

  async function onLogout() {
    setLoading(true);
    try {
      setError("");
      await rootStore.userStore.logout();
      router.replace("/");
    } catch {
      setError("Failed to logout");
    }
    componentRef.current && setLoading(false);
  }

  async function onResend() {
    setLoading(true);
    try {
      await rootStore.userStore.sendEmailVerification();
      alert.success(L("success_verify_email"));
    } catch (err) {
      const message = getMessageKey(err.code);
      alert.error(L(message));
    }
    setLoading(false);
  }

  async function checkVerification() {
    setLoading(true);
    await rootStore.userStore.refreshCurentUser();
    setLoading(false);
  }

  function noChangedValues() {
    return (
      rootStore.userStore.user?.email === emailRef.current?.value &&
      rootStore.userStore.user?.firstName === firstNameRef.current?.value &&
      rootStore.userStore.user?.lastName === lastNameRef.current?.value &&
      rootStore.userStore.user?.phoneNumber === phoneRef.current?.value
    );
  }

  return (
    <div className={styles.container}>
      <h1>{L("my_account")}</h1>
      <div className={styles.content}>
        <h2>{L("user_info")}</h2>
        <form onSubmit={onSave} className={styles.form}>
          <div className={styles.inputs}>
            <Input
              label="first_name"
              forwardRef={firstNameRef}
              placeholder="first_name"
              value={firstNameValue}
              onChange={(event) => {
                setFirstNameValue(event.target.value);
              }}
              required
              type="text"
            />
            <Input
              label="last_name"
              forwardRef={lastNameRef}
              placeholder="last_name"
              value={lastNameValue}
              onChange={(event) => {
                setLastNameValue(event.target.value);
              }}
              required
              type="text"
            />
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
            <Input
              forwardRef={phoneRef}
              type="tel"
              label="phone_number"
              placeholder="phone_number"
              value={phoneValue}
              required
              onChange={(event) => setPhoneValue(event.target.value)}
            />
            <br />
            <div style={{ width: "100%" }}>
              <div className={styles.actionButtons}>
                <Button
                  type="submit"
                  text="save"
                  disabled={loading || noChangedValues()}
                  variant="primary"
                  loading={loading}
                />
              </div>
            </div>

            {!rootStore.userStore.user?.emailVerified && (
              <div className={styles.noVerifiedEmail}>
                {L("no_verified_email")}
                <TextLink text={L("resend_verification")} onClick={onResend} />
                <Button
                  onClick={checkVerification}
                  type="button"
                  info={
                    <span>
                      {L("check")} <FontAwesomeIcon icon={faSync} />
                    </span>
                  }
                  disabled={loading}
                  variant="secondary"
                  loading={loading}
                />
              </div>
            )}
          </div>
        </form>
        <div>
          {L("user_since")}: {date}
        </div>
        {error && <div>{error}</div>}
        <h2 className={styles.servicesTitle}>{L("services")}</h2>
        {rootStore.userStore.user?.services === null || loading ? (
          <div>{L("loading")}...</div>
        ) : !rootStore.userStore.user?.services?.length ? (
          <div>
            <h3>{L("prodvide_care_services")}</h3>
            <Button
              variant="primary"
              disabled={loading}
              text="register_service"
              type="button"
              href="/offer-care-services"
            />
          </div>
        ) : (
          <Button
            type="button"
            text="my_service"
            disabled={
              loading ||
              (rootStore.userStore.subscription.status !== "active" &&
                rootStore.userStore.subscription.status !== "trialing")
            }
            variant="primary"
            onClick={onServices}
            href="/my-account/services/service"
          />
        )}

        {rootStore.userStore.subscription.status &&
          rootStore.userStore.subscription.status !== "active" &&
          rootStore.userStore.subscription.status !== "trialing" && (
            <>
              <div>{L("canceled_subscription_services_description")}</div>
              <Button
                disabled={loading}
                text="available_plans"
                type="button"
                variant="link-primary"
                onClick={() => {
                  router.push("/pricing");
                }}
              />
            </>
          )}

        {/* <h2 className={styles.servicesTitle}>{L("chats")}</h2>
        <Button
          disabled={loading}
          text="my_chats"
          type="button"
          variant="primary"
          onClick={() => {
            router.push("/chats");
          }}
        /> */}

        <h2>{L("extra_info")}</h2>
        {rootStore.userStore.subscription.status != null && (
          <Button
            onClick={redirectToCustomerPortal}
            type="button"
            text="manage_subscription"
            disabled={loadingRedirect}
            loading={loadingRedirect}
            variant="secondary"
          />
        )}
        <Button
          onClick={() => setShowLogoutModal(true)}
          type="button"
          text="logout"
          disabled={loading}
          variant="outline-danger"
        />
        <Button
          disabled={loading}
          text="remove_account"
          type="button"
          variant="link-danger"
          onClick={() => setShowDeleteAccountModal(true)}
        />
        <div style={{ height: "100px" }} />
      </div>
      {showLogoutModal && (
        <Modal
          onAction={onLogout}
          onCancel={onCancelLogoutModal}
          title="logout"
          question="logout_question"
          actionText="logout"
          cancelText="cancel"
        />
      )}
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
  );
});

export default MyAccount;
