import { useLocale } from "@/hooks/useLocale";
import { observer } from "mobx-react-lite";
import { useStore } from "src/stores";

export const Loading = observer(() => {
  const { L } = useLocale();
  const { rootStore } = useStore();
  return (
    <>{rootStore.servicesListStore.loading && <div>{L("loading")}</div>}</>
  );
});
