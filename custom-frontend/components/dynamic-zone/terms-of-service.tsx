"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Container } from "../container";
import { Heading } from "../elements/heading";
import { Subheading } from "../elements/subheading";
import Link from "next/link";

export const TermsOfService = ({ 
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
    { id: "account-terms", title: "Account Terms" },
    { id: "account-activation", title: "Account Activation and Users" },
    { id: "use-of-services", title: "Use of the Services" },
    { id: "subscription-payment", title: "Subscription and Payment Terms" },
    { id: "integrations", title: "Integrations and Third-Party Services" },
    { id: "confidentiality", title: "Confidentiality" },
    { id: "limitation-liability", title: "Limitation of Liability" },
    { id: "data-rights", title: "Data Rights and Security" },
    { id: "termination", title: "Termination" },
    { id: "modifications", title: "Modifications to the Services or Terms" },
    { id: "feedback", title: "Feedback" },
    { id: "governing-law", title: "Governing Law" }
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
                        Welcome to Foreko. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Foreko platform, services, software, and website (collectively, the &quot;Services&quot;), provided by Foreko Inc. (&quot;Foreko,&quot; &quot;we,&quot; or &quot;us&quot;).
                      </p>
                      <p className="leading-relaxed">
                        By signing up for an account, accessing, or using Foreko, you agree to be bound by these Terms. If you are using Foreko on behalf of an organization, you agree to these Terms on behalf of that organization.
                      </p>
                    </div>
                  </section>

                  {/* Account Terms */}
                  <section id="account-terms" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">1. Account Terms</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-3 pl-6 list-disc">
                        <li className="leading-relaxed">To use Foreko, you must register for an account and provide accurate information, including your full name, a valid business email, and any required company details.</li>
                        <li className="leading-relaxed">You must be at least 18 years old or the age of majority in your jurisdiction to open an account.</li>
                        <li className="leading-relaxed">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
                        <li className="leading-relaxed">You must not use Foreko for personal or non-commercial purposes. Our platform is built for businesses.</li>
                        <li className="leading-relaxed">We reserve the right to refuse service, suspend, or terminate accounts at our discretion if terms are violated or misuse is detected.</li>
                        <li className="leading-relaxed">Foreko may contact you through the email address provided for important updates and service notices. You are responsible for monitoring this address.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Account Activation and Users */}
                  <section id="account-activation" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">2. Account Activation and Users</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-3 pl-6 list-disc">
                        <li className="leading-relaxed">The person creating the Foreko account is the account owner and responsible for all activity within the workspace.</li>
                        <li className="leading-relaxed">You may invite team members (staff accounts) to collaborate within your workspace. The account owner remains responsible for managing permissions and activity.</li>
                        <li className="leading-relaxed">If you are registering on behalf of a company or employer, you represent that you have the authority to bind that entity to these Terms.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Use of the Services */}
                  <section id="use-of-services" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">3. Use of the Services</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-3 pl-6 list-disc">
                        <li className="leading-relaxed">You agree not to reproduce, duplicate, copy, sell, resell, or exploit any portion of the Services without Foreko&apos;s express written permission.</li>
                        <li className="leading-relaxed">You must not interfere with the Services or attempt to reverse engineer, bypass security features, or access the Services using automated means (e.g., bots, scrapers).</li>
                        <li className="leading-relaxed">You understand that any data, content, or materials you upload to Foreko (&quot;Materials&quot;) may be transmitted and stored securely but not always encrypted in transit.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Subscription and Payment Terms */}
                  <section id="subscription-payment" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">4. Subscription and Payment Terms</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-3 pl-6 list-disc">
                        <li className="leading-relaxed">Access to certain features of Foreko requires a subscription. Subscription fees are billed in advance on a monthly or annual basis.</li>
                        <li className="leading-relaxed">All payments are handled securely through Stripe. You agree to maintain a valid payment method on file.</li>
                        <li className="leading-relaxed">Failure to pay fees may result in suspension or termination of your access.</li>
                        <li className="leading-relaxed">Fees are non-refundable except where required by law.</li>
                        <li className="leading-relaxed">You are responsible for all applicable taxes based on your billing address.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Integrations and Third-Party Services */}
                  <section id="integrations" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">5. Integrations and Third-Party Services</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-3 pl-6 list-disc">
                        <li className="leading-relaxed">Foreko integrates with third-party platforms (e.g., Stripe, Microsoft, Google) for sign-in, payments, and data enrichment.</li>
                        <li className="leading-relaxed">By enabling integrations, you authorize us to exchange relevant data with those third parties.</li>
                        <li className="leading-relaxed">We are not responsible for third-party services and disclaim liability for any issues arising from their use.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Confidentiality */}
                  <section id="confidentiality" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">6. Confidentiality</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-3 pl-6 list-disc">
                        <li className="leading-relaxed">Both parties agree to treat each other&apos;s confidential information with care and not disclose it to unauthorized parties.</li>
                        <li className="leading-relaxed">&quot;Confidential Information&quot; includes all non-public business, technical, and customer data disclosed under this agreement.</li>
                        <li className="leading-relaxed">This section survives termination of the agreement.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Limitation of Liability */}
                  <section id="limitation-liability" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">7. Limitation of Liability</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-3 pl-6 list-disc">
                        <li className="leading-relaxed">The Services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind.</li>
                        <li className="leading-relaxed">To the maximum extent permitted by law, Foreko shall not be liable for any indirect, incidental, special, or consequential damages.</li>
                        <li className="leading-relaxed">In no event will Foreko&apos;s total liability exceed the amount paid by you to us in the twelve months prior to the claim.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Data Rights and Security */}
                  <section id="data-rights" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">8. Data Rights and Security</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-3 pl-6 list-disc">
                        <li className="leading-relaxed">You retain ownership of your data. We use your data only to provide and improve the Services.</li>
                        <li className="leading-relaxed">We implement technical and organizational measures to protect your data, but no system is 100% secure.</li>
                        <li className="leading-relaxed">For more details, see our Privacy Policy.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Termination */}
                  <section id="termination" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">9. Termination</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-3 pl-6 list-disc">
                        <li className="leading-relaxed">You may terminate your account at any time. Termination will cancel future billing but will not entitle you to refunds.</li>
                        <li className="leading-relaxed">We may suspend or terminate your account if you breach these Terms or engage in activities that threaten the security or integrity of our systems or users.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Modifications to the Services or Terms */}
                  <section id="modifications" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">10. Modifications to the Services or Terms</h2>
                    <div className="space-y-4 text-neutral-300">
                      <ul className="space-y-3 pl-6 list-disc">
                        <li className="leading-relaxed">We may modify these Terms or our Services from time to time. We&apos;ll notify you of any material changes via email or in-app.</li>
                        <li className="leading-relaxed">Continued use of Foreko after changes indicates your acceptance of the updated Terms.</li>
                      </ul>
                    </div>
                  </section>

                  {/* Feedback */}
                  <section id="feedback" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">11. Feedback</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        If you submit suggestions or feedback about Foreko, you grant us a non-exclusive, perpetual, royalty-free license to use it without obligation or compensation.
                      </p>
                    </div>
                  </section>

                  {/* Governing Law */}
                  <section id="governing-law" className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">12. Governing Law</h2>
                    <div className="space-y-4 text-neutral-300">
                      <p className="leading-relaxed">
                        These Terms are governed by the laws of the State of [Insert Your State] and the United States, without regard to conflict of law principles.
                      </p>
                      <p className="leading-relaxed">
                        Disputes will be resolved in the courts of [Insert State or County Jurisdiction].
                      </p>
                    </div>
                  </section>

                </div>
              </div>
            </div>
          </div>

          {/* Questions About Our Terms - Outside of scrollable content */}
          <div className="mt-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between p-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Questions About Our Terms?</h2>
                <p className="text-neutral-300 leading-relaxed">
                  We believe in transparent, fair business practices
                </p>
              </div>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};