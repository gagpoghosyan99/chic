# CHIC - Next.js Migration

This is a Next.js 14 application migrated from a static HTML/CSS codebase.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Move images to public directory:**
   All image files (`.jpeg` files) should be in the `public/` directory. They are already referenced correctly in the code.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── [locale]/          # Locale-based routing (hy, ru, en)
│   ├── layout.tsx     # Locale layout with i18n provider
│   ├── page.tsx       # Home page
│   ├── consulting/    # Consulting page route
│   │   └── page.tsx
│   ├── lab1/          # Lab service 1 page
│   │   └── page.tsx
│   └── lab2/          # Success story page
│       └── page.tsx
├── components/
│   ├── home/          # Home page specific components
│   │   ├── IntroScreen.tsx
│   │   ├── HistorySection.tsx
│   │   ├── TeamSection.tsx
│   │   ├── LecturersSection.tsx
│   │   ├── CoursesSection.tsx
│   │   └── VolunteerForm.tsx
│   └── layout/        # Shared layout components
│       ├── Header.tsx
│       ├── ContactBar.tsx
│       ├── SocialLinks.tsx
│       └── LanguageSwitcher.tsx
├── layout.tsx         # Root layout (redirects to default locale)
├── page.tsx           # Root page (redirects to default locale)
└── globals.css        # Global styles with Tailwind

messages/              # Translation files
├── hy.json            # Armenian translations
├── ru.json            # Russian translations
└── en.json            # English translations

public/                # Static assets (images)
```

## Routes

All routes are prefixed with locale (`/hy`, `/ru`, `/en`):

- `/{locale}` - Home page with intro screen and sections
- `/{locale}/consulting` - Quality management consulting page
- `/{locale}/lab1` - Laboratory services improvement page
- `/{locale}/lab2` - Success story page

The root `/` redirects to `/hy` (default locale).

## Internationalization (i18n)

The site supports three languages:
- **Armenian (hy)** - Default language
- **Russian (ru)**
- **English (en)**

Language switcher is available in the header. All content is translated and stored in:
- `messages/hy.json` - Armenian translations
- `messages/ru.json` - Russian translations
- `messages/en.json` - English translations

## Features

- **Responsive Design**: Preserved from original with Tailwind utilities
- **Hash-based Navigation**: Sections on home page use hash fragments
- **Dropdown Menus**: Interactive navigation dropdowns
- **Image Galleries**: Toggleable galleries for courses
- **Form Handling**: Volunteer form with Google Apps Script integration
- **Social Media Links**: Fixed position social media icons

## Technologies

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React 18
- next-intl (Internationalization)

## Notes

- All images should be in the `public/` directory
- The volunteer form submits to a Google Apps Script endpoint (configured in the original)
- Background image is set in `globals.css`
- Social media links are fixed in the bottom right corner

