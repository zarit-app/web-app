import Resizer from "react-image-file-resizer";

import localities from "@/assets/localities.json";
import provinces from "@/assets/provinces.json";

import firebase from "firebase/app";

import {
  faBath,
  faBroom,
  faFileMedical,
  faGamepad,
  faPills,
  faShoppingBasket,
  faSyringe,
  faUtensils,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { ServiceTypes } from "./types";
import { AllKeysOfLanguage } from "./locale";

export const resizeFile = (file: Blob): Promise<Blob> =>
  new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      300,
      300,
      "JPEG",
      50,
      0,
      (uri) => {
        resolve(uri as Blob);
      },
      "blob"
    );
  });

export function generateRandomNumber(maxNum: number) {
  return Math.floor(Math.random() * maxNum) + 1;
}

export function getLocalities() {
  return Object.values(localities).map(({ id, name, provinceId }) => {
    return {
      id,
      name,
      provinceId,
    };
  });
}

export function getProvinces() {
  return Object.values(provinces).map(({ id, name }) => {
    return {
      id,
      name,
    };
  });
}

/* interface KeyValueBooleanObject {
  [key: string]: boolean;
}

export function constructKeyValueBooleanObject(array: string[]) {
  let result: KeyValueBooleanObject = {};
  for (let i = 0; i < array.length; i++) {
    result[array[i]] = true;
  }
  return result;
}

export function constructArrayFromKeyValueBooleanObject(
  object: KeyValueBooleanObject
) {
  return Object.keys(object);
} */

type ServiceTypeElement = {
  icon: IconDefinition;
  type: ServiceTypes;
  title: AllKeysOfLanguage;
  description: AllKeysOfLanguage;
};

export const SERVICE_TYPES: ServiceTypeElement[] = [
  {
    icon: faShoppingBasket,
    type: "shopping",
    title: "shopping_title",
    description: "shopping_description",
  },
  {
    icon: faFileMedical,
    type: "medical_appointments",
    title: "medical_appointments_title",
    description: "medical_appointments_description",
  },
  {
    icon: faBath,
    type: "personal_cleanliness",
    title: "personal_cleanliness_title",
    description: "personal_cleanliness_description",
  },
  {
    icon: faGamepad,
    type: "activities",
    title: "activities_title",
    description: "activities_description",
  },
  {
    icon: faBroom,
    type: "cleaning",
    title: "cleaning_title",
    description: "cleaning_description",
  },
  {
    icon: faPills,
    type: "medication",
    title: "medication_title",
    description: "medication_description",
  },
  {
    icon: faUtensils,
    type: "cuisine",
    title: "cuisine_title",
    description: "cuisine_description",
  },
  {
    icon: faSyringe,
    type: "cures",
    title: "cures_title",
    description: "cures_description",
  },
];

export const getFirebaseTimestamp = (date: Date) => {
  return firebase.firestore.Timestamp.fromDate(date);
};

export function getRatingText(rating: number): AllKeysOfLanguage {
  if (rating >= 9) {
    return "excellent";
  } else if (rating >= 8) {
    return "fabulous";
  } else if (rating >= 7) {
    return "very_good";
  } else if (rating >= 6) {
    return "good";
  } else {
    return "ok";
  }
}

export function noAuthPaths(path: string) {
  return (
    path === "/" ||
    path === "/privacy" ||
    path === "/terms" ||
    path === "/offer-care-services" ||
    path === "/cookies" ||
    path === "/services-list" ||
    path === "/service-detail" ||
    path === "/search" ||
    path === "/pricing"
  );
}
