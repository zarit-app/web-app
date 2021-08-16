import { Service, ServiceTypes } from "@/libs/types";
import { DocumentData } from "@firebase/firestore-types";
import { makeAutoObservable } from "mobx";
import { RootStore } from ".";

class ServicesListStore {
  rootStore;
  loading = false;
  services: Service[] = [];
  latestDoc: DocumentData | null = null;
  page: number = 0;
  hasMore = false;
  showFiltersModal = false;
  servicesTypes: ServiceTypes[] = [];
  internal: boolean = false;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  setLoading(value: boolean) {
    this.loading = value;
  }

  setServices(value: Service[]) {
    this.services = value;
  }

  setLatestDoc(value: DocumentData | null) {
    this.latestDoc = value;
  }

  setPage(value: number) {
    this.page = value;
  }

  setHasMore(value: boolean) {
    this.hasMore = value;
  }

  setInternal(value: boolean) {
    this.internal = value;
  }

  setShowFiltersModal(value: boolean) {
    this.showFiltersModal = value;
  }

  setServicesTypes(value: ServiceTypes[]) {
    this.servicesTypes = value;
  }

  resetValues() {
    this.setShowFiltersModal(false);
    this.setServices([]);
    this.setPage(0);
    this.setLatestDoc(null);
  }
}

export default ServicesListStore;
