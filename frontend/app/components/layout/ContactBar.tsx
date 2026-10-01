import { useTranslations } from "next-intl";

export default function ContactBar() {
  const t = useTranslations("common");

  return (
    <div className="bg-primary text-white py-2.5 text-sm">
      <div className="container-content flex flex-wrap justify-center items-center gap-4 md:gap-6">
        <a
          href="mailto:chic.ngo.arm@gmail.com"
          className="flex items-center gap-1.5 hover:text-primary-light transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span>{t("email")}: chic.ngo.arm@gmail.com</span>
        </a>
        <a
          href="tel:+37444776701"
          className="flex items-center gap-1.5 hover:text-primary-light transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span>{t("phone")}: (+374) 44 776701</span>
        </a>
      </div>
    </div>
  );
}
