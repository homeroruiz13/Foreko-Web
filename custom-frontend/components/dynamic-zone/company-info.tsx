"use client";

import React from "react";
import { Container } from "../container";
import { Heading } from "../elements/heading";
import { Subheading } from "../elements/subheading";

export const CompanyInfo = ({ 
  heading, 
  sub_heading 
}: { 
  heading: string; 
  sub_heading: string; 
}) => {
  return (
    <div className="pt-20">
      <Container>
        <Heading className="pt-4">{heading}</Heading>
        <Subheading className="max-w-3xl mx-auto">
          {sub_heading}
        </Subheading>
        
        <div className="max-w-4xl mx-auto py-20">
          <div className="bg-neutral-900 rounded-3xl border-2 border-neutral-800 p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neutral-300 mb-1">General Inquiries</h4>
                    <a href="mailto:hello@foreko.com" className="text-blue-400 hover:text-blue-300">
                      hello@foreko.com
                    </a>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-300 mb-1">Technical Support</h4>
                    <a href="mailto:support@foreko.com" className="text-blue-400 hover:text-blue-300">
                      support@foreko.com
                    </a>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-300 mb-1">Sales Team</h4>
                    <a href="mailto:sales@foreko.com" className="text-blue-400 hover:text-blue-300">
                      sales@foreko.com
                    </a>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-300 mb-1">Phone Support</h4>
                    <a href="tel:+15551234567" className="text-blue-400 hover:text-blue-300">
                      +1 (555) 123-4567
                    </a>
                    <p className="text-sm text-neutral-500">Monday-Friday, 9 AM - 6 PM EST</p>
                  </div>
                </div>
              </div>

              {/* Company Details */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Company Details</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neutral-300 mb-1">Headquarters</h4>
                    <p className="text-white">
                      Foreko Technologies Inc.<br />
                      1234 Innovation Drive<br />
                      Suite 567<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-300 mb-1">Business Hours</h4>
                    <div className="text-white space-y-1">
                      <p>Monday - Friday: 8:00 AM - 7:00 PM EST</p>
                      <p>Saturday: 10:00 AM - 4:00 PM EST</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-300 mb-1">Response Times</h4>
                    <div className="text-white space-y-1">
                      <p>Live Chat: Immediate</p>
                      <p>Email: Within 4 hours</p>
                      <p>Phone: Immediate during business hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 pt-8 border-t border-neutral-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <h4 className="font-medium text-neutral-300 mb-2">Emergency Support</h4>
                  <p className="text-sm text-neutral-500">
                    24/7 emergency support available for Enterprise customers
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-300 mb-2">Community</h4>
                  <p className="text-sm text-neutral-500">
                    Join our community forum and follow @foreko on social media
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-300 mb-2">Documentation</h4>
                  <p className="text-sm text-neutral-500">
                    Comprehensive guides and API documentation available online
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};