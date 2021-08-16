import { makeAutoObservable, runInAction } from "mobx";

import { auth, firestore, storage } from "@/firebase";

import {
  GetServicesListProps,
  OnSnapshotObserver,
  Review,
  Service,
  SubscriptionType,
  User,
} from "@/libs/types";
import { RootStore } from ".";
import { noAuthPaths } from "@/libs/utils";

class UserStore {
  rootStore;
  user: User | null = null;
  services: Service[] | null = null;
  subscription: SubscriptionType = {
    status: null,
    type: null,
    previousSubscriptions: false,
    loaded: false,
  };
  initializedUser: boolean = false;
  refreshedCurrentUserServices: boolean = false;
  checkUserSubscription: any;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  setInitializedUser = (value: boolean) => {
    this.initializedUser = value;
  };

  setRefreshedCurrentUserServices = (value: boolean) => {
    this.refreshedCurrentUserServices = value;
  };

  setUser = (value: User | null) => {
    this.user = value;
  };

  setSubscription = (value: SubscriptionType) => {
    this.subscription = value;
  };

  getDatabaseUser = () => {
    return firestore.collection("users").doc(this.uid).get();
  };

  setFirstAndLastName = (firstName: string, lastName: string) => {
    return firestore
      .collection("users")
      .doc(this.uid)
      .update({ firstName, lastName });
  };

  getUserServices = () => {
    return firestore.collection("services").where("uid", "==", this.uid).get();
  };

  getCurrentServices = (uid: string) => {
    return firestore.collection("services").where("uid", "==", uid).get();
  };

  updateService = (service: Service) => {
    return firestore.collection("services").doc(service.id).update(service);
  };

  registerService = (service: Service) => {
    return firestore.collection("services").doc(service.id).set(service);
  };

  getRefNewService = () => {
    return firestore.collection("services").doc();
  };

  getServicesList = ({ locationId, startAt, limit }: GetServicesListProps) => {
    var query = firestore
      .collection("services")
      .where("active", "==", true)
      .where("available", "==", true)
      .where("localities", "array-contains", locationId);
    // comment order
    //query = query.orderBy("createdAt");
    if (startAt) {
      query = query.startAfter(startAt);
    }
    return query.limit(limit).get();
  };

  deleteService = async (id: string) => {
    await this.deleteServiceImages(id);
    await firestore.collection("services").doc(id).delete();
  };

  deleteServiceImages = async (id: string) => {
    const list = await storage.ref(`images/services/${id}`).listAll();
    await Promise.all(
      list.items.map(async (item) => {
        const path = item.fullPath;
        const deleteRef = storage.ref(path);
        await deleteRef.delete();
      })
    );
  };

  deleteUserServices = async () => {
    const servicesSnapshot = await this.getUserServices();
    const services = servicesSnapshot.docs.map((service) => service.id);
    services.map(async (id) => {
      await this.deleteService(id);
    });
    await Promise.all(services);
  };

  deleteAccount = async () => {
    await this.deleteUserServices();
    await firestore.collection("users").doc(this.uid).delete();
    await auth.currentUser?.delete();
  };

  resetPassword = (email: string) => {
    return auth.sendPasswordResetEmail(email);
  };

  updateEmail = (email: string) => {
    return auth.currentUser?.updateEmail(email);
  };

  updateDatabaseEmail = (email: string, uid: string) => {
    return firestore.collection("users").doc(uid).update({ email });
  };

  updateUser = (user: User) => {
    return firestore
      .collection("users")
      .doc(user.uid)
      .set({ ...user }, { merge: true });
  };

  updateDatabaseEmailVerified = (verified: boolean, uid: string) => {
    return firestore
      .collection("users")
      .doc(uid)
      .update({ emailVerified: verified });
  };

  createUserDatabase = (user: User) => {
    return firestore.collection("users").doc(user.uid).set(user);
  };

  findUserDatabase = (uid: string) => {
    return firestore.collection("users").doc(uid).get();
  };

  getLastSignInTime = () => {
    return new Date(auth.currentUser?.metadata.lastSignInTime || "");
  };

  createCheckoutSession = (
    userUid: string,
    price: string,
    success_url: string,
    cancel_url: string,
    trial_from_plan: boolean
  ) => {
    return firestore
      .collection("users")
      .doc(userUid)
      .collection("checkout_sessions")
      .add({ price, trial_from_plan, success_url, cancel_url });
  };

  onCheckUserSubscription = (uid: string, observer: OnSnapshotObserver) => {
    return firestore
      .collection("users")
      .doc(uid)
      .collection("subscriptions")
      .onSnapshot(observer);
  };

  sendReview = (review: Review) => {
    return firestore.collection("reviews").doc(review.id).set(review);
  };

  getUserReview = (uid: string, serviceId: string) => {
    const id = uid + "_" + serviceId;
    return firestore.collection("reviews").doc(id).get();
  };

  sendEmailVerification = () => {
    return auth.currentUser?.sendEmailVerification();
  };

  signup = (email: string, password: string) => {
    return auth.createUserWithEmailAndPassword(email, password);
  };

  login = (email: string, password: string) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  logout = () => {
    return auth.signOut();
  };

  requireLogin = (path: string) => {
    return !this.user && !noAuthPaths(path);
  };

  refreshCurentUser = async () => {
    try {
      await auth.currentUser?.reload();
      const userDatabase = await this.getDatabaseUser();
      if (userDatabase && userDatabase.exists) {
        const user = userDatabase.data() as User;
        user.emailVerified = !!auth.currentUser?.emailVerified;
        if (this.user?.emailVerified !== !!auth.currentUser?.emailVerified) {
          this.updateDatabaseEmailVerified(
            !!auth.currentUser?.emailVerified,
            this.user?.uid || ""
          );
        }
        this.setUser({ ...this.user, ...user });
      }
    } catch (err) {
      throw err;
    }
  };

  getCurrentUserServices = async (uid: string) => {
    const res = await this.getCurrentServices(uid);
    let services: Service[] = [];
    res?.docs.map((doc: any) => {
      const s = doc.data() as Service;
      services.push(s);
    });
    return services;
  };

  refreshCurrentUserServices = async () => {
    if (this.user) {
      const res = await this.getUserServices();
      let services: Service[] = [];
      res?.docs.map((doc: any) => {
        const s = doc.data() as Service;
        services.push(s);
      });
      this.setUser({ ...this.user, services });
    }
  };

  get uid() {
    return this.user?.uid || "";
  }

  subscribeOnCheckUserSubscription = () => {
    const observer: OnSnapshotObserver = {
      next: (snap) => {
        if (!snap.empty) {
          let data;
          const filteredArray = snap.docs.filter(
            (doc) =>
              doc.data().status === "active" || doc.data().status === "trailing"
          );
          if (filteredArray.length) {
            data = filteredArray[0].data();
          } else {
            data = snap.docs[0].data();
          }
          this.setSubscription({
            status: data.status,
            type: "basic",
            previousSubscriptions: true,
            loaded: true,
          });
        } else {
          this.setSubscription({
            status: null,
            type: "basic",
            previousSubscriptions: false,
            loaded: true,
          });
        }
      },
      error: (err: any) => console.log({ err }),
    };
    runInAction(() => {
      this.checkUserSubscription = this.onCheckUserSubscription(
        this.uid,
        observer
      );
    });
  };

  unsubscribeCheckUserSubscription = () => {
    if (this.checkUserSubscription) {
      runInAction(() => {
        this.checkUserSubscription();
        this.checkUserSubscription = null;
      });
    }
  };

  resetValues = () => {
    this.user = null;
    this.services = null;
    this.subscription = {
      status: null,
      type: null,
      previousSubscriptions: false,
      loaded: false,
    };
    this.initializedUser = false;
    this.refreshedCurrentUserServices = false;
  };
}

export default UserStore;
