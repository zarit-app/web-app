import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Footer } from "./Footer";
import { Nav } from "./Nav";
import { User } from "@/libs/types";
import { CookiesAlert } from "./CookiesAlert";
import firebase, { auth } from "@/firebase";
import { ModalAuth } from "./ModalAuth";
//import { ModalVerifyEmail } from "./ModalVerifyEmail";
import { useStore } from "src/stores";
import { autorun } from "mobx";
import { getFirebaseTimestamp } from "@/libs/utils";
import { getMessageKey } from "@/libs/alertMessages";
import { useAlert } from "react-alert";
import { useLocale } from "@/hooks/useLocale";

interface Props {
  Component: any;
  pageProps: any;
}

function App({ Component, pageProps }: Props) {
  const router = useRouter();
  const { rootStore } = useStore();
  const alert = useAlert();
  const { L } = useLocale();

  useEffect(() => {
    rootStore.appStore.setRouterPath(router.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  useEffect(
    () =>
      autorun(() => {
        if (
          rootStore.userStore.initializedUser &&
          rootStore.userStore.requireLogin(rootStore.appStore.routerPathName)
        ) {
          rootStore.appStore.openAuthModal();
          router.replace("/");
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    firebase.analytics();
  }, []);

  /* useEffect(() => {
    if (app.user && !app.user?.emailVerified && !noAuthPaths(router.pathname)) {
      appDispatch({ type: "SET_MODAL_VERIFY_EMAIL", payload: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.user?.emailVerified, router.pathname]); */

  /* useEffect(
    () =>
      autorun(() => {
        if (
          rootStore.userStore.initializedUser &&
          rootStore.userStore.user &&
          !rootStore.userStore.refreshedCurrentUserServices
        ) {
          rootStore.userStore.setRefreshedCurrentUserServices(true);
          rootStore.userStore.refreshCurrentUserServices();
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  ); */

  useEffect(
    () =>
      autorun(() => {
        if (
          rootStore.userStore.user &&
          !rootStore.userStore.checkUserSubscription
        ) {
          rootStore.userStore.subscribeOnCheckUserSubscription();
        } else {
          if (!rootStore.userStore.user) {
            rootStore.userStore.unsubscribeCheckUserSubscription();
          }
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(
    () =>
      autorun(() => {
        if (rootStore.userStore.user && !!rootStore.appStore.authModal.shown) {
          rootStore.appStore.closeAuthModal();
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(
    () =>
      autorun(() => {
        if (
          rootStore.userStore.user &&
          rootStore.userStore.user.services?.length &&
          rootStore.appStore.routerPathName === "/my-account/register-service"
        ) {
          router.replace("/my-account");
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        let data: User | null = null;
        if (user?.uid) {
          let dbUser;
          dbUser = await rootStore.userStore.findUserDatabase(user.uid);
          if (!dbUser?.exists) {
            data = {
              email: user.email || "",
              createdAt: getFirebaseTimestamp(new Date()),
              role: "customer",
              uid: user.uid,
              firstName: "",
              lastName: "",
              emailVerified: false,
              phoneNumber: "",
            };
            await rootStore.userStore.createUserDatabase(data);
          } else {
            data = dbUser.data() as User;
          }
        }
        if (data) {
          data.emailVerified = !!user?.emailVerified;
          if (data.emailVerified !== !!user?.emailVerified) {
            await rootStore.userStore.updateDatabaseEmailVerified(
              !!user?.emailVerified,
              data.uid
            );
          }
          const services = await rootStore.userStore.getCurrentUserServices(
            data.uid
          );
          data = {
            ...data,
            services,
          };
        } else {
          rootStore.userStore.resetValues();
        }
        rootStore.userStore.setUser(data);
      } catch (err) {
        const message = getMessageKey(err.code);
        alert.error(L(message));
        rootStore.userStore.logout();
      }
      rootStore.userStore.setInitializedUser(true);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isChat =
    router.pathname === "/chats/chat" || router.pathname === "/chats";

  return (
    <main className={!isChat ? "min-height" : undefined}>
      <Nav />
      <div className={isChat ? "app-semi-container" : "app-container"}>
        <Head>
          <title>Zarit</title>
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="apple-touch-icon"
            sizes="128x128"
            href="/images/logo_web.png"
          />
          <link rel="icon" sizes="192x192" href="/images/logo_web.png" />
        </Head>
        <div className="content">
          <Component {...pageProps} />
        </div>
        <CookiesAlert />
      </div>
      <Footer />
      <ModalAuth />
      {/* {app.user && app.verifyEmailModalShown && <ModalVerifyEmail />} */}
    </main>
  );
}

export { App };
