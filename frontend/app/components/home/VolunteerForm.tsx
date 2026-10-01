"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { submitVolunteer } from "@/lib/strapi";

export default function VolunteerForm() {
  const t = useTranslations("volunteer");
  const tCommon = useTranslations("common");
  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const volunteerData = {
      name: formData.get("name") as string,
      surname: formData.get("surname") as string,
      fathername: formData.get("fathername") as string,
      birthdate: formData.get("birthdate") as string,
      university: formData.get("university") as string,
      phone: formData.get("phone") as string,
    };

    try {
      const result = await submitVolunteer(volunteerData);

      if (result.success) {
        setResponseMessage(tCommon("success"));
        form.reset();
      } else {
        setResponseMessage(tCommon("error"));
        console.error("Volunteer submission error:", result.error);
      }
    } catch (error) {
      setResponseMessage(tCommon("error"));
      console.error("Volunteer submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              {t("name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="surname" className="block text-sm font-medium text-text-primary mb-2">
              {t("surname")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="surname"
              name="surname"
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="fathername" className="block text-sm font-medium text-text-primary mb-2">
            {t("fathername")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fathername"
            name="fathername"
            required
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium text-text-primary mb-2">
            {t("birthdate")} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="birthdate"
            name="birthdate"
            required
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="university" className="block text-sm font-medium text-text-primary mb-2">
            {t("university")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="university"
            name="university"
            required
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
            {t("phone")} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full md:w-auto"
        >
          {isSubmitting ? "..." : tCommon("send")}
        </button>

        {responseMessage && (
          <div
            className={`p-4 rounded-lg ${
              responseMessage.includes("✅")
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {responseMessage}
          </div>
        )}
      </form>
    </div>
  );
}
