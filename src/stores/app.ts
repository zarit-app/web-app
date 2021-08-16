import { makeAutoObservable, runInAction } from "mobx";

import { firestore } from "@/firebase";
import firebase from "@/firebase";

import {
  AuthModal,
  AuthModalPages,
  Location,
  Province,
  Service,
} from "@/libs/types";
import { getLocalities, getProvinces, noAuthPaths } from "@/libs/utils";

import { RootStore } from ".";

class AppStore {
  rootStore;
  selectedServiceIndex: number | null = null;
  localities: Location[] = getLocalities();
  provinces: Province[] = getProvinces();
  liveLocalities: Location[] | null = null;
  liveProvinces: Province[] | null = null;
  authModal: AuthModal = {
    shown: false,
    page: null,
  };
  verifyEmailModalShown: boolean = false;
  routerPathName: string = "";
  openCheckout: boolean = false;
  serviceDetail: Service | null = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  setSelectedServiceIndex = (value: number) => {
    this.selectedServiceIndex = value;
  };

  setLocalities = (value: Location[]) => {
    this.localities = value;
  };

  setLiveLocalitiesAndProvinces = (
    provinces: Province[],
    localities: Location[]
  ) => {
    this.liveProvinces = provinces;
    this.liveLocalities = localities;
  };

  setModalVerifyEmail = (value: boolean) => {
    this.verifyEmailModalShown = value;
  };

  getActiveProvinces = async () => {
    const provinces = await firestore
      .collection("provinces")
      .where("active", "==", true)
      .get();
    const provincesDocs = provinces.docs;
    return provincesDocs.map((doc) => doc.data());
  };

  getActiveLocalitites = async () => {
    const localitites = await firestore
      .collection("localities")
      .where("active", "==", true)
      .get();
    const localititesDocs = localitites.docs;
    return localititesDocs.map((doc) => doc.data());
  };

  setRouterPath = (path: string) => {
    this.routerPathName = path;
  };

  get showFooter() {
    return noAuthPaths(this.routerPathName);
  }

  setAuthModalPage = (page: AuthModalPages) => {
    this.authModal.page = page;
  };

  openAuthModal = () => {
    runInAction(() => {
      this.authModal.shown = true;
    });
  };

  closeAuthModal = () => {
    runInAction(() => {
      this.authModal.shown = false;
      this.authModal.page = null;
    });
  };

  setOpenCheckout = (value: boolean) => {
    this.openCheckout = value;
  };

  setServiceDetail = (value: Service) => {
    this.serviceDetail = value;
  };

  getUserServiceInfo = (uid: string) => {
    return firebase.app().functions().httpsCallable("getUserPublicInfo")({
      uid,
    });
  };
}

export default AppStore;
