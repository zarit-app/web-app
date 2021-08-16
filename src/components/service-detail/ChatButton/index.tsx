import { Button } from "@/components/Button";
import { ChatType } from "@/libs/types";
import { getFirebaseTimestamp } from "@/libs/utils";
import { useRouter } from "next/router";
import { useStore } from "src/stores";

interface ChatButtonProps {
  uid: string;
  serviceOwnerUid?: string;
  serviceOwnerEmail?: string;
  serviceId?: string;
  loading: boolean;
  title?: string;
  serviceOwnerName: string;
  userName?: string;
  userEmail?: string;
}

export const ChatButton = ({
  uid,
  serviceId,
  serviceOwnerUid,
  serviceOwnerEmail,
  loading,
  title,
  serviceOwnerName,
  userName,
  userEmail,
}: ChatButtonProps) => {
  const router = useRouter();
  const { rootStore } = useStore();

  return (
    <Button
      text="chat"
      variant="primary"
      type="button"
      disabled={false}
      onClick={() => {
        if (
          !(
            !uid ||
            !serviceOwnerUid ||
            !serviceOwnerEmail ||
            !serviceId ||
            !title ||
            !serviceOwnerName ||
            !userName ||
            !userEmail ||
            serviceOwnerUid === uid
          )
        ) {
          let createdAt = getFirebaseTimestamp(new Date());
          let updatedAt = getFirebaseTimestamp(new Date());
          let id = rootStore.chatStore.getNewChatId();
          let chat: ChatType = {
            uid,
            serviceOwnerUid,
            serviceOwnerEmail,
            serviceId,
            title,
            serviceOwnerName,
            createdAt,
            id,
            userName,
            userEmail,
            updatedAt,
            lastMessageUid: "",
            receiverHasRead: true,
          };
          rootStore.chatStore.setData(chat);
          router.push("/chats/chat");
        } else {
          if (!uid) {
            rootStore.appStore.openAuthModal();
          }
        }
      }}
      loading={loading}
    />
  );
};
