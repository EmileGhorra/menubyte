export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-light text-dark">
      <h1 className="text-4xl font-semibold">MenuByte</h1>
      <p className="mt-4 text-lg max-w-lg text-center">
        Your all-in-one platform to create, edit, and share QR menus for your restaurant.
      </p>
      <a
        className="mt-6 inline-flex items-center rounded-md bg-primary px-6 py-3 text-white hover:bg-primary/90"
        href="/login"
      >
        Get Started
      </a>
    </main>
  );
}
