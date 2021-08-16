import { firestore } from "@/firebase";
import {
  ChatType,
  MessageType,
  OnSnapshotObserver,
  UpdateChatsProps,
} from "@/libs/types";
import { getFirebaseTimestamp } from "@/libs/utils";
import { Timestamp } from "@firebase/firestore-types";
import { makeAutoObservable, runInAction } from "mobx";
import { RootStore } from ".";

class ChatStore {
  rootStore;
  id = "";
  uid = "";
  serviceOwnerUid = "";
  serviceOwnerEmail = "";
  serviceId = "";
  title = "";
  serviceOwnerName = "";
  userName = "";
  userEmail = "";
  createdAt: Timestamp | null = null;
  messages: MessageType[] = [];
  loading = false;
  sendingMessage = false;
  chatMessagesSubscription: any = null;
  updatedAt: Timestamp | null = null;
  receiverHasRead = true;
  lastMessageUid = "";

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setData = (data: ChatType) => {
    this.uid = data.uid;
    this.serviceOwnerUid = data.serviceOwnerUid;
    this.serviceOwnerEmail = data.serviceOwnerEmail;
    this.serviceId = data.serviceId;
    this.title = data.title;
    this.serviceOwnerName = data.serviceOwnerName;
    this.createdAt = data.createdAt;
    this.id = data.id;
    this.userName = data.userName;
    this.userEmail = data.userEmail;
    this.updatedAt = data.updatedAt;
    this.receiverHasRead = data.receiverHasRead;
    this.lastMessageUid = data.lastMessageUid;
  };

  sendMessage = async (messageObject: MessageType) => {
    this.setSendingMessage(true);
    if (this.isFirstMessage) {
      await this.createChatDatabase();
      this.subscribeToChatMessages();
    }
    await this.addMessageDatabase(messageObject);
    this.setSendingMessage(false);
  };

  setSendingMessage = (value: boolean) => {
    this.sendingMessage = value;
  };

  createChatDatabase = () => {
    return firestore
      .collection("chats")
      .doc(this.id)
      .set({
        id: this.id,
        uid: this.uid,
        serviceOwnerUid: this.serviceOwnerUid,
        serviceOwnerEmail: this.serviceOwnerEmail,
        serviceId: this.serviceId,
        title: this.title,
        serviceOwnerName: this.serviceOwnerName,
        userName: this.userName,
        userEmail: this.userEmail,
        createdAt: this.createdAt,
        createdBy: this.rootStore.userStore.uid,
        users: [this.serviceOwnerUid, this.uid],
        updatedAt: this.updatedAt,
        receiverHasRead: this.receiverHasRead,
        lastMessageUid: this.lastMessageUid,
        receiverRemainderSent: false,
      });
  };

  addMessageDatabase = (messageObject: MessageType) => {
    return firestore
      .collection("chats")
      .doc(this.id)
      .collection("messages")
      .add(messageObject);
  };

  listenChatMessages = (observer: OnSnapshotObserver) => {
    return firestore
      .collection("chats")
      .doc(this.id)
      .collection("messages")
      .orderBy("createdAt")
      .onSnapshot(observer);
  };

  setMessage = (messageObject: MessageType) => {
    this.messages = [...this.messages, messageObject];
  };

  getNewChatId = () => {
    return firestore.collection("chats").doc().id;
  };

  get isFirstMessage() {
    return this.messages.length === 0;
  }

  chatExists = async () => {
    const chat = await firestore.collection("chats").doc(this.id).get();
    return chat.exists;
  };

  subscribeToChatMessages = () => {
    const observer: OnSnapshotObserver = {
      next: (snap) => {
        if (!snap.empty) {
          snap.docChanges().forEach((change) => {
            if (change.type === "added") {
              this.setMessage(change.doc.data() as MessageType);
            }
            /* if (change.type === "modified") {
              console.log("Modified message: ", change.doc.data());
            }
            if (change.type === "removed") {
              console.log("Removed message: ", change.doc.data());
            } */
          });

          const message = snap.docs[snap.docs.length - 1].data() as MessageType;
          if (message.uid !== this.rootStore.userStore.uid) {
            this.updateChat({
              updatedAt: getFirebaseTimestamp(new Date()),
              receiverHasRead: true,
            });
          }
        }
      },
      error: (err: any) => console.log({ err }),
    };
    runInAction(() => {
      if (this.completeData && this.chatMessagesSubscription === null) {
        this.chatMessagesSubscription = this.listenChatMessages(observer);
      }
    });
  };

  unsubscribeFromChatMessages = () => {
    if (this.chatMessagesSubscription) {
      runInAction(() => {
        this.chatMessagesSubscription();
        this.chatMessagesSubscription = null;
      });
    }
  };

  get completeData() {
    return (
      this.id &&
      this.serviceId &&
      this.serviceOwnerName &&
      this.title &&
      this.uid &&
      this.serviceOwnerUid
    );
  }

  updateChat = ({
    updatedAt,
    receiverHasRead,
    lastMessageUid,
    userEmail,
    serviceOwnerEmail,
    receiverRemainderSent,
  }: UpdateChatsProps) => {
    updatedAt && (this.updatedAt = updatedAt);
    receiverHasRead && (this.receiverHasRead = receiverHasRead);
    lastMessageUid && (this.lastMessageUid = lastMessageUid);
    userEmail && (this.userEmail = userEmail);
    serviceOwnerEmail && (this.serviceOwnerEmail = serviceOwnerEmail);
    const data = {
      ...(updatedAt && { updatedAt }),
      ...(receiverHasRead !== undefined && { receiverHasRead }),
      ...(lastMessageUid && { lastMessageUid }),
      ...(userEmail && { userEmail }),
      ...(serviceOwnerEmail && { serviceOwnerEmail }),
      ...(receiverRemainderSent && { receiverRemainderSent }),
    };
    return firestore.collection("chats").doc(this.id).update(data);
  };

  get isServiceOwner() {
    return this.serviceOwnerUid === this.rootStore.userStore.uid;
  }

  resetValues = () => {
    this.id = "";
    this.uid = "";
    this.serviceOwnerUid = "";
    this.serviceId = "";
    this.title = "";
    this.serviceOwnerName = "";
    this.userName = "";
    this.createdAt = null;
    this.messages = [];
    this.loading = false;
    this.sendingMessage = false;
    this.updatedAt = null;
    this.receiverHasRead = true;
    this.lastMessageUid = "";
    this.userEmail = "";
    this.serviceOwnerEmail = "";
  };
}

export default ChatStore;
