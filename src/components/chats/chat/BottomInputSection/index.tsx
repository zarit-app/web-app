import { Spinner } from "@/components/Spinner";
import { getFirebaseTimestamp } from "@/libs/utils";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react-lite";
import { useRef } from "react";
import { useStore } from "src/stores";
import styles from "./styles.module.css";

export const BottomInputSection = observer(() => {
  const { rootStore } = useStore();

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.bottomInputSection}>
      <div className={styles.inputContainer}>
        <div className={styles.inputSubContainer}>
          <input className={styles.input} ref={inputRef} />
        </div>
      </div>
      <div className={styles.sendButton}>
        {rootStore.chatStore.sendingMessage ? (
          <Spinner />
        ) : (
          <FontAwesomeIcon
            icon={faPaperPlane}
            className={styles.iconSend}
            onClick={async () => {
              try {
                if (!!inputRef.current?.value) {
                  const messageObject = {
                    id: Math.random().toString(),
                    message: inputRef.current.value,
                    createdAt: getFirebaseTimestamp(new Date()),
                    uid: rootStore.userStore.uid,
                  };
                  await rootStore.chatStore.sendMessage(messageObject);
                  await rootStore.chatStore.updateChat({
                    updatedAt: getFirebaseTimestamp(new Date()),
                    receiverHasRead: false,
                    lastMessageUid: rootStore.userStore.uid,
                    serviceOwnerEmail: rootStore.chatStore.isServiceOwner
                      ? rootStore.userStore.user?.email
                      : undefined,
                    userEmail: !rootStore.chatStore.isServiceOwner
                      ? rootStore.userStore.user?.email
                      : undefined,
                    receiverRemainderSent: false,
                  });
                  inputRef.current.value = "";
                }
              } catch (err) {
                console.log({ err });
              }
            }}
          />
        )}
      </div>
    </div>
  );
});
