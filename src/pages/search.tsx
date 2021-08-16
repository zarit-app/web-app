import React, { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { useLocale } from "@/hooks/useLocale";

import styles from "@/styles/search.module.css";
import ReactSelect from "react-select";
import { Location, onChangeSelectProps, Province } from "@/libs/types";
import { Spinner } from "@/components/Spinner";
import { useAlert } from "react-alert";
import { getMessageKey } from "@/libs/alertMessages";
import Head from "next/head";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { useStore } from "src/stores";

export default function Search() {
  const { L } = useLocale();
  const [loading, setLoading] = useState(false);
  const alert = useAlert();
  const { rootStore } = useStore();

  useEffect(() => {
    async function getData() {
      setLoading(true);
      try {
        const provinces =
          (await rootStore.appStore.getActiveProvinces()) as Province[];
        const localities =
          (await rootStore.appStore.getActiveLocalitites()) as Location[];
        rootStore.appStore.setLiveLocalitiesAndProvinces(provinces, localities);
      } catch (err) {
        const message = getMessageKey(err.code);
        alert.error(L(message));
      }
      setLoading(false);
    }
    rootStore.searchStore.resetValues();
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>{L("search_services")}</title>
      </Head>
      <h2>{L("search_services")}</h2>
      <div className={styles.cardContainer}>
        <div className={styles.contentCard}>
          <h3>{L("select_location_question")}</h3>
          <p className={styles.noLocationAvailable}>
            {L("no_location_available_description")}
          </p>
          <SelectProvince />
          <div style={{ height: 20 }} />
          <SelectLocalities />
          <div style={{ height: 20 }} />
          <OnSearchButton />
          {loading && <Spinner />}
        </div>
      </div>
    </div>
  );
}

const OnSearchButton = observer(() => {
  const { rootStore } = useStore();
  const router = useRouter();

  function onSearch() {
    if (rootStore.searchStore.locationId !== "") {
      router.push("/services-list");
    }
  }

  return (
    <Button
      type="button"
      disabled={rootStore.searchStore.locationId === ""}
      onClick={onSearch}
      text="search"
      variant="primary"
    />
  );
});

const SelectLocalities = observer(() => {
  const { rootStore } = useStore();
  const { L } = useLocale();

  function onChangeLocation(res: onChangeSelectProps) {
    if (res?.value) {
      rootStore.searchStore.setLocationId(res.value);
    } else {
      rootStore.searchStore.setLocationId("");
    }
  }

  return (
    <div className={styles.select}>
      {rootStore.userStore.initializedUser && (
        <ReactSelect
          id="select-liveLocalities"
          options={
            rootStore.appStore.liveLocalities
              ? rootStore.appStore.liveLocalities
                  .filter(
                    (l) => l.provinceId === rootStore.searchStore.provinceId
                  )
                  .map((location) => ({
                    value: location.id,
                    label: location.name,
                  }))
                  .sort(function (a, b) {
                    var textA = a.label.toUpperCase();
                    var textB = b.label.toUpperCase();
                    return textA < textB ? -1 : textA > textB ? 1 : 0;
                  })
              : []
          }
          placeholder={L("select_location")}
          onChange={onChangeLocation}
          noOptionsMessage={() => L("not_found")}
          isClearable
          isDisabled={!rootStore.searchStore.provinceId}
        />
      )}
    </div>
  );
});

const SelectProvince = observer(() => {
  const { rootStore } = useStore();
  const { L } = useLocale();

  function onChangeProvince(res: onChangeSelectProps) {
    rootStore.searchStore.setLocationId("");
    if (res?.value) {
      rootStore.searchStore.setProvinceId(res.value);
    }
  }

  return (
    <div className={styles.select}>
      {rootStore.userStore.initializedUser && (
        <ReactSelect
          options={
            rootStore.appStore.liveProvinces
              ? rootStore.appStore.liveProvinces
                  .map((province) => ({
                    value: province.id,
                    label: province.name,
                  }))
                  .sort(function (a, b) {
                    var textA = a.label.toUpperCase();
                    var textB = b.label.toUpperCase();
                    return textA < textB ? -1 : textA > textB ? 1 : 0;
                  })
              : []
          }
          id="select-liveProvinces"
          placeholder={L("select_province")}
          onChange={onChangeProvince}
          noOptionsMessage={() => L("not_found")}
          isClearable
        />
      )}
    </div>
  );
});
