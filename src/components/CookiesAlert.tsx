import React, { useEffect, useState } from "react";

import styles from "@/styles/CookiesAlert.module.css";
import { useLocale } from "@/hooks/useLocale";

import { TextLink } from "@/components/TextLink";

export const CookiesAlert = () => {
  const { L } = useLocale();
  const [showCookiesAlert, setShowCookiesAlert] = useState(false);

  useEffect(() => {
    const acceptedCookies: boolean = !!localStorage.getItem("acceptedCookies");
    if (!acceptedCookies) {
      setShowCookiesAlert(true);
    }
  }, []);

  return (
    <>
      {showCookiesAlert && (
        <div className={styles.cookiesAlertContainer}>
          {L("cookies_message")}
          <div className={styles.buttons}>
            <TextLink text={L("more_details")} href="/cookies" />
            <TextLink
              text={L("ok")}
              onClick={() => {
                localStorage.setItem("acceptedCookies", "true");
                setShowCookiesAlert(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
