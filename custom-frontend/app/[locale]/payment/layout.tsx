import React from 'react';

export default function PaymentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout overrides the main layout to provide a full-screen experience
    // No navbar or footer should appear on payment pages
    return (
        <div className="min-h-screen w-full bg-charcoal">
            {children}
        </div>
    );
}