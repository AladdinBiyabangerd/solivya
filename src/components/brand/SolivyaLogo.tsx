import { SITE } from "@/lib/site";
import { SolivyaMark } from "./SolivyaMark";
import styles from "./SolivyaLogo.module.css";

type Props = {
  /** Show “Solivya” word next to the mark (default true). */
  wordmark?: boolean;
  /** Visual size of the mark. */
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Invert wordmark for dark / photo heroes. */
  onDark?: boolean;
  /** When set, the whole mark (+ word) links here (usually marketing landing). */
  href?: string;
};

export function SolivyaLogo({
  wordmark = true,
  size = "md",
  className,
  onDark = false,
  href,
}: Props) {
  const rootClass = [
    styles.root,
    styles[size],
    onDark ? styles.onDark : "",
    href ? styles.link : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <SolivyaMark className={styles.mark} onDark={onDark} />
      {wordmark ? <span className={styles.word}>{SITE.name}</span> : null}
      <span className={styles.srOnly}>{SITE.name}</span>
    </>
  );

  if (href) {
    return (
      <a className={rootClass} href={href} title={SITE.name}>
        {inner}
      </a>
    );
  }

  return <span className={rootClass}>{inner}</span>;
}
