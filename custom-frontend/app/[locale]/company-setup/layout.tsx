import React from 'react';

export default function CompanySetupLayout({
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