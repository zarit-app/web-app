import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useLocale } from "@/hooks/useLocale";
import Image from "next/image";
import styles from "./styles.module.css";
import { SERVICE_TYPES } from "@/libs/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TextLink } from "@/components/TextLink";
import { useStore } from "src/stores";
import { observer } from "mobx-react-lite";
import { Spinner } from "@/components/Spinner";
import { when } from "mobx";
import { Button } from "@/components/Button";
import { ReviewsObject } from "@/libs/types";
import { ReviewHandler } from "@/components/service-detail/ReviewHandler";
import { faPhone, faStar } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export default function ServiceDetail() {
  const router = useRouter();
  const { L } = useLocale();
  const { rootStore } = useStore();
  const service = rootStore.appStore.serviceDetail;

  useEffect(() => {
    if (!service) {
      router.replace("/search");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (!service) {
    return <></>;
  }

  return (
    <div className={styles.container}>
      <h1>{L("service_detail")}</h1>
      <div className={styles.contentContainer}>
        <div style={{ height: 20 }} />
        <Image
          alt={L("photo")}
          className={styles.serviceImage}
          src={service.imageUrl[0]}
          height={200}
          width={200}
          objectFit="cover"
        />
        <div className={styles.infoContent}>
          <ReviewSection reviews={service.reviews} />
          <h3 className={styles.title}>{service.title}</h3>
          <div className={styles.descriptionContainer}>
            <p>{service.description}</p>
          </div>
        </div>
        <div style={{ height: 20 }} />
        <h3>{L("services")}</h3>
        <div className={styles.serviceTypesContainer}>
          {SERVICE_TYPES.filter((s) =>
            service.servicesTypes.includes(s.type)
          ).map((service, index) => (
            <div className={styles.serviceTypeContainer} key={index}>
              <div className={styles.iconAndSelectorContainer}>
                <FontAwesomeIcon className={styles.icon} icon={service.icon} />
              </div>
              <div>
                <h5 className={styles.serviceTypeTitle}>{L(service.title)}</h5>
                <h6 className={styles.serviceTypeSubtitle}>
                  {L(service.description)}
                </h6>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 20 }} />
        <div className={styles.selectedLocalities}>
          {!!service.localities && (
            <span>
              {L("services_localities")} ({service.localities.length}):
            </span>
          )}
          <LocationTags />
        </div>
        {service.internal && (
          <>
            <div style={{ height: 20 }} />
            <div>
              {L("24h_availability")}{" "}
              <input type="checkbox" checked={service.internal} readOnly />
            </div>
          </>
        )}
        <div style={{ height: 20 }} />
        <ShowInfo />
      </div>
      <div style={{ height: 100 }} />
    </div>
  );
}

const LocationTags = observer(() => {
  const { rootStore } = useStore();

  return (
    <div className={styles.locationTagsContainer}>
      {!!rootStore.appStore.localities.length &&
        rootStore.appStore.localities
          .filter((e) =>
            rootStore.appStore.serviceDetail?.localities?.includes(e.id)
          )
          .map((e, index) => (
            <div className={styles.location} key={index}>
              {e.name}
            </div>
          ))}
    </div>
  );
});

const ShowInfo = observer(() => {
  const { rootStore } = useStore();
  const { L } = useLocale();
  const [loading, setLoading] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [email, setEmail] = React.useState("");

  const componentRef = React.useRef(false);

  useEffect(() => {
    componentRef.current = true;
    return () => {
      componentRef.current = false;
    };
  }, []);

  const getUserData = React.useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await rootStore.appStore.getUserServiceInfo(
        rootStore.appStore.serviceDetail?.uid || ""
      );
      if (componentRef.current && res && res.data) {
        setFirstName(res.data.firstName);
        setLastName(res.data.lastName);
        setPhoneNumber(res.data.phoneNumber);
        setEmail(res.data.email);
      }
      componentRef.current && setLoading(false);
    } catch (err) {
      console.log({ err });
      componentRef.current && setLoading(false);
    }
  }, [rootStore.appStore]);

  useEffect(() => {
    when(
      () => !!rootStore.userStore.user,
      () => {
        getUserData();
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h3 className={styles.contactInfoTitle}>{L("contact_info")}</h3>
      {rootStore.userStore.user ? (
        <>
          {loading ? (
            <Spinner />
          ) : (
            !!firstName &&
            !!lastName && (
              <p>
                {L("first_name")}: {firstName} {lastName}
              </p>
            )
          )}
          {!!email && (
            <p>
              {L("email")}: {email}
            </p>
          )}
          {!!rootStore.appStore.serviceDetail?.extraInfo && (
            <p>
              {L("extra_info")}: {rootStore.appStore.serviceDetail?.extraInfo}
            </p>
          )}
          {!!phoneNumber && CallButton(phoneNumber)}
          {!!phoneNumber && WhatsAppButton(phoneNumber)}
          <ReviewHandler />
        </>
      ) : (
        <TextLink
          text={L("show_contact_info")}
          onClick={rootStore.appStore.openAuthModal}
        />
      )}
      {/* <ChatButton
        uid={rootStore.userStore.uid}
        serviceOwnerUid={rootStore.appStore.serviceDetail?.uid}
        serviceOwnerEmail={email}
        serviceId={rootStore.appStore.serviceDetail?.id}
        title={rootStore.appStore.serviceDetail?.title}
        serviceOwnerName={firstName}
        userName={rootStore.userStore.user?.firstName}
        userEmail={rootStore.userStore.user?.email}
        loading={loading}
      /> */}
    </>
  );
});

interface Props {
  reviews: ReviewsObject;
}

const ReviewSection = ({ reviews }: Props) => {
  const { L } = useLocale();

  return (
    <div className={styles.reviewSectionContainer}>
      <FontAwesomeIcon icon={faStar} className={styles.starIconSelected} />
      <div className={styles.ratingNumber}>
        {reviews.count === 0
          ? L("new")
          : reviews.count >= 5
          ? reviews.rating
          : reviews.count + " " + L(reviews.count > 1 ? "reviews" : "review")}
      </div>
      {reviews.count >= 5 && (
        <div className={styles.ratingCount}>({reviews.count})</div>
      )}
    </div>
  );
};

const CallButton = (phoneNumber: string) => {
  return (
    <Button
      text="call"
      variant="primary"
      disabled={false}
      type="button"
      href={`tel:${phoneNumber}`}
      icon={<FontAwesomeIcon icon={faPhone} className={styles.phoneIcon} />}
      style={{
        backgroundColor: "rgb(74, 97, 230)",
        borderColor: "rgb(74, 97, 230)",
      }}
    />
  );
};

const WhatsAppButton = (phoneNumber: string) => {
  return (
    <Button
      text="chat"
      variant="primary"
      disabled={false}
      type="button"
      href={`https://api.whatsapp.com/send?phone=${phoneNumber}&text=Hola, quería pedir información sobre el servicio, gracias.`}
      icon={<FontAwesomeIcon icon={faWhatsapp} className={styles.phoneIcon} />}
      style={{
        backgroundColor: "#3ED366",
        borderColor: "#3ED366",
      }}
    />
  );
};
