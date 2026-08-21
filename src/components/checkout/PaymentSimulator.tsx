'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaymentSimulatorProps {
  onPaymentValidChange?: (isValid: boolean, details: { cardNumber: string; cardHolder: string; expiry: string; status: 'valid' | 'declined' }) => void;
}

export const PaymentSimulator: React.FC<PaymentSimulatorProps> = ({
  onPaymentValidChange,
}) => {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState('ALEX MORGAN');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [cardType, setCardType] = useState<'success' | 'declined' | 'custom'>('success');

  const formatCardNumber = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    return clean.match(/.{1,4}/g)?.join(' ') || clean;
  };

  const handleFillSuccess = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardHolder('ALEX MORGAN');
    setExpiry('12/28');
    setCvc('888');
    setCardType('success');
    if (onPaymentValidChange) {
      onPaymentValidChange(true, {
        cardNumber: '4242 4242 4242 4242',
        cardHolder: 'ALEX MORGAN',
        expiry: '12/28',
        status: 'valid',
      });
    }
  };

  const handleFillDecline = () => {
    setCardNumber('4000 0000 0000 0002');
    setCardHolder('DECLINED TEST');
    setExpiry('04/27');
    setCvc('000');
    setCardType('declined');
    if (onPaymentValidChange) {
      onPaymentValidChange(false, {
        cardNumber: '4000 0000 0000 0002',
        cardHolder: 'DECLINED TEST',
        expiry: '04/27',
        status: 'declined',
      });
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    if (formatted.replace(/\s+/g, '') === '4000000000000002') {
      setCardType('declined');
      if (onPaymentValidChange) {
        onPaymentValidChange(false, {
          cardNumber: formatted,
          cardHolder,
          expiry,
          status: 'declined',
        });
      }
    } else {
      setCardType('custom');
      if (onPaymentValidChange) {
        onPaymentValidChange(true, {
          cardNumber: formatted,
          cardHolder,
          expiry,
          status: 'valid',
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Sandbox Test Card Quick Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-cream-500/80 border border-subtle text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-espresso-950">
          <Sparkles className="w-3.5 h-3.5 text-terracotta-600" />
          <span>Quick Demo Test Cards: </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleFillSuccess}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors border',
              cardType === 'success'
                ? 'bg-olive-100 text-olive-700 border-olive-500 font-bold'
                : 'bg-surface text-charcoal-600 border-border-medium hover:bg-cream-600'
            )}
          >
            ✓ 4242 Success
          </button>
          <button
            type="button"
            onClick={handleFillDecline}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors border',
              cardType === 'declined'
                ? 'bg-terracotta-100 text-terracotta-700 border-terracotta-500 font-bold'
                : 'bg-surface text-charcoal-600 border-border-medium hover:bg-cream-600'
            )}
          >
            ✕ 0002 Decline
          </button>
        </div>
      </div>

      {/* Interactive Card Graphic */}
      <div
        className={cn(
          'relative w-full max-w-sm mx-auto p-5 rounded-xl text-white shadow-elevated transition-all overflow-hidden border',
          cardType === 'declined'
            ? 'bg-gradient-to-br from-terracotta-900 via-espresso-950 to-charcoal-900 border-terracotta-500/50'
            : 'bg-gradient-to-br from-espresso-950 via-espresso-900 to-terracotta-950 border-espresso-800'
        )}
      >
        {/* Ambient background watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-10 text-9xl font-serif select-none pointer-events-none">
          ☕
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 rounded bg-amber-300/80 shadow-xs border border-amber-200" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-cream-400">
              Direct-Trade Roastery Card
            </span>
          </div>
          <span className="font-serif font-bold text-sm tracking-wider text-terracotta-300">
            LUMINA PAY
          </span>
        </div>

        <div className="my-3">
          <p className="font-mono text-base sm:text-lg tracking-widest font-semibold drop-shadow-xs">
            {cardNumber || '•••• •••• •••• ••••'}
          </p>
        </div>

        <div className="flex items-end justify-between text-xs font-mono pt-1">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-cream-500 block">
              Cardholder Name
            </span>
            <span className="font-semibold uppercase tracking-wider truncate max-w-[170px] block">
              {cardHolder || 'VALUED COFFEE CONNOISSEUR'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-cream-500 block">
              Expires
            </span>
            <span className="font-semibold">{expiry || 'MM/YY'}</span>
          </div>
        </div>
      </div>

      {/* Form Input Controls */}
      <div className="space-y-3 pt-2">
        <div>
          <label className="block text-xs font-semibold text-espresso-950 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={19}
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4242 4242 4242 4242"
              className="w-full text-xs font-mono px-3 py-2 pl-9 rounded-md border border-border-medium bg-surface text-espresso-950 focus-ring"
            />
            <CreditCard className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-espresso-950 mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setCardHolder(val);
                if (onPaymentValidChange) {
                  onPaymentValidChange(cardType !== 'declined', {
                    cardNumber,
                    cardHolder: val,
                    expiry,
                    status: cardType === 'declined' ? 'declined' : 'valid',
                  });
                }
              }}
              placeholder="Alex Morgan"
              className="w-full text-xs font-sans px-3 py-2 rounded-md border border-border-medium bg-surface text-espresso-950 uppercase focus-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-espresso-950 mb-1">
                Expiry
              </label>
              <input
                type="text"
                maxLength={5}
                value={expiry}
                onChange={(e) => {
                  setExpiry(e.target.value);
                  if (onPaymentValidChange) {
                    onPaymentValidChange(cardType !== 'declined', {
                      cardNumber,
                      cardHolder,
                      expiry: e.target.value,
                      status: cardType === 'declined' ? 'declined' : 'valid',
                    });
                  }
                }}
                placeholder="12/28"
                className="w-full text-xs font-mono px-3 py-2 rounded-md border border-border-medium bg-surface text-espresso-950 text-center focus-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-espresso-950 mb-1">
                CVC
              </label>
              <input
                type="text"
                maxLength={4}
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="888"
                className="w-full text-xs font-mono px-3 py-2 rounded-md border border-border-medium bg-surface text-espresso-950 text-center focus-ring"
              />
            </div>
          </div>
        </div>

        {cardType === 'declined' ? (
          <div className="p-2.5 rounded-md bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Simulated Card Decline Mode activated. Submitting will test card decline handling.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-charcoal-500 font-sans pt-1">
            <ShieldCheck className="w-4 h-4 text-olive-600 shrink-0" />
            <span>256-bit encrypted simulated checkout. Instant confirmation receipt.</span>
          </div>
        )}
      </div>
    </div>
  );
};