import { Fredoka, Nunito } from "next/font/google";

// Homepage-only fonts. Both are variable fonts, so one file each covers every weight we use.
// They are applied through CSS variables on the homepage wrapper only (see home.module.css).
export const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

export const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});
