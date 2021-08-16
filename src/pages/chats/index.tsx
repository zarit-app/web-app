import { Spinner } from "@/components/Spinner";
import { firestore } from "@/firebase";
import { useLocale } from "@/hooks/useLocale";
import { ChatType } from "@/libs/types";
import { DocumentData, QuerySnapshot } from "@firebase/firestore-types";
import { autorun } from "mobx";
import router from "next/router";
import { useEffect, useState } from "react";
import { useStore } from "src/stores";
import styles from "./styles.module.css";

export default function Chats() {
  const { rootStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<ChatType[]>([]);
  const { L } = useLocale();

  const parseChats = (chatsDocs: QuerySnapshot<DocumentData>) => {
    let chatsList = chatsDocs.docs.map((doc) => doc.data() as ChatType);
    setChats(chatsList);
  };

  useEffect(
    () =>
      autorun(() => {
        if (!!rootStore.userStore.uid) {
          const getChats = async () => {
            setLoading(true);
            try {
              const chatsDocs = await firestore
                .collection("chats")
                .where("users", "array-contains", rootStore.userStore.uid)
                .orderBy("createdAt", "desc")
                .get();
              parseChats(chatsDocs);
            } catch (err) {
              console.log({ err });
            }
            setLoading(false);
          };
          getChats();
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className={styles.container}>
      <h2>{L("chats")}</h2>
      <>
        {loading ? (
          <Spinner />
        ) : chats.length ? (
          chats.map((chat) => <ChatElement key={chat.id} data={chat} />)
        ) : (
          <div>{L("no_chats")}</div>
        )}
      </>
    </div>
  );
}

interface ChatElementProps {
  data: ChatType;
}

const ChatElement = ({ data }: ChatElementProps) => {
  const { rootStore } = useStore();
  function capitalize(s: string) {
    return s && s[0].toUpperCase() + s.slice(1);
  }

  const name = capitalize(
    data.serviceOwnerUid === rootStore.userStore.uid
      ? data.userName
      : data.serviceOwnerName
  );

  return (
    <div
      className={styles.chatElement}
      onClick={() => {
        rootStore.chatStore.setData(data);
        router.push("/chats/chat");
      }}
    >
      <div className={styles.avatarContainer}>{name.charAt(0)}</div>
      <div className={styles.infoContainer}>
        <div className={styles.name}>{name}</div>
        <div className={styles.title}>{data.title}</div>
      </div>
      <div className={styles.unreadIndicatorContainer}>
        {!data.receiverHasRead &&
          data.lastMessageUid !== rootStore.userStore.uid && (
            <div className={styles.indicator} />
          )}
      </div>
    </div>
  );
};
