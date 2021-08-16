import React, { useEffect, useRef, useState } from "react";
import { Button } from "../Button";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import { Spinner } from "../Spinner";
import Image from "next/image";
import LogoHeader from "@/images/logo_header.png";
import styles from "./styles.module.css";
import { autorun } from "mobx";
import { useStore } from "src/stores";
import { observer } from "mobx-react-lite";

export const Nav = observer(() => {
  const menuRef = React.createRef<HTMLDivElement>();
  const navRef = React.createRef<HTMLElement>();
  const { L } = useLocale();
  const componentRef = useRef(false);
  const [shouldShowRegisterButton, setShouldShowRegisterButton] =
    useState(false);
  const { rootStore } = useStore();
  useEffect(() => {
    componentRef.current = true;
    return () => {
      componentRef.current = false;
    };
  }, []);

  useEffect(
    () =>
      autorun(() => {
        if (
          !rootStore.userStore.user ||
          (rootStore.userStore.user.services &&
            !!!rootStore.userStore.user.services?.length)
        ) {
          setShouldShowRegisterButton(true);
        } else {
          setShouldShowRegisterButton(false);
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function onClickMenu() {
    const menu = menuRef.current;
    const nav = navRef.current;
    menu?.classList.toggle("change");
    nav?.classList.toggle("nav-change");
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="top-content">
          <Link href="/" passHref>
            <div className="logo">
              <div className={styles.imgContainer}>
                <Image alt={L("care_services_title")} src={LogoHeader} />
              </div>
            </div>
          </Link>

          <div ref={menuRef} className="menuContainer" onClick={onClickMenu}>
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
          </div>
        </div>
        <nav ref={navRef} className="nav">
          {rootStore.userStore.initializedUser ? (
            <ul>
              {/* <li onClick={onClickMenu}>
                <Link href="/">{L("home")}</Link>
              </li> */}
              {!rootStore.userStore.user && (
                <li
                  onClick={() => {
                    onClickMenu();
                    rootStore.appStore.openAuthModal();
                  }}
                >
                  <span>{L("auth_text")}</span>
                </li>
              )}
              {rootStore.userStore.user && (
                <li onClick={onClickMenu}>
                  <Link href="/my-account">{L("my_account")}</Link>
                </li>
              )}
              <li onClick={onClickMenu}>
                <Link href="/search">{L("search_services")}</Link>
              </li>
              {shouldShowRegisterButton && (
                <div className="registerServiceButton" onClick={onClickMenu}>
                  <Button
                    style={{ marginTop: 0, marginBottom: 0 }}
                    text="register_service"
                    disabled={false}
                    type="button"
                    variant="primary"
                    href="/offer-care-services"
                  />
                </div>
              )}
            </ul>
          ) : (
            <ul>
              <li>
                <Spinner />
              </li>
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
});
