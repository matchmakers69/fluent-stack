'use client';

import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { GoogleSignInButton } from './GoogleSignInButton';

const inputClass =
  'h-12 w-full rounded-[14px] border-2 border-[var(--form-stroke)] bg-white [box-shadow:3px_3px_0px_var(--form-stroke)] px-4 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none focus-visible:[box-shadow:4px_4px_0px_var(--form-stroke)] transition-[box-shadow]';

export function SignUpForm() {
  const { signUp } = useSignUp();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const router = useRouter();
  const t = useTranslations('authentication.signUp');

  const registerSchema = z.object({
    email: z
      .string()
      .trim()
      .min(1, t('form.errors.emailRequired'))
      .check(z.email({ error: t('form.errors.invalidEmail') })),
    password: z
      .string()
      .min(8, t('form.errors.passwordMin'))
      .max(30, t('form.errors.passwordMax'))
      .regex(/.*[A-Z].*/, t('form.errors.passwordUppercase'))
      .regex(/.*\d.*/, t('form.errors.passwordNumber'))
      .regex(/.*[`~<>?,./!@#$%^&*()\-_+="'|{}[\];:\\].*/, t('form.errors.passwordSpecial')),
  });
  type RegisterValues = z.infer<typeof registerSchema>;

  const verifySchema = z.object({
    code: z.string().min(1, t('verify.errors.codeRequired')),
  });
  type VerifyValues = z.infer<typeof verifySchema>;

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  });

  const verifyForm = useForm<VerifyValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  const handleRegister = async (values: RegisterValues) => {
    setIsLoading(true);
    setGeneralError('');

    try {
      const { error: pwError } = await signUp.password({
        emailAddress: values.email,
        password: values.password,
      });

      if (pwError) {
        setGeneralError(pwError.longMessage ?? pwError.message ?? t('form.errors.general'));
        return;
      }

      const { error: codeError } = await signUp.verifications.sendEmailCode();
      if (codeError) {
        setGeneralError(codeError.longMessage ?? codeError.message ?? t('form.errors.general'));
        return;
      }

      setStep('verify');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (values: VerifyValues) => {
    setIsLoading(true);
    setGeneralError('');

    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({
        code: values.code,
      });

      if (verifyError) {
        setGeneralError(verifyError.longMessage ?? verifyError.message ?? t('verify.errors.general'));
        return;
      }

      if (signUp.status === 'complete') {
        const { error: finalizeError } = await signUp.finalize();
        if (finalizeError) {
          setGeneralError(t('verify.errors.general'));
          return;
        }
        router.push('/dashboard');
      } else {
        setGeneralError(t('verify.errors.general'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setGeneralError('');
    setResendMessage('');
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      setGeneralError(error.longMessage ?? error.message ?? t('form.errors.general'));
    } else {
      setResendMessage(t('verify.resendSuccess'));
    }
  };

  if (step === 'verify') {
    return (
      <div className="w-full space-y-8">
        <div className="space-y-1">
          <p className="font-bold text-xl">{t('verify.title')}</p>
          <p className="text-muted-foreground text-sm">{t('verify.description')}</p>
        </div>

        <Form {...verifyForm}>
          <form onSubmit={verifyForm.handleSubmit(handleVerify)} className="w-full space-y-6">
            <FormField
              control={verifyForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-base">
                    {t('verify.code')}
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder={t('verify.codePlaceholder')}
                      className={inputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {generalError && <FieldError message={generalError} className="justify-center" />}
            {resendMessage && (
              <p className="text-sm font-semibold text-primary text-center">{resendMessage}</p>
            )}

            <Button type="submit" disabled={isLoading} size="default" className="w-full">
              {isLoading ? t('verify.verifying') : t('verify.submit')}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm">
          {t('verify.noCode')}{' '}
          <button
            type="button"
            onClick={handleResend}
            className="font-medium underline underline-offset-4"
          >
            {t('verify.resend')}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <Form {...registerForm}>
        <form onSubmit={registerForm.handleSubmit(handleRegister)} className="w-full space-y-6">
          <FormField
            control={registerForm.control}
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

          <FormField
            control={registerForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-base">
                  {t('form.password')}
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="password" className={inputClass} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div id="clerk-captcha" />

          {generalError && <FieldError message={generalError} className="justify-center" />}

          <Button type="submit" disabled={isLoading} size="default" className="w-full">
            {isLoading ? t('form.loading') : t('form.submit')}
          </Button>
        </form>
      </Form>

      <GoogleSignInButton label={t('form.googleButton')} flow="sign-up" />

      <p className="text-center text-sm">
        {t('form.alreadyHaveAccount')}{' '}
        <Link href="/authentication/sign-in" className="underline underline-offset-4">
          {t('form.signInLink')}
        </Link>
      </p>
    </div>
  );
}
