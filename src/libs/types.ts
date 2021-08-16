import {
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  Timestamp,
} from "@firebase/firestore-types";
import { AllKeysOfLanguage } from "./locale";

export type User = {
  uid: string;
  createdAt: Timestamp;
  email: string;
  role: "admin" | "customer";
  firstName: string;
  lastName: string;
  services?: Service[];
  emailVerified: boolean;
  phoneNumber: string;
};

export type Service = {
  title: string;
  extraInfo: string;
  description: string;
  localities: string[];
  uid: string;
  active: boolean;
  createdAt: Timestamp;
  id: string;
  imageUrl: string[];
  internal: boolean;
  available: boolean;
  updatedAt: Timestamp;
  servicesTypes: ServiceTypes[];
  reviews: ReviewsObject;
};

export interface ReviewsObject {
  rating: number;
  count: number;
  mostTwoRecentReviews: Review[];
}

export interface DateTimeFormatOptions {
  localeMatcher?: "lookup" | "best fit";
  weekday?: "long" | "short" | "narrow";
  era?: "long" | "short" | "narrow";
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "numeric" | "2-digit";
  timeZoneName?: "long" | "short";
  formatMatcher?: "basic" | "best fit";
  hour12?: boolean;
  timeZone?: string; // this is more complicated than the others, not sure what I expect here
}

export interface SearchParameters {
  locationId: string | null;
  provinceId: string | null;
  internal: boolean;
  servicesTypes: ServiceTypes[];
}

export type Location = {
  id: string;
  name: string;
  provinceId: string;
};

export type Province = {
  id: string;
  name: string;
};

export interface CustomAlert {
  message: AllKeysOfLanguage;
  variant: AlertVariants;
}

export type AlertVariants = "danger" | "success";

export type GetServicesListProps = {
  locationId: string;
  startAt: DocumentData | null;
  limit: number;
};

export type onChangeSelectProps = {
  value: string;
  label: string;
} | null;

export type onChangeMultiSelectProps = {
  value: string;
  label: string;
}[];

export type onChangeMultiSelectPropsServices = {
  value: ServiceTypes;
  label: string;
}[];

export type OnSnapshotObserver = {
  next?: ((snapshot: QuerySnapshot<DocumentData>) => void) | undefined;
  error?: ((error: FirestoreError) => void) | undefined;
  complete?: (() => void) | undefined;
};

export type SubscriptionType = {
  status: SubscriptionStatus | null;
  type: "basic" | null;
  previousSubscriptions: boolean;
  loaded: boolean;
};

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "trialing";

export type ServiceTypes =
  | "shopping"
  | "medical_appointments"
  | "personal_cleanliness"
  | "activities"
  | "cleaning"
  | "medication"
  | "cuisine"
  | "cures";

export interface Review {
  id: string;
  userId: string;
  serviceId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userFirstName: string;
}

export type AuthModal = {
  shown: boolean;
  page: AuthModalPages;
};

export type AuthModalPages = "recover" | "login" | "register" | null;

export type MessageType = {
  id: string;
  message: string;
  createdAt: Timestamp;
  uid: string;
};

export type ChatType = {
  id: string;
  uid: string;
  serviceOwnerUid: string;
  serviceOwnerEmail: string;
  serviceId: string;
  title: string;
  serviceOwnerName: string;
  userName: string;
  userEmail: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  receiverHasRead: boolean;
  lastMessageUid: string;
};

export type UpdateChatsProps = {
  updatedAt?: Timestamp;
  receiverHasRead?: boolean;
  lastMessageUid?: string;
  serviceOwnerEmail?: string;
  userEmail?: string;
  receiverRemainderSent?: boolean;
};
