import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { QRCodeProvider } from "@/store/qrcode";
import { Toaster } from "@/components/ui/toaster";
import { Loading } from "@/components/ui/loading";
import clsx from "clsx";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  preload: true,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={clsx(inter.className, inter.variable)}>
      <QRCodeProvider>
        <Component {...pageProps} />
        <Toaster />
        <Loading />
      </QRCodeProvider>
    </div>
  );
}
