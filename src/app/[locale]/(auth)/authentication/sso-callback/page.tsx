'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import { LoaderCircle } from 'lucide-react';
import { CredentialColumn, HeroAuthColumn, HeroContent } from '@/components/auth';
import { SectionHeading } from '@/components/shared';

export default function SSOCallbackPage() {
  const t = useTranslations('authentication');

  return (
    <section className="flex w-full flex-col lg:flex-row">
      <HeroAuthColumn image="/images/auth/sso-callbackhero.jpg">
        <HeroContent headline={t('ssoCallback.hero.headline')} subtext={t('ssoCallback.hero.subtext')} />
      </HeroAuthColumn>
      <CredentialColumn>
        <div className="flex w-full flex-col gap-8">
          <SectionHeading
            label={t('ssoCallback.label')}
            title={t('ssoCallback.title')}
            description={t('ssoCallback.description')}
          />
          <div className="flex flex-col items-center gap-4 py-6">
            <LoaderCircle className="size-10 animate-spin text-primary" aria-hidden />
            <AuthenticateWithRedirectCallback
              signInFallbackRedirectUrl="/account/profile"
              signUpFallbackRedirectUrl="/account/profile"
            />
          </div>
        </div>
      </CredentialColumn>
    </section>
  );
}
