import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Switch } from "@/components/Switch";
import { storage } from "@/firebase";
import { useLocale } from "@/hooks/useLocale";
import {
  onChangeMultiSelectProps,
  onChangeSelectProps,
  Service,
  ServiceTypes,
} from "@/libs/types";
import { getFirebaseTimestamp, resizeFile, SERVICE_TYPES } from "@/libs/utils";
import styles from "@/styles/service.module.css";
import { Modal } from "@/components/Modal";

import ReactSelect from "react-select";
import { getMessageKey } from "@/libs/alertMessages";
import { useAlert } from "react-alert";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import the FontAwesomeIcon component
import { useStore } from "src/stores";

export default function Serivce() {
  const router = useRouter();
  const { rootStore } = useStore();
  const { L } = useLocale();
  const [showModal, setShowModal] = useState<boolean>(false);

  const index = rootStore.appStore.selectedServiceIndex;
  const service = rootStore.userStore.user?.services?.[index || 0];

  const internalServiceCheckboxRef = useRef<HTMLInputElement>(null);
  const [internal, setInternal] = useState<boolean>(service?.internal || false);

  const titleRef = useRef<HTMLInputElement>(null);
  const extraInfoRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [titleValue, setTitleValue] = useState<string>(service?.title || "");
  const [extraInfoValue, setExtraInfoValue] = useState<string>(
    service?.extraInfo || ""
  );
  const [availableValue, setAvailableValue] = useState<boolean>(
    service?.available || false
  );
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>(
    service?.localities || []
  );
  const [descriptionValue, setDescriptionValue] = useState<string>(
    service?.description || ""
  );
  const [imageObject, setImageObject] = useState<string[]>(
    service?.imageUrl || [""]
  );
  const [image, setImage] = useState<Blob>();

  const [state, setState] = useState<"editing" | null>(null);

  const [provinceId, setProvinceId] = useState<string>("");

  const componentRef = useRef(false);

  const alert = useAlert();

  const [selectedServicesTypes, setSelectedServiceTypes] = useState<
    ServiceTypes[]
  >(service?.servicesTypes || []);

  useEffect(() => {
    componentRef.current = true;
    if (index === null || !service) {
      router.push("/my-account");
    }
    return () => {
      componentRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onEdit() {
    setState("editing");
  }

  function onCancel() {
    setTitleValue(service?.title || "");
    setExtraInfoValue(service?.extraInfo || "");
    setAvailableValue(service?.available || true);
    setImageObject(
      service?.imageUrl || [
        "https://firebasestorage.googleapis.com/v0/b/zarit-e2df3.appspot.com/o/images%2Fdefault_img.jpeg?alt=media&token=9bbd8ed1-42d1-406e-938e-b29b3f24858e",
      ]
    );
    setImage(undefined);
    setState(null);
    setInternal(service?.internal || false);
    setSelectedServiceTypes(service?.servicesTypes || []);
  }

  function handleUpload(id: string, img: Blob) {
    const metadata = {
      contentType: "image/jpeg",
    };
    return storage.ref(`images/services/${id}/0`).put(img, metadata);
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoading(true);
      if (service) {
        const data: Service = {
          ...service,
          title: titleValue,
          description: descriptionValue,
          extraInfo: extraInfoValue,
          available: availableValue,
          imageUrl: service.imageUrl,
          updatedAt: getFirebaseTimestamp(new Date()),
          internal,
          localities: selectedLocalities,
          servicesTypes: selectedServicesTypes,
        };
        if (image && rootStore.userStore.user?.uid) {
          const uploadTask = await handleUpload(data.id, image);
          const downloadUrl = await uploadTask.ref.getDownloadURL();
          data.imageUrl = [downloadUrl];
        }
        await rootStore.userStore.updateService(data);
        await rootStore.userStore.refreshCurrentUserServices();
        setState(null);
      } else {
        throw "err";
      }
    } catch (err) {
      const message = getMessageKey(err.code);
      alert.error(L(message));
    }
    componentRef.current && setLoading(false);
  }

  async function handleInputImageChange(e: any) {
    const img = e.target.files[0];
    if (img) {
      try {
        const resizedImage = await resizeFile(img);
        setImageObject([URL.createObjectURL(resizedImage)]);
        setImage(resizedImage);
      } catch (err) {
        const message = getMessageKey(err.code);
        alert.error(L(message));
      }
    }
  }

  async function onDelete() {
    if (service) {
      try {
        setLoading(true);
        await rootStore.userStore.deleteService(service.id);
        await rootStore.userStore.refreshCurrentUserServices();
      } catch (err) {
        const message = getMessageKey(err.code);
        alert.error(L(message));
      }
      setLoading(false);
      router.push("/my-account");
    }
  }

  function onCancelModal() {
    setShowModal(false);
  }

  function onChangeProvince(res: onChangeSelectProps) {
    setProvinceId(res?.value || "");
  }

  function onChangeSelectLocalities(res: any) {
    let res2: onChangeMultiSelectProps = res;
    const resValue = res2.map((e) => e.value);
    setSelectedLocalities(resValue);
  }

  function onSelectServiceType(serviceType: ServiceTypes) {
    if (selectedServicesTypes.includes(serviceType)) {
      setSelectedServiceTypes(
        selectedServicesTypes.filter((s) => s !== serviceType)
      );
    } else {
      setSelectedServiceTypes((prevState) => [...prevState, serviceType]);
    }
  }

  if (!service) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      <h2>{L("service_info")}</h2>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={onSave}>
          {imageObject[0] && (
            <div>
              <Image
                alt={L("photo")}
                src={imageObject[0]}
                objectFit="contain"
                width={200}
                height={200}
              />
            </div>
          )}
          {state === "editing" && (
            <input
              type="file"
              onChange={handleInputImageChange}
              accept="image/png, image/jpeg"
            />
          )}
          <div style={{ height: "20px" }} />
          <div className={styles.inputs}>
            <div style={{ width: "100%" }}>
              <Input
                label="title"
                forwardRef={titleRef}
                placeholder="title"
                value={titleValue}
                onChange={(event) => {
                  setTitleValue(event.target.value);
                }}
                required
                readOnly={state === null}
                type="text"
              />
            </div>
            <div style={{ width: "100%" }}>
              <Input
                forwardRefTextArea={descriptionRef}
                type="text"
                label="description"
                placeholder="description_placeholder"
                value={descriptionValue}
                onChangeTextArea={(event) =>
                  setDescriptionValue(event.target.value)
                }
                required
                textarea
                readOnly={state === null}
              />
            </div>
            <div style={{ width: "100%" }}>
              <Input
                forwardRef={extraInfoRef}
                type="text"
                label="extra_info"
                placeholder="extra_info"
                readOnly={state === null}
                value={extraInfoValue}
                onChange={(event) => setExtraInfoValue(event.target.value)}
              />
            </div>
          </div>
          <label>{L("working_localities")}:</label>
          <ReactSelect
            options={rootStore.appStore.provinces
              .map((province) => ({
                value: province.id,
                label: province.name,
              }))
              .sort(function (a, b) {
                var textA = a.label.toUpperCase();
                var textB = b.label.toUpperCase();
                return textA < textB ? -1 : textA > textB ? 1 : 0;
              })}
            placeholder={L("select_province")}
            onChange={onChangeProvince}
            noOptionsMessage={() => L("not_found")}
            isClearable
            isDisabled={state === null}
          />
          <ReactSelect
            options={rootStore.appStore.localities
              .filter((l) => l.provinceId === provinceId)
              .map((location) => ({
                value: location.id,
                label: location.name,
              }))
              .sort(function (a, b) {
                var textA = a.label.toUpperCase();
                var textB = b.label.toUpperCase();
                return textA < textB ? -1 : textA > textB ? 1 : 0;
              })}
            value={selectedLocalities.map((s) => ({
              value: rootStore.appStore.localities.find((l) => l.id === s)?.id,
              label: rootStore.appStore.localities.find((l) => l.id === s)
                ?.name,
            }))}
            placeholder={L("select_location")}
            onChange={onChangeSelectLocalities}
            noOptionsMessage={() => L("not_found")}
            isClearable
            isDisabled={state === null}
            isMulti
          />
          <div style={{ height: 20 }} />
          <h3>{L("services_types")}*</h3>
          <div className={styles.serviceTypesContainer}>
            {SERVICE_TYPES.map((service, index) => (
              <div
                className={
                  state !== null
                    ? styles.serviceTypeContainer
                    : styles.serviceTypeContainerDisabled
                }
                onClick={() =>
                  state !== null && onSelectServiceType(service.type)
                }
                key={index}
              >
                <div className={styles.iconAndSelectorContainer}>
                  <FontAwesomeIcon
                    className={styles.icon}
                    icon={service.icon}
                  />
                  <div className={styles.selectorContainer}>
                    <div
                      className={
                        selectedServicesTypes.includes(service.type)
                          ? `${styles.selectorContainerSelected} ${styles.fadeIn}`
                          : `${styles.selectorContainerSelected} ${styles.fadeOut}`
                      }
                    />
                  </div>
                </div>
                <div>
                  <h5 className={styles.serviceTypeTitle}>
                    {L(service.title)}
                  </h5>
                  <h6 className={styles.serviceTypeSubtitle}>
                    {L(service.description)}
                  </h6>
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 20 }} />
          <div>
            {L("24h_availability")}{" "}
            <input
              type="checkbox"
              ref={internalServiceCheckboxRef}
              onChange={(event) => setInternal(event.target.checked)}
              disabled={state === null}
              checked={internal}
            />
          </div>
          <div style={{ height: 20 }} />
          <label>{L("available")}</label>
          <Switch
            checked={availableValue}
            onChange={() => {
              if (state === "editing") {
                setAvailableValue(!availableValue);
              }
            }}
            disabled={state === null}
          />
          <div className={styles.actionButtonsContainer}>
            <div style={{ height: "20px" }} />
            {state === "editing" ? (
              <div className={styles.actionButtons}>
                <Button
                  onClick={onCancel}
                  type="button"
                  text="cancel"
                  disabled={loading}
                  variant="danger"
                />
                <Button
                  type="submit"
                  text="save"
                  disabled={loading || !selectedLocalities.length}
                  variant="primary"
                  loading={loading}
                />
              </div>
            ) : (
              <Button
                disabled={loading}
                onClick={onEdit}
                text="edit"
                type="button"
                variant="dark"
              />
            )}
          </div>
        </form>
        <div style={{ height: "20px" }} />
        <Button
          disabled={loading}
          text="delete_service"
          type="button"
          variant="link-danger"
          onClick={() => setShowModal(true)}
        />
        <div style={{ height: "100px" }} />
      </div>
      {showModal && (
        <Modal
          onAction={onDelete}
          onCancel={onCancelModal}
          title="delete_service"
          question="remove_account_question"
          actionText="delete"
          cancelText="cancel"
        />
      )}
    </div>
  );
}
