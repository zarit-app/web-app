import { useStore } from "src/stores";
import styles from "./styles.module.css";

export const TopInfoSection = () => {
  const { rootStore } = useStore();
  const chatStore = rootStore.chatStore;
  const name = capitalize(
    chatStore.serviceOwnerUid === rootStore.userStore.uid
      ? chatStore.userName
      : chatStore.serviceOwnerName
  );

  function capitalize(s: string) {
    return s && s[0].toUpperCase() + s.slice(1);
  }
  return (
    <div className={styles.topInfoSection}>
      <div className={styles.avatarContainer}>{name.charAt(0)}</div>
      <div className={styles.infoContainer}>
        <div className={styles.name}>{name}</div>
        <div className={styles.title}>{chatStore.title}</div>
      </div>
    </div>
  );
};
