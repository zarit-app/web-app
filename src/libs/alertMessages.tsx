import { AllKeysOfLanguage } from "./locale";

export const getMessageKey = (messageCode: string): AllKeysOfLanguage => {
  switch (messageCode) {
    case "auth/user-not-found":
    case "auth/email-already-exists":
    case "auth/invalid-email":
    case "auth/invalid-password":
    case "auth/wrong-password":
    case "success_forgot_passowrd":
    case "auth/weak-password":
    case "auth/email-already-in-use":
      return messageCode;
    case "auth/requires-recent-login":
      return "relogin_to_action";
    default:
      return "error_default";
  }
};
