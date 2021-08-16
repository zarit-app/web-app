import React from "react";
import { useLocale } from "@/hooks/useLocale";
import styles from "@/styles/index.module.css";
import { Button } from "@/components/Button";
import { AllKeysOfLanguage } from "@/libs/locale";
import Image from "next/image";
import Head from "next/head";
import OldCareImage from "@/images/old_care.jpg";
import CareServicesImage from "@/images/care_services.jpeg";
import { TextLink } from "@/components/TextLink";
import { useStore } from "src/stores";
import { observer } from "mobx-react-lite";

interface Element {
  title: AllKeysOfLanguage;
  description: AllKeysOfLanguage;
}

const ELEMENTS: Element[] = [
  {
    title: "tranquility",
    description: "tranquility_description",
  },
  { title: "safety", description: "safety_description" },
  { title: "confidence", description: "confidence_description" },
];

const ProvideCareServicesButton = observer(() => {
  const { rootStore } = useStore();
  const { L } = useLocale();
  return (
    <>
      {!rootStore.userStore.user?.services?.length && (
        <>
          <div style={{ height: "60px" }} />
          <div className={styles.contactInfo}>
            <h3>{L("prodvide_care_services")}</h3>
            <Button
              text="register_service"
              disabled={false}
              type="button"
              variant="primary"
              href="/offer-care-services"
            />
          </div>
        </>
      )}
    </>
  );
});

export default function Home() {
  const { L } = useLocale();

  function Element({ title, description }: Element) {
    return (
      <div className={styles.elementContainer}>
        <h3>{L(title)}</h3>
        <span>{L(description)}</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{L("title_home_page")}</title>
        <meta name="description" content={L("care_services_title")} />
      </Head>
      <div style={{ height: "60px" }} />
      <div className={styles.topSection}>
        <div className={styles.leftSection}>
          <h1 className={styles.title}>{L("care_services_title")}</h1>
          <h2 className={styles.subTitle}>{L("care_services_subtitle")}</h2>
          <div className={styles.buttonContainer}>
            <Button
              text="start_searching"
              type="button"
              variant="primary"
              disabled={false}
              style={{ maxWidth: "200px" }}
              href="/search"
            />
          </div>
        </div>
        <div className={styles.imgContainer}>
          <Image
            alt={L("care_services_title")}
            src={OldCareImage}
            className={styles.image}
            objectFit="cover"
          />
        </div>
      </div>
      <div style={{ height: "60px" }} />
      <div className={styles.elementsContainer}>
        {ELEMENTS.map((element, index) => (
          <Element
            title={element.title}
            description={element.description}
            key={index}
          />
        ))}
      </div>
      <ProvideCareServicesButton />
      <div style={{ height: "80px" }} />
      <div className={styles.topSection}>
        <div className={styles.leftSection}>
          <h1 className={styles.title}>{L("find_person_you_need")}</h1>
          <h2 className={styles.subTitle}>{L("professionals_in_your_area")}</h2>
          <div style={{ height: "40px" }} />
        </div>
        <div className={styles.imgContainer}>
          <Image
            alt={L("find_person_you_need")}
            src={CareServicesImage}
            className={styles.image}
            objectFit="cover"
          />
        </div>
      </div>
      <div style={{ height: "80px" }} />
      <div className={styles.contactInfo}>
        <h3>{L("contact_info_description")}</h3>
        <TextLink
          text={"soporte@zarit.es"}
          href="mailto:soporte@zarit.es"
        />
      </div>
      <div style={{ height: "100px" }} />
    </div>
  );
}
