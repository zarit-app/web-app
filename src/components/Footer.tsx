import styles from "@/styles/Footer.module.css";
import { TextLink } from "./TextLink";
import InstaIcon from "@/images/instagram_icon.png";
import YoutubeIcon from "@/images/youtube_icon.png";
import TwitterIcon from "@/images/twitter_icon.png";
import FacebookIcon from "@/images/facebook_icon.png";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/hooks/useLocale";
import { observer } from "mobx-react-lite";
import { useStore } from "src/stores";

const Content = () => {
  const { L } = useLocale();
  return (
    <footer>
      <div className="container">
        <div className={styles.content}>
          <p>© 2021 Zarit, S.L.</p>
          <TextLink
            href="/terms"
            text={L("terms_of_service")}
            variant="secondary"
          />
          <TextLink
            href="/privacy"
            text={L("privacy_policy")}
            variant="secondary"
          />
          <TextLink href="/cookies" text="Cookies" variant="secondary" />
          <Link
            passHref
            href="https://www.instagram.com/zarit_servicios_de_cuidado_/"
          >
            <a target="_blank" rel="noreferrer">
              <Image alt={"Instagram"} src={InstaIcon} height={30} width={30} />
            </a>
          </Link>
          <Link passHref href="https://www.youtube.com/">
            <a target="_blank" rel="noreferrer">
              <Image alt={"Youtube"} src={YoutubeIcon} height={30} width={30} />
            </a>
          </Link>
          <Link passHref href="https://twitter.com/">
            <a target="_blank" rel="noreferrer">
              <Image alt={"Twitter"} src={TwitterIcon} height={30} width={30} />
            </a>
          </Link>
          <Link passHref href="https://www.facebook.com/">
            <a target="_blank" rel="noreferrer">
              <Image
                alt={"Facebook"}
                src={FacebookIcon}
                height={30}
                width={30}
              />
            </a>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export const Footer = observer(() => {
  const { rootStore } = useStore();
  return <>{rootStore.appStore.showFooter && <Content />}</>;
});
