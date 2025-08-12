import React from 'react';

export default function SubscriptionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout overrides the main layout to provide a full-screen experience
    // No navbar or footer should appear on subscription pages
    return (
        <div className="min-h-screen w-full bg-charcoal">
            {children}
        </div>
    );
}