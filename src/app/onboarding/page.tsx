'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Country = 'BR' | 'US' | 'BOTH';
type Gender = 'M' | 'F' | 'BOTH';

const STEPS = ['country', 'gender', 'letters'] as const;
type Step = (typeof STEPS)[number];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('country');
  const [country, setCountry] = useState<Country>('BOTH');
  const [gender, setGender] = useState<Gender>('BOTH');
  const [excludedLetters, setExcludedLetters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const currentStepIndex = STEPS.indexOf(step);

  const goBack = () => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1]);
    }
  };

  const goNext = async () => {
    if (currentStepIndex < STEPS.length - 1) {
      setStep(STEPS[currentStepIndex + 1]);
    } else {
      // Save and continue
      await savePreferences();
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country,
          gender,
          excludedLetters,
        }),
      });

      if (response.ok) {
        router.push('/swipe');
      } else {
        console.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLetter = (letter: string) => {
    setExcludedLetters((prev) =>
      prev.includes(letter)
        ? prev.filter((l) => l !== letter)
        : [...prev, letter]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={goBack}
          disabled={currentStepIndex === 0}
          className="p-2 rounded-full hover:bg-white/50 disabled:opacity-0 transition-all"
        >
          <ArrowLeft className="h-6 w-6 text-[var(--foreground)]" />
        </button>
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${
                i <= currentStepIndex ? 'bg-[var(--primary)]' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === 'country' && (
            <motion.div
              key="country"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md text-center"
            >
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                Where are you looking for names?
              </h1>
              <p className="text-[var(--foreground-muted)] mb-8">
                Choose the country or both
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => setCountry('BR')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    country === 'BR'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-4xl block mb-2">🇧🇷</span>
                  <span className="font-semibold text-[var(--foreground)]">Brazil</span>
                </button>
                <button
                  onClick={() => setCountry('US')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    country === 'US'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-4xl block mb-2">🇺🇸</span>
                  <span className="font-semibold text-[var(--foreground)]">USA</span>
                </button>
              </div>

              <button
                onClick={() => setCountry('BOTH')}
                className={`w-full p-4 rounded-2xl border-2 transition-all ${
                  country === 'BOTH'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="font-semibold text-[var(--foreground)]">
                  🌎 Both Countries
                </span>
              </button>
            </motion.div>
          )}

          {step === 'gender' && (
            <motion.div
              key="gender"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md text-center"
            >
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                Baby&apos;s gender?
              </h1>
              <p className="text-[var(--foreground-muted)] mb-8">
                Or keep it a surprise!
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => setGender('F')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    gender === 'F'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-4xl block mb-2">👧</span>
                  <span className="font-semibold text-[var(--foreground)]">Girl</span>
                </button>
                <button
                  onClick={() => setGender('M')}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    gender === 'M'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-4xl block mb-2">👦</span>
                  <span className="font-semibold text-[var(--foreground)]">Boy</span>
                </button>
              </div>

              <button
                onClick={() => setGender('BOTH')}
                className={`w-full p-4 rounded-2xl border-2 transition-all ${
                  gender === 'BOTH'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="font-semibold text-[var(--foreground)]">
                  🎭 Surprise / Both
                </span>
              </button>
            </motion.div>
          )}

          {step === 'letters' && (
            <motion.div
              key="letters"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md text-center"
            >
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                Any letters to avoid?
              </h1>
              <p className="text-[var(--foreground-muted)] mb-6">
                Tap letters you don&apos;t want in names (optional)
              </p>

              <div className="grid grid-cols-7 gap-2 mb-6">
                {LETTERS.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => toggleLetter(letter)}
                    className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                      excludedLetters.includes(letter)
                        ? 'bg-[var(--dislike)] text-white'
                        : 'bg-white text-[var(--foreground)] hover:bg-gray-100'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {excludedLetters.length > 0 && (
                <p className="text-sm text-[var(--foreground-muted)]">
                  Excluding: {excludedLetters.sort().join(', ')}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="p-6">
        <Button
          onClick={goNext}
          disabled={loading}
          isLoading={loading}
          className="w-full"
          size="lg"
        >
          {currentStepIndex === STEPS.length - 1 ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Start Swiping
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}
