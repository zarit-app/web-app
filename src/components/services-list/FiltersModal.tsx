import { CustomModalContent } from "@/components/CustomModalContent";
import { useLocale } from "@/hooks/useLocale";

import styles from "@/styles/services-list.module.css";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useStore } from "src/stores";
import ReactSelect from "react-select";
import { SERVICE_TYPES } from "@/libs/utils";
import { onChangeMultiSelectPropsServices } from "@/libs/types";
import React from "react";
import { Button } from "@/components/Button";
import { observer } from "mobx-react-lite";

export const FiltersModal = observer(() => {
  const { rootStore } = useStore();
  const { L } = useLocale();

  const internalServiceCheckboxRef = React.useRef<HTMLInputElement>(null);

  function onChangeServices(res: any) {
    let res2: onChangeMultiSelectPropsServices = res;
    const resValue = res2.map((e) => e.value);
    rootStore.servicesListStore.setServicesTypes(resValue);
  }

  function onApplyFilters() {
    rootStore.searchStore.setInternal(
      internalServiceCheckboxRef.current?.checked || false
    );
    rootStore.searchStore.setServicesTypes(
      rootStore.servicesListStore.servicesTypes
    );
    rootStore.servicesListStore.resetValues();
  }

  return (
    <>
      {rootStore.servicesListStore.showFiltersModal && (
        <CustomModalContent>
          <div className={styles.modalContent}>
            <div
              className={styles.closeContainer}
              onClick={() =>
                rootStore.servicesListStore.setShowFiltersModal(false)
              }
            >
              <FontAwesomeIcon
                icon={faTimes}
                className={styles.iconClose}
              ></FontAwesomeIcon>
            </div>
            <h3>{L("filters")}:</h3>
            <div className={styles.select}>
              {rootStore.userStore.initializedUser && (
                <ReactSelect
                  options={SERVICE_TYPES.map((s) => ({
                    value: s.type,
                    label: L(s.title),
                  })).sort(function (a, b) {
                    var textA = a.label.toUpperCase();
                    var textB = b.label.toUpperCase();
                    return textA < textB ? -1 : textA > textB ? 1 : 0;
                  })}
                  value={rootStore.servicesListStore.servicesTypes.map(
                    (type) => {
                      const ser = SERVICE_TYPES.find((t) => t.type === type);
                      if (!!ser) {
                        return { value: ser.type, label: L(ser.title) };
                      } else {
                        return undefined;
                      }
                    }
                  )}
                  placeholder={L("select_services")}
                  onChange={onChangeServices}
                  noOptionsMessage={() => L("not_found")}
                  isClearable
                  isMulti
                />
              )}
            </div>
            <div style={{ height: 20 }} />
            <div>
              {L("24h_availability")}{" "}
              <input
                type="checkbox"
                ref={internalServiceCheckboxRef}
                onChange={(event) =>
                  rootStore.servicesListStore.setInternal(event.target.checked)
                }
                checked={rootStore.servicesListStore.internal}
              />
            </div>
            <div style={{ height: 20 }} />
            <Button
              type="button"
              disabled={false}
              onClick={onApplyFilters}
              text="apply_filter"
              variant="primary"
            />
          </div>
        </CustomModalContent>
      )}
    </>
  );
});
