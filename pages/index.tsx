import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Zemenay</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/next.svg" type="image/svg+xml" />
      </Head>
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome to Zemenay</h1>
          <p className="text-gray-600">
            Use the Q^A button in the bottom-right to chat with the assistant.
          </p>
          <div className="mx-auto w-24 opacity-70">
            <img src="/next.svg" alt="logo" />
          </div>
        </div>
      </main>
    </>
  );
}
