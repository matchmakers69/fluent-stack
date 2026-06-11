'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FieldError } from '@/components/ui/field-error';

const inputClass =
  'h-12 w-full rounded-[14px] border-2 border-[var(--form-stroke)] bg-white [box-shadow:3px_3px_0px_var(--form-stroke)] px-4 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none focus-visible:[box-shadow:4px_4px_0px_var(--form-stroke)] transition-[box-shadow]';

export function ForgotPasswordForm() {
  const { signIn } = useSignIn();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const router = useRouter();
  const t = useTranslations('authentication.forgotPassword');

  const requestSchema = z.object({
    email: z
      .string()
      .trim()
      .min(1, t('form.errors.emailRequired'))
      .check(z.email({ error: t('form.errors.invalidEmail') })),
  });
  type RequestValues = z.infer<typeof requestSchema>;

  const resetSchema = z.object({
    code: z.string().min(1, t('reset.errors.codeRequired')),
    password: z
      .string()
      .min(8, t('reset.errors.passwordMin'))
      .max(30, t('reset.errors.passwordMax'))
      .regex(/.*[A-Z].*/, t('reset.errors.passwordUppercase'))
      .regex(/.*\d.*/, t('reset.errors.passwordNumber'))
      .regex(/.*[`~<>?,./!@#$%^&*()\-_+="'|{}[\];:\\].*/, t('reset.errors.passwordSpecial')),
  });
  type ResetValues = z.infer<typeof resetSchema>;

  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: '', password: '' },
  });

  const handleRequest = async (values: RequestValues) => {
    setIsLoading(true);
    setGeneralError('');

    try {
      const { error: createError } = await signIn.create({ identifier: values.email });
      if (createError) {
        setGeneralError(createError.longMessage ?? createError.message ?? t('form.errors.general'));
        return;
      }

      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
      if (sendError) {
        setGeneralError(sendError.longMessage ?? sendError.message ?? t('form.errors.general'));
        return;
      }

      setStep('reset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (values: ResetValues) => {
    setIsLoading(true);
    setGeneralError('');

    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
        code: values.code,
      });
      if (verifyError) {
        setGeneralError(verifyError.longMessage ?? verifyError.message ?? t('reset.errors.general'));
        return;
      }

      const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
        password: values.password,
        signOutOfOtherSessions: true,
      });
      if (submitError) {
        setGeneralError(submitError.longMessage ?? submitError.message ?? t('reset.errors.general'));
        return;
      }

      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setGeneralError(t('reset.errors.general'));
          return;
        }
        router.push('/account/profile');
      } else {
        setGeneralError(t('reset.errors.general'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'reset') {
    return (
      <div className="w-full space-y-8">
        <div className="space-y-1">
          <p className="font-bold text-xl">{t('reset.title')}</p>
          <p className="text-muted-foreground text-sm">{t('reset.description')}</p>
        </div>

        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(handleReset)} className="w-full space-y-6">
            <FormField
              control={resetForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-base">
                    {t('reset.code')}
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder={t('reset.codePlaceholder')}
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={resetForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-base">
                    {t('reset.password')}
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" className={inputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {generalError && <FieldError message={generalError} className="justify-center" />}

            <Button type="submit" disabled={isLoading} size="default" className="w-full">
              {isLoading ? t('reset.loading') : t('reset.submit')}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm">
          {t('form.backToSignIn')}{' '}
          <Link href="/authentication/sign-in" className="underline underline-offset-4">
            {t('form.signInLink')}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <Form {...requestForm}>
        <form onSubmit={requestForm.handleSubmit(handleRequest)} className="w-full space-y-6">
          <FormField
            control={requestForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-base">
                  {t('form.email')}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('form.emailPlaceholder')}
                    className={inputClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {generalError && <FieldError message={generalError} className="justify-center" />}

          <Button type="submit" disabled={isLoading} size="default" className="w-full">
            {isLoading ? t('form.loading') : t('form.submit')}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm">
        {t('form.backToSignIn')}{' '}
        <Link href="/authentication/sign-in" className="underline underline-offset-4">
          {t('form.signInLink')}
        </Link>
      </p>
    </div>
  );
}
