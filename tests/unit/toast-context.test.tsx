import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/context/ToastContext';

const TestComponent = () => {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast.success('Saved to Cart', '250g bag added')}>
        Trigger Success
      </button>
      <button onClick={() => toast.error('Out of Stock', 'Micro-lot is depleted')}>
        Trigger Error
      </button>
    </div>
  );
};

describe('ToastContext & Notification System', () => {
  it('dispatches success toast and renders notification alert', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const successBtn = screen.getByRole('button', { name: /trigger success/i });
    fireEvent.click(successBtn);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Saved to Cart/i)).toBeInTheDocument();
    expect(screen.getByText(/250g bag added/i)).toBeInTheDocument();
  });

  it('dispatches error toast and renders alert', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const errorBtn = screen.getByRole('button', { name: /trigger error/i });
    fireEvent.click(errorBtn);

    expect(screen.getByText(/Out of Stock/i)).toBeInTheDocument();
    expect(screen.getByText(/Micro-lot is depleted/i)).toBeInTheDocument();
  });
});
