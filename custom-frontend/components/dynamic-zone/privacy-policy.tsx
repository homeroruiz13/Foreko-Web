"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Container } from "../container";
import { Heading } from "../elements/heading";
import { Subheading } from "../elements/subheading";
import Link from "next/link";

export const PrivacyPolicy = ({ 
  heading, 
  sub_heading 
}: { 
  heading: string; 
  sub_heading: string; 
}) => {
  const [activeSection, setActiveSection] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => [
    { id: "introduction", title: "Introduction" },
    { id: "core-principles", title: "Our Core Privacy Principles" },
    { id: "why-we-process", title: "Why We Process Your Information" },
    { id: "information-we-collect", title: "Information We Collect" },
    { id: "cookies-tracking", title: "How We Use Cookies and Tracking" },
    { id: "sharing-information", title: "How We Share Your Information" },
    { id: "your-rights", title: "Your Rights" },
    { id: "data-transfers", title: "Data Transfers and Storage" },
    { id: "data-retention", title: "Data Retention" },
    { id: "security", title: "Security" },
    { id: "ai-automated", title: "AI and Automated Decision Making" },
    { id: "policy-changes", title: "Changes to This Policy" }
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
                    <h2 className="text-2xl font-bold text-white mb-6">Introduction</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        At Foreko, our mission is to help businesses make smarter inventory and operational decisions through AI-powered forecasting, analytics, and business intelligence. To do this, we collect and use information from:
                      </p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Businesses (merchants) using Foreko to manage inventory, analyze performance, or run financial forecasts</li>
                        <li>Account users managing their company&apos;s Foreko dashboard</li>
                        <li>Visitors to our website</li>
                        <li>Partners or team members invited to join company accounts</li>
                        <li>Individuals contacting Foreko support</li>
                      </ul>
                      <p className="leading-relaxed">
                        This Privacy Policy explains how we collect, use, and protect your personal information. If we make significant changes to our practices, we&apos;ll notify you via email or through your Foreko dashboard.
                      </p>
                    </div>
                  </section>

                  {/* Core Privacy Principles */}
                  <section id="core-principles" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Our Core Privacy Principles</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                        <div className="flex items-start space-x-4">
                          <span className="text-2xl">🔐</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-3">Your Information Belongs to You</h3>
                            <p className="text-neutral-300 leading-relaxed">
                              We only collect what we need to provide you with Foreko&apos;s services. We avoid storing unnecessary data and anonymize or delete it when no longer required.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                        <div className="flex items-start space-x-4">
                          <span className="text-2xl">🧱</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-3">We Protect Your Information</h3>
                            <p className="text-neutral-300 leading-relaxed">
                              We never sell your data. We only share your information with trusted third parties (like Stripe for billing) when necessary, and always under strict contractual terms.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
                        <div className="flex items-start space-x-4">
                          <span className="text-2xl">🛠</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-3">We Help You Stay Compliant</h3>
                            <p className="text-neutral-300 leading-relaxed">
                              Our tools are designed to help your team operate in a privacy-conscious way. We minimize tracking and offer tools to access, edit, or delete your data.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Why We Process Your Information */}
                  <section id="why-we-process" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Why We Process Your Information</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">We process your information to:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Authenticate user accounts and secure logins</li>
                        <li>Power your company&apos;s real-time dashboards</li>
                        <li>Forecast demand, stock levels, and financial performance</li>
                        <li>Enable subscription billing via Stripe</li>
                        <li>Provide customer support</li>
                        <li>Improve and test features</li>
                        <li>Prevent fraud or abuse</li>
                        <li>Meet legal obligations</li>
                      </ul>
                      <p className="leading-relaxed">
                        Where legally required, we obtain your consent. Otherwise, we rely on contractual obligations or legitimate interest to process data.
                      </p>
                    </div>
                  </section>

                  {/* Information We Collect */}
                  <section id="information-we-collect" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Information We Collect</h2>
                    <p className="text-neutral-300 leading-relaxed mb-6">
                      Depending on your use of Foreko, we may collect:
                    </p>
                    
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full bg-neutral-900 rounded-lg border border-neutral-800">
                        <thead>
                          <tr className="border-b border-neutral-800">
                            <th className="text-left p-4 text-white font-semibold">Category</th>
                            <th className="text-left p-4 text-white font-semibold">Examples</th>
                          </tr>
                        </thead>
                        <tbody className="text-neutral-300">
                          <tr className="border-b border-neutral-800">
                            <td className="p-4 font-medium">Identifiers</td>
                            <td className="p-4">Name, email, IP address, company name</td>
                          </tr>
                          <tr className="border-b border-neutral-800">
                            <td className="p-4 font-medium">Account Info</td>
                            <td className="p-4">Login credentials, company invitations</td>
                          </tr>
                          <tr className="border-b border-neutral-800">
                            <td className="p-4 font-medium">Payment Info</td>
                            <td className="p-4">Subscription plan, Stripe tokenized data</td>
                          </tr>
                          <tr className="border-b border-neutral-800">
                            <td className="p-4 font-medium">Usage Data</td>
                            <td className="p-4">Logins, feature usage, click events</td>
                          </tr>
                          <tr className="border-b border-neutral-800">
                            <td className="p-4 font-medium">Device Data</td>
                            <td className="p-4">IP address, browser info, location (approx.)</td>
                          </tr>
                          <tr>
                            <td className="p-4 font-medium">Support Data</td>
                            <td className="p-4">Messages you send us via contact forms</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <p className="text-neutral-300 leading-relaxed">
                      We collect this information via forms, APIs, cookies, and third-party integrations (e.g., Stripe or OAuth logins).
                    </p>
                  </section>

                  {/* Cookies and Tracking */}
                  <section id="cookies-tracking" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">How We Use Cookies and Tracking</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        Foreko uses cookies and similar tracking technologies to:
                      </p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Keep you logged in</li>
                        <li>Understand platform usage</li>
                        <li>Improve product performance</li>
                      </ul>
                      <p className="leading-relaxed">
                        You can manage cookie preferences via your browser settings. For more details, see our Cookie Policy.
                      </p>
                    </div>
                  </section>

                  {/* How We Share Your Information */}
                  <section id="sharing-information" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">How We Share Your Information</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">We may share your information with:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Service providers (e.g., Stripe for billing, Vercel for hosting)</li>
                        <li>Security partners for fraud detection</li>
                        <li>Analytics tools to help improve the platform</li>
                        <li>Legal authorities when required by law</li>
                      </ul>
                      <p className="leading-relaxed">
                        We never sell your data or share it for advertising purposes.
                      </p>
                    </div>
                  </section>

                  {/* Your Rights */}
                  <section id="your-rights" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Your Rights</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">You can:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Access your data</li>
                        <li>Update your profile or company info</li>
                        <li>Request deletion of your account and personal data</li>
                        <li>Opt out of marketing emails at any time</li>
                      </ul>
                      <p className="leading-relaxed">
                        To exercise these rights, email us at{" "}
                        <a href="mailto:privacy@foreko.com" className="text-blue-400 hover:text-blue-300 underline">
                          privacy@foreko.com
                        </a>{" "}
                        or use the &quot;Delete My Account&quot; option in your dashboard (if available).
                      </p>
                    </div>
                  </section>

                  {/* Data Transfers and Storage */}
                  <section id="data-transfers" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Data Transfers and Storage</h2>
                    <p className="text-neutral-300 leading-relaxed">
                      Foreko is based in the United States, but we may process data globally through secure third-party services. When transferring data internationally, we follow best practices to ensure protection (e.g., using Standard Contractual Clauses).
                    </p>
                  </section>

                  {/* Data Retention */}
                  <section id="data-retention" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Data Retention</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">We retain your information:</p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>As long as you have an active account</li>
                        <li>As needed for legal, audit, or fraud prevention purposes</li>
                      </ul>
                      <p className="leading-relaxed">
                        If your account is deleted, we may retain anonymized or aggregated data but will delete or anonymize personal identifiers within 90 days unless legally required otherwise.
                      </p>
                    </div>
                  </section>

                  {/* Security */}
                  <section id="security" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Security</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        We implement security best practices, including:
                      </p>
                      <ul className="space-y-2 pl-6 list-disc">
                        <li>Password hashing</li>
                        <li>HTTPS and data encryption</li>
                        <li>Session and token controls</li>
                        <li>Regular audits and access logging</li>
                      </ul>
                      <p className="leading-relaxed">
                        While no platform is 100% secure, we work hard to protect your data.
                      </p>
                    </div>
                  </section>

                  {/* AI and Automated Decision Making */}
                  <section id="ai-automated" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">AI and Automated Decision Making</h2>
                    <p className="text-neutral-300 leading-relaxed">
                      Foreko uses AI models to provide demand forecasting, inventory optimization, and business insights. These models never make legally binding decisions on your behalf, and we do not use AI to profile users in a way that impacts their rights or obligations.
                    </p>
                  </section>

                  {/* Changes to This Policy */}
                  <section id="policy-changes" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Changes to This Policy</h2>
                    <p className="text-neutral-300 leading-relaxed">
                      We may update this policy from time to time. If we make significant changes, we will notify you via your account email or through an in-app message.
                    </p>
                  </section>

                </div>
              </div>
            </div>
          </div>

          {/* Questions About Privacy - Outside of scrollable content */}
          <div className="mt-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between p-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Questions About Privacy?</h2>
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