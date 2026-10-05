export default function Login() {
  const denied = new URLSearchParams(window.location.search).get('error');
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight">
        Your wallet apps already keep the receipts.
      </h1>
      <p className="mt-5 max-w-md text-lg text-ink/70">
        Connect Gmail and we'll total up what you spent through Easypaisa, NayaPay, JazzCash and SadaPay, no typing required.
      </p>

      <a
        href="/api/auth/google"
        className="mt-8 inline-flex w-fit items-center gap-3 rounded-lg bg-ink px-5 py-3 font-semibold text-paper hover:bg-moss"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
        </svg>
        Continue with Google
      </a>
      {denied === 'scope' && (
        <p className="mt-4 text-clay">Gmail access wasn't granted. On the Google screen, tick "Read your email messages" before continuing.</p>
      )}
      {denied === 'denied' && <p className="mt-4 text-clay">Access was declined. We need read-only Gmail access to find your payment emails.</p>}

      <p className="mt-6 max-w-md text-sm text-ink/60">
        We ask for read-only access, only search for emails from payment apps, and store the amount, date and recipient, never the email body.
      </p>
    </main>
  );
}
