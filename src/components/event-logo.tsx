import Link from "next/link";
import Image from "next/image";

export function EventLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="focus-ring grid w-fit grid-cols-[auto_1fr] items-center gap-3" aria-label="Nexus Arena">
      <span className={compact ? "nexus-logo-icon" : "nexus-logo-icon nexus-logo-icon-large"} aria-hidden="true">
        <Image src="/assets/nexus-logo-mark.jpeg" alt="" fill priority={!compact} sizes={compact ? "54px" : "82px"} />
      </span>
      <span className="grid leading-none">
        <strong className={compact ? "logo-wordmark text-base text-[#F5F5F5]" : "logo-wordmark text-3xl text-[#F5F5F5] sm:text-5xl"}>
          NE<span className="logo-wordmark-x">X</span>US
        </strong>
        <span className={compact ? "text-xs font-black uppercase text-[#A855F7]" : "text-sm font-black uppercase text-[#A855F7] sm:text-base"}>
          {compact ? "Arena" : "Arena de competicoes"}
        </span>
      </span>
    </Link>
  );
}
