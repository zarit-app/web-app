import { Button } from "@/components/Button";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import firebase from "@/firebase";
import { useAlert } from "react-alert";
import { getMessageKey } from "@/libs/alertMessages";
import { useLocale } from "@/hooks/useLocale";
import { useStore } from "src/stores";
import { autorun } from "mobx";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const alert = useAlert();
  const { L } = useLocale();
  const { rootStore } = useStore();

  useEffect(
    () =>
      autorun(() => {
        if (rootStore.userStore.initializedUser && !rootStore.userStore.user) {
          router.replace("/");
        }
        if (
          rootStore.userStore.initializedUser &&
          rootStore.userStore.user &&
          rootStore.userStore.user.role === "admin"
        ) {
          setIsAdmin(true);
        } else if (
          rootStore.userStore.initializedUser &&
          rootStore.userStore.user &&
          rootStore.userStore.user.role !== "admin"
        ) {
          router.replace("/");
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  async function checkActiveZones() {
    setLoading(true);
    try {
      const functionRef = firebase
        .app()
        .functions()
        .httpsCallable("checkActiveProvincesAndLocalities");
      await functionRef();
    } catch (err) {
      const message = getMessageKey(err.code);
      alert.error(L(message));
    }
    setLoading(false);
  }

  return (
    isAdmin && (
      <div>
        <Button
          text="check_active_provinces_and_localities"
          disabled={false}
          type="button"
          variant="primary"
          onClick={checkActiveZones}
          loading={loading}
        />
      </div>
    )
  );
}
