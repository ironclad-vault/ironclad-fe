import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center card-pro border-4 border-accent p-16 max-w-2xl">
        <h1 className="text-heading text-8xl mb-6!">404</h1>
        <h2 className="text-heading text-4xl mb-6! border-b-2 border-accent pb-4">
          PAGE NOT FOUND
        </h2>
        <p className="text-body text-xl mb-12!">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-pro accent inline-flex items-center space-x-2 px-8 py-4 text-lg font-bold hover-lift"
        >
          <span>RETURN HOME</span>
        </Link>
      </div>
    </div>
  );
}
