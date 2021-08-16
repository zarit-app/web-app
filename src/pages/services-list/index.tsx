import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import { Service } from "@/libs/types";
import styles from "@/styles/services-list.module.css";
import { useAlert } from "react-alert";
import { getMessageKey } from "@/libs/alertMessages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronCircleUp } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/Button";
import { FiltersModal } from "../../components/services-list/FiltersModal";
import { Loading } from "@/components/services-list/Loading";
import { useStore } from "src/stores";
import { Services } from "@/components/services-list/Services";
import { NoMoreServices } from "@/components/services-list/NoMoreServices";
import { autorun } from "mobx";

export default function ServiceList() {
  const router = useRouter();
  const { L } = useLocale();
  const alert = useAlert();
  const { rootStore } = useStore();

  async function getData() {
    if (rootStore.searchStore.locationId) {
      rootStore.servicesListStore.setLoading(true);
      try {
        const res = await rootStore.userStore.getServicesList({
          locationId: rootStore.searchStore.locationId,
          startAt: rootStore.servicesListStore.latestDoc,
          limit: 9,
        });
        if (res) {
          let array = res?.docs.map((doc) => {
            const s = doc.data() as Service;
            return s;
          });
          // filter services
          rootStore.searchStore.servicesTypes.length &&
            (array = array.filter(
              (s) =>
                !rootStore.searchStore.servicesTypes.filter(
                  (type) => !s.servicesTypes.includes(type)
                ).length
            ));
          !!rootStore.searchStore.internal &&
            (array = array.filter(
              (s) => rootStore.searchStore.internal === s.internal
            ));
          rootStore.servicesListStore.setLatestDoc(
            res.docs[res.docs.length - 1]
          );
          rootStore.servicesListStore.setHasMore(
            !!res.docs.length && res.docs.length === 9
          );
          rootStore.servicesListStore.setServices([
            ...rootStore.servicesListStore.services,
            ...array,
          ]);
        } else {
          throw "err";
        }
      } catch (err) {
        const message = getMessageKey(err.code);
        alert.error(L(message));
      }
      rootStore.servicesListStore.setLoading(false);
    }
  }

  useEffect(() => {
    getData();
    return () => {
      rootStore.servicesListStore.resetValues();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () =>
      autorun(() => {
        if (
          rootStore.servicesListStore.page > 0 &&
          rootStore.servicesListStore.latestDoc
        ) {
          getData();
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(
    () =>
      autorun(() => {
        if (!rootStore.searchStore.locationId) {
          router.replace("/search");
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const buttonContent = (
    <div className={styles.flex}>
      {L("filters")}
      <FontAwesomeIcon
        icon={faChevronCircleUp}
        className={styles.iconFiltersOpen}
      ></FontAwesomeIcon>
    </div>
  );

  return (
    <div className={styles.container}>
      <h1>{L("services_list")}</h1>
      <div style={{ height: 50 }} />
      <Services />

      <div className={styles.filterContainer}>
        <Button
          info={buttonContent}
          type="button"
          variant="primary"
          disabled={false}
          style={{ maxWidth: "200px" }}
          onClick={() => rootStore.servicesListStore.setShowFiltersModal(true)}
        />
      </div>
      <Loading />
      <NoMoreServices />
      <div style={{ height: 100 }} />
      <FiltersModal />
    </div>
  );
}
