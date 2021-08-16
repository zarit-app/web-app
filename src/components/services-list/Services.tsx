import { useStore } from "src/stores";

import styles from "@/styles/services-list.module.css";

import { observer } from "mobx-react-lite";
import React from "react";
import { TextLink } from "@/components/TextLink";
import { useRouter } from "next/router";
import { useLocale } from "@/hooks/useLocale";
import { ReviewsObject, Service } from "@/libs/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

export const Services = observer(() => {
  const { rootStore } = useStore();

  const observerElement = React.useRef<IntersectionObserver>();

  const lastServiceElementRef = (node: any) => {
    if (!rootStore.servicesListStore.loading) {
      if (observerElement.current) observerElement.current.disconnect();
      observerElement.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && rootStore.servicesListStore.hasMore) {
          rootStore.servicesListStore.setPage(
            rootStore.servicesListStore.page + 1
          );
        }
      });
      if (node) observerElement.current.observe(node);
    }
  };

  return (
    <>
      {!!rootStore.servicesListStore.services.length && (
        <ul className={styles.listContainer}>
          {rootStore.servicesListStore.services.map((service, index) => {
            if (rootStore.servicesListStore.services.length === index + 1) {
              return (
                <ServiceComponent
                  innerRef={lastServiceElementRef}
                  key={index}
                  service={service}
                />
              );
            }
            return <ServiceComponent key={index} service={service} />;
          })}
        </ul>
      )}
    </>
  );
});

type ServiceElement = {
  service: Service;
  innerRef?: (node: any) => any;
};

function ServiceComponent({ service, innerRef }: ServiceElement) {
  const router = useRouter();
  const { L } = useLocale();
  const { rootStore } = useStore();

  function onSelectService() {
    rootStore.appStore.setServiceDetail(service);
    router.push("/service-detail");
  }

  return (
    <li
      ref={innerRef}
      className={styles.serviceElement}
      onClick={onSelectService}
    >
      {/* Comment reviews module
       {!!service.reviews.rating && !!service.reviews.count && (
        <div className={styles.ratingContainer}>
          <div className={styles.rating}>{service.reviews.rating}</div>
        </div>
      )} */}
      {
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={L("photo")}
          className={styles.serviceImage}
          src={service.imageUrl[0]}
          width={200}
          height={200}
        />
      }
      <div className={styles.infoContent}>
        <ReviewSection reviews={service.reviews} />
        <h3>{service.title}</h3>
        <div className={styles.descriptionContainer}>
          <p>{service.description}</p>
        </div>
        <TextLink text={L("see_more")} />
      </div>
    </li>
  );
}

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
