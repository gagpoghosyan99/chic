import { useTranslations } from "next-intl";

export default function IntroScreen() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-col items-center pt-12 pb-5 px-5">
      <div className="bg-[rgba(0,84,119,0.75)] text-white px-10 py-5 rounded-lg text-[26px] font-bold text-center my-5">
        {t("welcome")}
      </div>

      <div className="bg-[rgba(0,84,119,0.9)] p-5 rounded-lg text-white relative max-w-[400px] mt-5">
        <h3 className="mb-2.5">{t("thanks")}</h3>
        <p className="text-[15px] leading-relaxed">{t("thanksMessage")}</p>
      </div>
    </div>
  );
}
