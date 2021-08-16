import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { storage } from "@/firebase";
import { useLocale } from "@/hooks/useLocale";
import {
  onChangeMultiSelectProps,
  onChangeSelectProps,
  Service,
  ServiceTypes,
} from "@/libs/types";
import { getFirebaseTimestamp, resizeFile, SERVICE_TYPES } from "@/libs/utils";
import styles from "@/styles/register-service.module.css";
import ReactSelect from "react-select";
import { getMessageKey } from "@/libs/alertMessages";
import { useAlert } from "react-alert";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import the FontAwesomeIcon component
import { useStore } from "src/stores";
import { autorun } from "mobx";

export default function RegisterService() {
  const [imageObject, setImageObject] = useState<string>("");
  const [image, setImage] = useState<Blob>();
  const { L } = useLocale();
  const internalServiceCheckboxRef = useRef<HTMLInputElement>(null);
  const { rootStore } = useStore();
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const extraInfoRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [titleValue, setTitleValue] = useState<string>("");
  const [extraInfoValue, setExtraInfoValue] = useState<string>("");
  const [descriptionValue, setDescriptionValue] = useState<string>("");

  const [provinceId, setProvinceId] = useState<string>("");

  const router = useRouter();

  const componentRef = useRef(false);

  const alert = useAlert();

  const [selectedServicesTypes, setSelectedServiceTypes] = useState<
    ServiceTypes[]
  >([]);

  useEffect(() => {
    componentRef.current = true;
    return () => {
      componentRef.current = false;
    };
  }, []);

  useEffect(
    () =>
      autorun(() => {
        if (
          !!rootStore.userStore.subscription.status &&
          rootStore.userStore.subscription.status !== "active" &&
          rootStore.userStore.subscription.status !== "trialing"
        )
          router.replace("/pricing");
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  async function handleInputImageChange(e: any) {
    const img = e.target.files[0];
    if (img) {
      try {
        const resizedImage = await resizeFile(img);
        setImageObject(URL.createObjectURL(resizedImage));
        setImage(resizedImage);
      } catch (err) {
        const message = getMessageKey(err.code);
        alert.error(L(message));
      }
    }
  }

  function handleUpload(id: string, img: Blob) {
    const metadata = {
      contentType: "image/jpeg",
    };
    return storage.ref(`images/services/${id}/0`).put(img, metadata);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setLoading(true);
      let imageUrl = [
        "https://firebasestorage.googleapis.com/v0/b/zarit-e2df3.appspot.com/o/images%2Fdefault_img.jpeg?alt=media&token=9bbd8ed1-42d1-406e-938e-b29b3f24858e",
      ];
      if (selectedLocalities && rootStore.userStore.user?.uid) {
        const refService = rootStore.userStore.getRefNewService();
        if (refService) {
          const internal = internalServiceCheckboxRef.current?.checked || false;
          let data: Service = {
            title: titleValue,
            description: descriptionValue,
            extraInfo: extraInfoValue,
            uid: rootStore.userStore.uid,
            active: true,
            available: true,
            createdAt: getFirebaseTimestamp(new Date()),
            id: refService.id,
            imageUrl,
            internal: internal,
            updatedAt: getFirebaseTimestamp(new Date()),
            localities: selectedLocalities,
            servicesTypes: selectedServicesTypes,
            reviews: {
              count: 0,
              rating: 0,
              mostTwoRecentReviews: [],
            },
          };
          if (image) {
            const uploadTask = await handleUpload(data.id, image);
            const downloadUrl = await uploadTask.ref.getDownloadURL();
            data.imageUrl = [downloadUrl];
          }
          await rootStore.userStore.registerService(data);
          await rootStore.userStore.refreshCurrentUserServices();
          alert.success(L("service_created"));
          router.push("/my-account");
        } else {
          throw "err";
        }
      }
    } catch (err) {
      const message = getMessageKey(err.code);
      alert.error(L(message));
    }
    componentRef.current && setLoading(false);
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

  return (
    <div className={styles.container}>
      <h1>{L("register_service")}</h1>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3>{L("select_photo")}</h3>
          <input
            type="file"
            onChange={handleInputImageChange}
            accept="image/png, image/jpeg"
          />
          {imageObject && (
            <Image
              alt={L("photo")}
              src={imageObject}
              objectFit="contain"
              width={200}
              height={200}
            />
          )}
          <div style={{ height: "20px" }} />
          <div className={styles.inputs}>
            <div style={{ width: "100%" }}>
              <Input
                forwardRef={titleRef}
                type="text"
                label="title"
                placeholder="title"
                value={titleValue}
                onChange={(event) => setTitleValue(event.target.value)}
                required
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
              />
            </div>
            <div style={{ width: "100%" }}>
              <Input
                forwardRef={extraInfoRef}
                type="text"
                label="extra_info"
                placeholder="extra_info"
                value={extraInfoValue}
                onChange={(event) => setExtraInfoValue(event.target.value)}
              />
            </div>
          </div>
          <h3>{L("working_localities")}*</h3>
          <p className={styles.selectionDescription}>
            {L("working_localities_description")}
          </p>
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
            placeholder={L("select_location")}
            onChange={onChangeSelectLocalities}
            noOptionsMessage={() => L("not_found")}
            isClearable
            isDisabled={!provinceId && !selectedLocalities.length}
            isMulti
          />
          <div style={{ height: 20 }} />
          <h3>{L("services_types")}*</h3>
          <p className={styles.selectionDescription}>
            {L("services_types_description")}
          </p>
          <div className={styles.serviceTypesContainer}>
            {SERVICE_TYPES.map((service, index) => (
              <div
                className={styles.serviceTypeContainer}
                onClick={() => onSelectServiceType(service.type)}
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
            <input type="checkbox" ref={internalServiceCheckboxRef} />
          </div>
          <div style={{ height: 20 }} />
          <Button
            disabled={loading || !selectedLocalities.length}
            type="submit"
            text="register_service"
            variant="primary"
            loading={loading}
          />
        </form>
      </div>
      <div style={{ height: 100 }} />
    </div>
  );
}
