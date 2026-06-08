import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface HeroAuthColumnProps {
  image?: string;
  children?: React.ReactNode;
}

export function HeroAuthColumn({
  image = "/images/auth/register-hero.jpg",
  children,
}: HeroAuthColumnProps) {
  return (
    <div
      className="relative flex h-80 w-full flex-shrink-0 flex-col overflow-hidden hero-auth bg-cover bg-center bg-no-repeat lg:fixed lg:right-0 lg:top-0 lg:h-auto lg:min-h-full lg:w-[50%]"
      style={{ backgroundImage: `url('${image}')` }}
    >
      <div className="relative z-10 flex flex-1 items-center justify-center p-8 text-white lg:p-12">
        <div className="flex w-full max-w-md flex-col gap-6 lg:gap-10">
          <Link href="/">
            <Image
              src="/logos/logo-light.svg"
              alt="Fluent Stack"
              width={150}
              height={38}
              priority
            />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
