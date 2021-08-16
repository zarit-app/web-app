import { observer } from "mobx-react-lite";
import React, { createRef, useEffect } from "react";
import { useStore } from "src/stores";
import styles from "./styles.module.css";

export const MidMessagesSection = () => {
  const refCont = createRef<HTMLDivElement>();

  useEffect(() => {
    const cont = refCont.current;
    if (cont) {
      setTimeout(() => {
        cont.style.height = `${window.innerHeight - 64 - 60 - 60}px`;
        cont.style.maxHeight = `${window.innerHeight - 64 - 60 - 60}px`;
      }, 100);
    }
  }, [refCont]);

  return (
    <div className={styles.midMessagesSection} ref={refCont}>
      <div className={styles.container}>
        <Messages />
        <ScrollElement />
      </div>
    </div>
  );
};

interface MessageProps {
  message: string;
}

const MyMessage = ({ message }: MessageProps) => {
  return (
    <div className={styles.myMessageContainer}>
      <div className={styles.myMessageSubContainer}>{message}</div>
    </div>
  );
};

const UserMessage = ({ message }: MessageProps) => {
  return (
    <div className={styles.userMessageContainer}>
      <div className={styles.userMessageSubContainer}>{message}</div>
    </div>
  );
};

const Messages = observer(() => {
  const { rootStore } = useStore();
  const uid = rootStore.userStore.uid;

  return (
    <>
      {rootStore.chatStore.messages.map((messageObject) => {
        if (messageObject.uid === uid) {
          return (
            <MyMessage message={messageObject.message} key={messageObject.id} />
          );
        } else {
          return (
            <UserMessage
              message={messageObject.message}
              key={messageObject.id}
            />
          );
        }
      })}
    </>
  );
});

const ScrollElement = observer(() => {
  const scrollRef = createRef<HTMLDivElement>();
  const { rootStore } = useStore();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rootStore.chatStore.messages, scrollRef]);

  return <div ref={scrollRef}></div>;
});
