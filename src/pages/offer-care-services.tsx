import React from "react";

import { useLocale } from "@/hooks/useLocale";
import styles from "@/styles/offer-care-services.module.css";
import { Button } from "@/components/Button";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAlert } from "react-alert";
import Head from "next/head";
import OfferCareImage from "@/images/offer_care_service.jpg";
import { useStore } from "src/stores";
import { observer } from "mobx-react-lite";

const ServiceButton = observer(() => {
  const { rootStore } = useStore();
  const { L } = useLocale();
  const router = useRouter();
  const alert = useAlert();

  function onSelectService(index: number) {
    rootStore.appStore.setSelectedServiceIndex(index);
  }

  function onServices() {
    onSelectService(0);
  }

  function onRegister() {
    if (
      rootStore.userStore.user?.firstName &&
      rootStore.userStore.user?.lastName
    ) {
      router.push("/my-account/register-service");
    } else {
      router.push("/my-account");
      alert.error(L("error_incomplete_user_info"));
    }
  }

  return (
    <>
      {rootStore.userStore.subscription.status !== "active" &&
      rootStore.userStore.subscription.status !== "trialing" ? (
        <Button
          text="register_service"
          type="button"
          variant="primary"
          disabled={false}
          style={{ maxWidth: "200px" }}
          href="/pricing"
        />
      ) : !!rootStore.userStore.user?.services?.length ? (
        <Button
          text="see_service"
          type="button"
          variant="primary"
          disabled={false}
          style={{ maxWidth: "200px" }}
          href="/my-account/services/service"
          onClick={onServices}
        />
      ) : (
        <Button
          text="register_service"
          type="button"
          variant="primary"
          disabled={false}
          style={{ maxWidth: "200px" }}
          onClick={onRegister}
        />
      )}
    </>
  );
});
export default function OfferCareServicres() {
  const { L } = useLocale();

  return (
    <div className={styles.container}>
      <Head>
        <title>{L("title_offer_service_care_page")}</title>
      </Head>
      <div style={{ height: "60px" }} />
      <div className={styles.topSection}>
        <div className={styles.leftSection}>
          <h1 className={styles.title}>{L("offer_care_services_title")}</h1>
          <p>{L("offer_care_services_subtitle")}</p>

          <div className={styles.buttonContainer}>
            <ServiceButton />
          </div>
        </div>
        <div className={styles.imgContainer}>
          <Image
            alt={L("offer_care_services_title")}
            src={OfferCareImage}
            className={styles.image}
            objectFit="cover"
          />
        </div>
      </div>
      <div style={{ height: 20 }} />
      <h2>{L("how_does_it_work")}</h2>
      <div className={styles.howWorkItemContainer}>
        <div className={styles.numberView}>1</div>
        <p>{L("offer_services_step_1")}</p>
      </div>
      <div className={styles.howWorkItemContainer}>
        <div className={styles.numberView}>2</div>
        <p>{L("offer_services_step_2")}</p>
      </div>
      <div className={styles.howWorkItemContainer}>
        <div className={styles.numberView}>3</div>
        <p>{L("offer_services_step_3")}</p>
      </div>
      <div style={{ height: "100px" }} />
    </div>
  );
}
