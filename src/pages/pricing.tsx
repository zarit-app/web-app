import { useLocale } from "@/hooks/useLocale";
import React, { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import the FontAwesomeIcon component
import { faCheck } from "@fortawesome/free-solid-svg-icons"; // import the icons you need

import styles from "@/styles/pricing.module.css";
import { Button } from "@/components/Button";

import { loadStripe } from "@stripe/stripe-js";
import { useAlert } from "react-alert";
import { getMessageKey } from "@/libs/alertMessages";
import firebase from "@/firebase";
import { observer } from "mobx-react-lite";
import { autorun } from "mobx";
import { useStore } from "src/stores";

export default function Pricing() {
  const { L } = useLocale();

  const [billing, setBilling] = useState<"monthly" | "annually">("monthly");

  const isProd = process.env.NEXT_PUBLIC_TYPE === "prod";

  const [selectedPrice, setSelectedPrice] = useState<string>(
    isProd ? "price_1JEhE6B6YQahQM60iG8dICPC" : "price_1IxYkPIh6IDSp0FK4ZPPEj6O"
  );

  useEffect(() => {
    if (billing === "monthly") {
      setSelectedPrice(
        isProd
          ? "price_1JEhE6B6YQahQM60iG8dICPC"
          : "price_1IxYkPIh6IDSp0FK4ZPPEj6O"
      );
    } else {
      setSelectedPrice(
        isProd
          ? "price_1JEhE7B6YQahQM60dgFB3S33"
          : "price_1IxYkPIh6IDSp0FKcfHMK3z3"
      );
    }
  }, [billing, isProd]);

  return (
    <div className={styles.container}>
      <h1>{L("available_plans")}</h1>

      <div className={styles.plansContainer}>
        <div className={styles.billingTypeContainer}>
          <div className={styles.billingTypeContainer}>
            <div className={styles.billingTypeText}>{L("billing_type")}</div>
            <div className={styles.billingTypeSelector}>
              <div
                className={
                  billing === "monthly"
                    ? styles.billingTypeElementSelected
                    : styles.billingTypeElement
                }
                onClick={() => setBilling("monthly")}
              >
                {L("monthly")}
              </div>
              <div
                className={
                  billing === "annually"
                    ? styles.billingTypeElementSelected
                    : styles.billingTypeElement
                }
                onClick={() => setBilling("annually")}
              >
                {L("annually")}
              </div>
            </div>
          </div>
        </div>
        <div style={{ height: 20 }} />
        <div className={styles.cardPlansContainer}>
          <div className={styles.cardPlanContainer}>
            {billing === "annually" && (
              <div className={styles.saleText}>-40%</div>
            )}
            <div className={styles.planTitle}>{L("basic_plan")}</div>
            <div className={styles.planDescription}>
              {L("basic_plan_description")}
            </div>
            <div className={styles.planPriceContainer}>
              <div className={styles.planPriceContent}>
                <div className={styles.planPricePrev}>
                  {billing === "monthly" ? "14,99€" : "9,99€"}
                </div>
                <div className={styles.planPrice}>
                  {billing === "monthly" ? "9,99€" : "5,99€"}
                </div>
                <div className={styles.planPriceDivider}>|</div>
                <div className={styles.planPriceText}>{L("per_month")}</div>
              </div>
            </div>
            {billing === "annually" && (
              <div className={styles.totalToPay}>
                {L("total_to_pay")}: 71,99€
              </div>
            )}
            <PlanButton selectedPrice={selectedPrice} />
            <div className={styles.planFeature}>
              <div className={styles.planFeatureIcon}>
                <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
              </div>
              <div className={styles.planFeatureTitle}>
                {L("register_service")}
              </div>
            </div>
            <div className={styles.planFeature}>
              <div className={styles.planFeatureIcon}>
                <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
              </div>
              <div className={styles.planFeatureTitle}>
                {L("global_visibility")}
              </div>
            </div>
            <div className={styles.planFeature}>
              <div className={styles.planFeatureIcon}>
                <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
              </div>
              <div className={styles.planFeatureTitle}>
                {L("profile_photo")}
              </div>
            </div>
            <div className={styles.planFeature}>
              <div className={styles.planFeatureIcon}>
                <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
              </div>
              <div className={styles.planFeatureTitle}>{L("24/7_support")}</div>
            </div>

            <FreeTrialText />
          </div>
        </div>
      </div>
      <div style={{ height: 100 }} />
    </div>
  );
}

interface PropsPlanButton {
  selectedPrice: string;
}

const PlanButton = observer(({ selectedPrice }: PropsPlanButton) => {
  const { rootStore } = useStore();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const { L } = useLocale();

  useEffect(
    () =>
      autorun(() => {
        if (
          rootStore.appStore.openCheckout &&
          rootStore.userStore.user &&
          rootStore.userStore.subscription.loaded
        ) {
          sendToCheckout();
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  async function redirectToCustomerPortal() {
    try {
      setLoading(true);
      const functionRef = firebase
        .app()
        .functions("europe-west6")
        .httpsCallable("ext-firestore-stripe-subscriptions-createPortalLink");
      const { data } = await functionRef({ returnUrl: window.location.origin });
      window.location.assign(data.url);
      setLoading(false);
    } catch (err) {
      const message = getMessageKey(err.code);
      alert.error(L(message));
      setLoading(false);
    }
  }

  async function sendToCheckout() {
    if (rootStore.userStore.user) {
      try {
        setLoading(true);
        if (
          rootStore.userStore.subscription.status === "active" ||
          rootStore.userStore.subscription.status === "trialing"
        ) {
          await redirectToCustomerPortal();
        } else {
          const docRef = await rootStore.userStore.createCheckoutSession(
            rootStore.userStore.uid,
            selectedPrice,
            window.location.origin,
            window.location.origin,
            !rootStore.userStore.subscription.previousSubscriptions
          );
          docRef.onSnapshot(async (snap) => {
            try {
              const { error, sessionId }: any = snap.data();
              if (error) {
                setLoading(false);
                throw error;
              }
              if (sessionId) {
                const stripe = await loadStripe(
                  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
                );
                await stripe?.redirectToCheckout({ sessionId });
                setLoading(false);
              }
            } catch (err) {
              //console.log({ err });
            }
          });
        }
      } catch (err) {
        setLoading(false);
        const message = getMessageKey(err.code);
        alert.error(L(message));
      }
    } else {
      rootStore.appStore.openAuthModal();
      rootStore.appStore.setOpenCheckout(true);
    }
  }

  return (
    <div className={styles.planButton}>
      <Button
        text={
          rootStore.userStore.subscription.previousSubscriptions
            ? "select"
            : "get_started_for_free"
        }
        type="button"
        variant="primary"
        disabled={loading}
        onClick={sendToCheckout}
        loading={loading}
      />
    </div>
  );
});

const FreeTrialText = observer(() => {
  const { L } = useLocale();
  const { rootStore } = useStore();

  return (
    <>
      {!rootStore.userStore.subscription.previousSubscriptions && (
        <div className={styles.freeTrial}>{L("free_trial")}</div>
      )}
    </>
  );
});
