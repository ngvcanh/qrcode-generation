import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>QR Code Generator & Performance Comparison Tool</title>
        <meta name="description" content="Compare performance of popular QR code libraries" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center text-slate-800 dark:text-slate-200">
            QR Code Generator & Performance Comparison Tool
          </h1>
          <p className="text-center text-slate-600 dark:text-slate-400 mt-4">
            Compare performance of popular QR code libraries
          </p>
        </div>
      </div>
    </>
  );
}
