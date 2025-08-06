"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Container } from "../container";
import { Heading } from "../elements/heading";
import { Subheading } from "../elements/subheading";
import Link from "next/link";

export const CookiePolicy = ({ 
  heading, 
  sub_heading 
}: { 
  heading: string; 
  sub_heading: string; 
}) => {
  const [activeSection, setActiveSection] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => [
    { id: "introduction", title: "What Are Cookies?" },
    { id: "types-of-cookies", title: "Types of Cookies We Use" },
    { id: "strictly-necessary", title: "Strictly Necessary Cookies" },
    { id: "functional", title: "Functional Cookies" },
    { id: "analytics", title: "Analytics and Performance Cookies" },
    { id: "marketing", title: "Marketing and Advertising Cookies" },
    { id: "social-media", title: "Social Media and Embedded Content Cookies" },
    { id: "cookie-duration", title: "Cookie Duration" },
    { id: "manage-cookies", title: "How to Manage Cookies" },
    { id: "policy-updates", title: "Updates to This Policy" }
  ], []);

  const scrollToSection = (sectionId: string) => {
    if (contentRef.current) {
      const targetElement = contentRef.current.querySelector(`#${sectionId}`);
      if (targetElement) {
        const containerTop = contentRef.current.offsetTop;
        const targetTop = (targetElement as HTMLElement).offsetTop;
        
        contentRef.current.scrollTo({
          top: targetTop - containerTop - 20,
          behavior: 'smooth'
        });
        setActiveSection(sectionId);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const scrollTop = contentRef.current.scrollTop;
      const containerHeight = contentRef.current.clientHeight;
      
      let currentSection = '';
      
      sections.forEach((section) => {
        const element = contentRef.current?.querySelector(`#${section.id}`);
        if (element) {
          const elementTop = (element as HTMLElement).offsetTop - contentRef.current!.offsetTop;
          const elementHeight = (element as HTMLElement).offsetHeight;
          
          if (scrollTop >= elementTop - 100 && scrollTop < elementTop + elementHeight - 100) {
            currentSection = section.id;
          }
        }
      });

      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    const container = contentRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeSection, sections]);

  return (
    <div className="py-20">
      <Container>        
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8 h-[calc(100vh-200px)]">
            {/* Table of Contents - Sticky Sidebar */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-8 bg-neutral-900 rounded-lg border border-neutral-800 h-full max-h-[800px] flex flex-col">
                <div className="p-6 border-b border-neutral-800">
                  <h3 className="text-lg font-semibold text-white">Table of Contents</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 privacy-toc">
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`block w-full text-left text-sm py-2 px-3 rounded transition-colors ${
                          activeSection === section.id 
                            ? 'bg-neutral-700 text-white' 
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div 
                ref={contentRef}
                className="h-full overflow-y-auto bg-neutral-950 rounded-lg border border-neutral-800 p-8 privacy-content"
              >
                <div className="max-w-none prose prose-neutral prose-invert">
                  
                  {/* Introduction */}
                  <section id="introduction" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">What Are Cookies?</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        A cookie is a small piece of data stored on your browser or device when you visit a website. Cookies help websites recognize your device, remember preferences, and improve your user experience. They also support functionality such as logins, analytics, personalization, and security.
                      </p>
                      <p className="leading-relaxed">
                        Foreko uses various types of cookies for different purposes:
                      </p>
                    </div>
                  </section>

                  {/* Types of Cookies */}
                  <section id="types-of-cookies" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Types of Cookies We Use</h2>
                    <p className="text-neutral-300 leading-relaxed">
                      We use several types of cookies to provide and improve our services:
                    </p>
                  </section>

                  {/* Strictly Necessary Cookies */}
                  <section id="strictly-necessary" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">1. Strictly Necessary Cookies</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        These cookies are essential to enable core functionality such as account login, session management, and security. Without them, the platform cannot function properly.
                      </p>
                      <p className="font-medium">Examples include:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Session authentication tokens</li>
                        <li>Load balancing and server identification</li>
                        <li>CSRF tokens</li>
                      </ul>
                    </div>
                  </section>

                  {/* Functional Cookies */}
                  <section id="functional" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">2. Functional Cookies</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        These cookies store user preferences such as region, theme, language, or &quot;remember me&quot; login settings.
                      </p>
                      <p className="font-medium">Examples include:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Remembering login state across sessions</li>
                        <li>UI customization settings (e.g., sidebar state)</li>
                        <li>Locale/language preference</li>
                      </ul>
                    </div>
                  </section>

                  {/* Analytics and Performance Cookies */}
                  <section id="analytics" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">3. Analytics and Performance Cookies</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        We use first- and third-party cookies (e.g., Google Analytics) to gather usage insights and platform performance metrics.
                      </p>
                      <p className="font-medium">These cookies help us:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Understand user behavior and platform usage</li>
                        <li>Improve our dashboards and features</li>
                        <li>Track navigation patterns and identify bugs</li>
                      </ul>
                      <p className="font-medium">Third-party examples:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Google Analytics: <a href="https://policies.google.com/privacy" className="text-blue-400 hover:text-blue-300 underline">https://policies.google.com/privacy</a></li>
                        <li>PostHog (if used): <a href="https://posthog.com/privacy" className="text-blue-400 hover:text-blue-300 underline">https://posthog.com/privacy</a></li>
                      </ul>
                    </div>
                  </section>

                  {/* Marketing and Advertising Cookies */}
                  <section id="marketing" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">4. Marketing and Advertising Cookies</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        Foreko may use marketing cookies on our public-facing site (e.g., foreko.com) to:
                      </p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Measure campaign effectiveness</li>
                        <li>Deliver relevant ads across Google, LinkedIn, or other ad platforms</li>
                      </ul>
                      <p className="leading-relaxed">
                        We do not use marketing cookies inside the Foreko dashboard or after user login.
                      </p>
                      <p className="font-medium">Third-party examples:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Google Ads: <a href="https://policies.google.com/privacy" className="text-blue-400 hover:text-blue-300 underline">https://policies.google.com/privacy</a></li>
                        <li>LinkedIn Ads: <a href="https://www.linkedin.com/legal/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">https://www.linkedin.com/legal/privacy-policy</a></li>
                      </ul>
                    </div>
                  </section>

                  {/* Social Media and Embedded Content Cookies */}
                  <section id="social-media" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">5. Social Media and Embedded Content Cookies</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        We may embed video players, social sharing buttons, or charts which rely on third-party cookies.
                      </p>
                      <p className="font-medium">Examples:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>YouTube (video embeds)</li>
                        <li>LinkedIn/Facebook share buttons</li>
                      </ul>
                    </div>
                  </section>

                  {/* Cookie Duration */}
                  <section id="cookie-duration" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Cookie Duration</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Session cookies expire when you close your browser.</li>
                        <li>Persistent cookies remain on your device for up to 2 years or until deleted.</li>
                      </ul>
                    </div>
                  </section>

                  {/* How to Manage Cookies */}
                  <section id="manage-cookies" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">How to Manage Cookies</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">You can control cookies in several ways:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Adjust your browser settings to block or delete cookies</li>
                        <li>Use browser extensions like uBlock Origin or Ghostery</li>
                        <li>Use &quot;Incognito&quot; or &quot;Private&quot; browsing modes</li>
                      </ul>
                      <p className="leading-relaxed">
                        To opt out of Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-400 hover:text-blue-300 underline">https://tools.google.com/dlpage/gaoptout</a>
                      </p>
                      <p className="leading-relaxed">
                        Please note that disabling cookies may affect your experience using Foreko, particularly in the dashboard where login and session management rely on them.
                      </p>
                    </div>
                  </section>

                  {/* Updates to This Policy */}
                  <section id="policy-updates" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Updates to This Policy</h2>
                    <p className="text-neutral-300 leading-relaxed">
                      We may update this Cookie Policy from time to time. We will notify you of any significant changes via your account dashboard or email.
                    </p>
                  </section>

                </div>
              </div>
            </div>
          </div>

          {/* Questions About Cookies - Outside of scrollable content */}
          <div className="mt-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between p-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Questions About Cookies?</h2>
                <p className="text-neutral-300 leading-relaxed">
                  Our privacy team is here to help with any concerns
                </p>
              </div>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                Contact Privacy Team
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};