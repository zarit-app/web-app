import { useLocale } from "@/hooks/useLocale";
import { observer } from "mobx-react-lite";
import { useStore } from "src/stores";
import styles from "@/styles/services-list.module.css";

export const NoMoreServices = observer(() => {
  const { L } = useLocale();
  const { rootStore } = useStore();
  return (
    <>
      {!rootStore.servicesListStore.loading && (
        <div className={styles.noMore}>
          {L(
            rootStore.servicesListStore.services.length
              ? "no_more_services"
              : "no_services"
          )}
        </div>
      )}
    </>
  );
});
