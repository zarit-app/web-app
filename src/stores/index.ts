import { createContext, useContext } from "react";
import AppStore from "src/stores/app";
import UserStore from "src/stores/user";
import ChatStore from "./chat";
import SearchStore from "./search";
import ServicesListStore from "./servicesList";

export class RootStore {
  appStore;
  userStore;
  searchStore;
  servicesListStore;
  chatStore;

  constructor() {
    this.appStore = new AppStore(this);
    this.userStore = new UserStore(this);
    this.searchStore = new SearchStore(this);
    this.servicesListStore = new ServicesListStore(this);
    this.chatStore = new ChatStore(this);
  }
}

interface IStore {
  rootStore: RootStore;
}

const store: IStore = {
  rootStore: new RootStore(),
};

export const StoreContext = createContext(store);

export const useStore = () => {
  return useContext(StoreContext);
};
