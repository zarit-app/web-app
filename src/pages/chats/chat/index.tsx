import React, { useEffect } from "react";

import styles from "./styles.module.css";

import { TopInfoSection } from "@/components/chats/chat/TopInfoSection";
import { MidMessagesSection } from "@/components/chats/chat/MidMessagesSection";
import { BottomInputSection } from "@/components/chats/chat/BottomInputSection";
import { observer } from "mobx-react-lite";
import { useStore } from "src/stores";
import { Spinner } from "@/components/Spinner";
import router from "next/router";

export default function Chat() {
  const { rootStore } = useStore();
  const refSection = React.createRef<HTMLDivElement>();

  useEffect(() => {
    const section = refSection.current;
    if (section) {
      section.style.maxHeight = `${window.innerHeight}px`;
    }
  }, [refSection]);

  useEffect(() => {
    !rootStore.chatStore.completeData && router.push("/chats");
  }, [rootStore.chatStore.completeData]);

  useEffect(() => {
    const data = async () => {
      try {
        const exists = await rootStore.chatStore.chatExists();
        if (exists) {
          rootStore.chatStore.subscribeToChatMessages();
        }
      } catch (err) {
        console.log({ err });
      }
    };
    data();
    return () => {
      rootStore.chatStore.unsubscribeFromChatMessages();
      rootStore.chatStore.resetValues();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container} ref={refSection}>
      <div className={styles.subContainer}>
        <Content />
      </div>
    </div>
  );
}

const Content = observer(() => {
  const { rootStore } = useStore();
  return (
    <>
      {rootStore.chatStore.loading ? (
        <Spinner />
      ) : (
        <>
          <TopInfoSection />
          <MidMessagesSection />
          <BottomInputSection />
        </>
      )}
    </>
  );
});
