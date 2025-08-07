import React from 'react';

export default function SubscriptionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-full">
            {children}
        </div>
    );
}