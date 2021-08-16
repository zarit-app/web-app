import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { TextLink } from "@/components/TextLink";
import { getMessageKey } from "@/libs/alertMessages";
import { Review } from "@/libs/types";
import { useLocale } from "@/hooks/useLocale";
import { useAlert } from "react-alert";
import { ReviewModal } from "../ReviewModal";
import { useStore } from "src/stores";

export const ReviewHandler = () => {
  const [loadingReview, setLoadingReview] = useState(false);
  const [review, setReview] = useState<Review>();
  const alert = useAlert();
  const { L } = useLocale();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { rootStore } = useStore();

  async function getReview() {
    setLoadingReview(true);
    try {
      if (
        rootStore.userStore.user?.uid &&
        rootStore.appStore.serviceDetail?.id
      ) {
        const res = await rootStore.userStore.getUserReview(
          rootStore.userStore.user?.uid,
          rootStore.appStore.serviceDetail?.id
        );
        if (res) {
          setReview(res.data() as Review);
        }
      }
    } catch (err) {
      const message = getMessageKey(err.code);
      alert.error(L(message));
    }
    setLoadingReview(false);
  }

  useEffect(() => {
    return () => {
      setReview(undefined);
    };
  }, []);

  /* async function getReviews() {
    const res = await firestore
      .collection("reviews")
      .where("serviceId", "==", "qtFc2Gx2XsIaOfx0qnWm")
      .orderBy("updatedAt", "desc")
      .get();
    res.docs.forEach((e) => console.log(e.data().comment));
  } */

  useEffect(() => {
    getReview();
    //getReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={styles.addReview}>
        {!review && L("used_the_service")}{" "}
        <TextLink
          text={review ? L("edit_review") : L("add_review")}
          onClick={() => {
            if (rootStore.userStore.uid) {
              if (!rootStore.userStore.user?.firstName) {
                alert.error(L("error_incomplete_user_info"));
              } else {
                !loadingReview && setShowReviewModal(true);
              }
            } else {
              rootStore.appStore.openAuthModal();
            }
          }}
        />
      </div>
      {showReviewModal && (
        <ReviewModal
          onClose={() => {
            setShowReviewModal(false);
          }}
          review={review}
          setReview={setReview}
        />
      )}
    </>
  );
};
