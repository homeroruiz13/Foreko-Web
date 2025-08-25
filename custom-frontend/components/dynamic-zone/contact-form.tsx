"use client";

import React, { useState } from "react";
import { Container } from "../container";
import { Heading } from "../elements/heading";
import { Subheading } from "../elements/subheading";
import { Button } from "../elements/button";

export const ContactForm = ({ 
  heading, 
  sub_heading 
}: { 
  heading: string; 
  sub_heading: string; 
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    category: "",
    message: ""
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            fullName: "",
            email: "",
            phone: "",
            company: "",
            category: "",
            message: ""
          });
        }, 3000);
      } else {
        console.error('Failed to send message');
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="pt-20">
        <Container>
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
              Message Sent!
            </h2>
            <p className="text-neutral-400 text-lg">
              Thank you for contacting us. We&apos;ll get back to you soon.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <Container>
        <Heading className="pt-4">{heading}</Heading>
        <Subheading className="max-w-3xl mx-auto">
          {sub_heading}
        </Subheading>
        
        <div className="max-w-2xl mx-auto py-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="h-12 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-600"
              />
              
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-12 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-600"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-12 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-600"
              />
              
              <input
                type="text"
                name="company"
                placeholder="Company Name"
                value={formData.company}
                onChange={handleChange}
                required
                className="h-12 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-600"
              />
            </div>
            
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="h-12 pl-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-600"
            >
              <option value="">Select the type of issue we can help solve</option>
              <option value="inventory-management">Inventory Management</option>
              <option value="dashboard-setup">Dashboard Setup & Configuration</option>
              <option value="data-integration">Data Integration</option>
              <option value="reporting-analytics">Reporting & Analytics</option>
              <option value="technical-support">Technical Support</option>
              <option value="billing-account">Billing & Account Issues</option>
              <option value="feature-request">Feature Request</option>
              <option value="general-inquiry">General Inquiry</option>
              <option value="partnership">Partnership Opportunities</option>
              <option value="sales">Sales Inquiry</option>
            </select>
            
            <textarea
              name="message"
              placeholder="Message to send to Foreko"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="pl-4 pt-4 w-full rounded-md text-sm bg-charcoal border border-neutral-800 text-white placeholder-neutral-500 outline-none focus:outline-none active:outline-none focus:ring-2 focus:ring-neutral-600 resize-vertical"
            />
            
            <Button variant="muted" type="submit" disabled={isLoading} className="w-full py-3">
              <span className="text-sm">{isLoading ? 'Sending...' : 'Send Message'}</span>
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
};