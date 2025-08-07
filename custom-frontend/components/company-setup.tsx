"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "./container";
import { Logo } from "./logo";
import { Button } from "./elements/button";
import { AmbientColor } from "./decorations/ambient-color";
import StarBackground from "./decorations/star-background";
import ShootingStars from "./decorations/shooting-star";

export const CompanySetup = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate all fields are filled
    if (!formData.companyName || !formData.industry || !formData.role) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/company/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          companyName: formData.companyName,
          industry: formData.industry,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Company setup successful, redirect to subscription selection
        router.push('/subscription');
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Company setup error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Retail',
    'Education',
    'Real Estate',
    'Marketing & Advertising',
    'Construction',
    'Transportation',
    'Other'
  ];

  const roles = [
    'CEO/Founder',
    'CTO/VP of Engineering',
    'Product Manager',
    'Operations Manager',
    'Marketing Manager',
    'Sales Manager',
    'Data Analyst',
    'Business Analyst',
    'Other'
  ];


  return (
    <div className="fixed inset-0 bg-charcoal z-50 overflow-hidden">
      <AmbientColor />
      <StarBackground />
      <ShootingStars />
      
      <Container className="relative h-screen max-w-2xl mx-auto flex flex-col items-center justify-center px-8 z-10">
        <div className="mb-8">
          <Logo />
        </div>
        
        {/* Welcome section */}
        <div className="text-center mb-12 max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            Welcome to Foreko
          </h1>
          <p className="text-lg text-neutral-300 mb-2">
            Let us know more about your company so we can
          </p>
          <p className="text-lg text-neutral-300 mb-6">
            customize the perfect dashboard experience for you
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-neutral-400 to-neutral-600 mx-auto rounded-full"></div>
        </div>

        {error && (
          <div className="w-full max-w-md mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form className="w-full max-w-md space-y-6" onSubmit={handleNext}>
          <div className="space-y-6">
            <div className="group">
              <label htmlFor="companyName" className="block text-sm font-semibold text-neutral-200 mb-3">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Enter your company name"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="h-14 px-4 w-full rounded-lg text-base bg-neutral-900/50 border border-neutral-700 text-white placeholder-neutral-400 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm"
              />
            </div>

            <div className="group">
              <label htmlFor="industry" className="block text-sm font-semibold text-neutral-200 mb-3">
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="h-14 px-4 w-full rounded-lg text-base bg-neutral-900/50 border border-neutral-700 text-white outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">Select your industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry} className="bg-neutral-800">
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div className="group">
              <label htmlFor="role" className="block text-sm font-semibold text-neutral-200 mb-3">
                Your Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="h-14 px-4 w-full rounded-lg text-base bg-neutral-900/50 border border-neutral-700 text-white outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/20 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">Select your role</option>
                {roles.map((role) => (
                  <option key={role} value={role} className="bg-neutral-800">
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <Button 
            variant="muted" 
            type="submit" 
            className="w-full py-4 mt-10 bg-white hover:bg-neutral-100 border-0 text-black font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
            disabled={loading}
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Continue
                  <svg className="w-5 h-5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </Button>
        </form>
        
        {/* Footer message */}
        <p className="text-neutral-500 text-center mt-8 text-sm">
          This information helps us create the most relevant insights for your business
        </p>
    </Container>
    </div>
  );
};