import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="DevVelocity"
            width={160}
            height={40}
            priority
          />
        </Link>
      </div>
      {children}
    </div>
  );
}
