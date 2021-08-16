import React, { useEffect, useRef, useState } from "react";
import { CustomModalContent } from "@/components/CustomModalContent";
import styles from "./style.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocale } from "@/hooks/useLocale";
import { faStar, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAlert } from "react-alert";
import { getMessageKey } from "@/libs/alertMessages";
import { Review } from "@/libs/types";
import { getFirebaseTimestamp } from "@/libs/utils";
import { useStore } from "src/stores";

interface Props {
  onClose: () => void;
  review: Review | undefined;
  setReview: (review: Review) => void;
}

export const ReviewModal = ({ onClose, review, setReview }: Props) => {
  const { L } = useLocale();
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [commentValue, setCommentValue] = useState(review?.comment || "");
  const [rating, setRating] = useState<number | null>(review?.rating || null);
  const [loading, setLoading] = useState(false);
  const alert = useAlert();
  const { rootStore } = useStore();

  const [ratingArray, setRatingArray] = useState([
    [1, false],
    [2, false],
    [3, false],
    [4, false],
    [5, false],
  ]);

  const userId = rootStore.userStore.user?.uid;
  const serviceId = rootStore.appStore.serviceDetail?.id;

  useEffect(() => {
    if (review?.rating) {
      let newArray = ratingArray.map((r) => {
        if (r[0] <= review.rating) {
          r[1] = true;
          return r;
        } else {
          r[1] = false;
          return r;
        }
      });
      setRatingArray(newArray);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CustomModalContent>
      <div className={styles.modalContent}>
        <div className={styles.closeContainer} onClick={onClose}>
          <FontAwesomeIcon
            icon={faTimes}
            className={styles.iconClose}
          ></FontAwesomeIcon>
        </div>
        <p>{L("review_description")}</p>
        <h3>{L("rating")}:</h3>
        <div className={styles.ratingContainer}>
          {ratingArray.map((e: any) =>
            e[1] === true ? (
              <FontAwesomeIcon
                icon={faStar}
                key={e[0]}
                className={styles.starIconSelected}
                onClick={() => {
                  setRating(e[0]);
                  let newArray = ratingArray.map((r) => {
                    if (r[0] <= e[0]) {
                      r[1] = true;
                      return r;
                    } else {
                      r[1] = false;
                      return r;
                    }
                  });
                  setRatingArray(newArray);
                }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faStarOutline}
                key={e[0]}
                className={styles.starIcon}
                onClick={() => {
                  setRating(e[0]);
                  let newArray = ratingArray.map((r) => {
                    if (r[0] <= e[0]) {
                      r[1] = true;
                      return r;
                    } else {
                      r[1] = false;
                      return r;
                    }
                  });
                  setRatingArray(newArray);
                }}
              />
            )
          )}
          {/* <div
              key={e}
              className={rating === e ? styles.selectedNumber : styles.number}
              onClick={() => setRating(e)}
            >
              {e}
            </div> */}
        </div>
        <div style={{ height: 20 }} />
        <div className={styles.commentContainer}>
          <Input
            forwardRefTextArea={commentRef}
            type="text"
            placeholder="comment"
            value={commentValue}
            onChangeTextArea={(event) => setCommentValue(event.target.value)}
            textarea
          />
        </div>
        <Button
          type="button"
          disabled={!(userId && serviceId && rating) || loading}
          onClick={async () => {
            setLoading(true);
            if (
              userId &&
              serviceId &&
              rating &&
              rootStore.userStore.user?.firstName
            ) {
              try {
                const rev = {
                  id: userId + "_" + serviceId,
                  userId,
                  serviceId,
                  rating: rating,
                  comment: commentValue,
                  createdAt: review
                    ? review.createdAt
                    : getFirebaseTimestamp(new Date()),
                  updatedAt: getFirebaseTimestamp(new Date()),
                  userFirstName: rootStore.userStore.user.firstName,
                };
                await rootStore.userStore.sendReview(rev);
                setReview(rev);
                setLoading(false);
                onClose();
              } catch (err) {
                const message = getMessageKey(err.code);
                alert.error(L(message));
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          }}
          text="send"
          variant="primary"
          loading={loading}
        />
      </div>
    </CustomModalContent>
  );
};
