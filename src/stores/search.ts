import { makeAutoObservable } from "mobx";

import { ServiceTypes } from "@/libs/types";
import { RootStore } from ".";

class SearchStore {
  rootStore;
  locationId: string | null = null;
  provinceId: string | null = null;
  internal: boolean = false;
  servicesTypes: ServiceTypes[] = [];

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  setLocationId(value: string | null) {
    this.locationId = value;
  }

  setProvinceId(value: string | null) {
    this.provinceId = value;
  }

  setInternal(value: boolean) {
    this.internal = value;
  }

  setServicesTypes(value: ServiceTypes[]) {
    this.servicesTypes = value;
  }

  resetValues() {
    this.locationId = null;
    this.provinceId = null;
    this.internal = false;
    this.servicesTypes = [];
  }
}

export default SearchStore;
