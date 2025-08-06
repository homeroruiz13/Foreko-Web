"use client";
import React from "react";
import Image from "next/image";
import { FeatureIconContainer } from "./features/feature-icon-container";
import { Heading } from "../elements/heading";
import { Subheading } from "../elements/subheading";
import { TbLocationBolt } from "react-icons/tb";
import { AmbientColor } from "../decorations/ambient-color";
import { getImageUrl } from "@/lib/api/imageUtils";
import { FaLinkedin } from "react-icons/fa";
import { Container } from "../container";

export const TeamStatic = ({ heading, sub_heading, testimonials }: { heading: string, sub_heading: string, testimonials: any }) => {
  return (
    <div className="relative pt-40">
      <AmbientColor />
      <Container>
        <FeatureIconContainer className="flex justify-center items-center overflow-hidden">
          <TbLocationBolt className="h-6 w-6 text-white" />
        </FeatureIconContainer>
        <Heading className="pt-4">{heading}</Heading>
        <Subheading className="max-w-3xl mx-auto">
          {sub_heading}
        </Subheading>

        {testimonials && (
          <div className="max-w-7xl mx-auto">
            {/* Single person layout for CEO/President */}
            {testimonials.length === 1 ? (
              <div className="flex justify-center mt-16 pb-20">
                <div className="bg-neutral-900/50 rounded-3xl p-12 border border-neutral-800 hover:border-neutral-700 transition-colors max-w-2xl w-full">
                  {/* Profile Image */}
                  <div className="flex justify-center mb-8">
                    <Image
                      className="rounded-full"
                      src={getImageUrl(testimonials[0].user?.image?.url || "/images/square.png")}
                      width={120}
                      height={120}
                      alt={`${testimonials[0].user?.firstname || ""} ${testimonials[0].user?.lastname || ""}`}
                    />
                  </div>
                  
                  {/* Name and Title */}
                  <div className="text-center mb-6">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {testimonials[0].user?.firstname || ""} {testimonials[0].user?.lastname || ""}
                    </h3>
                    <p className="text-neutral-400 text-lg">
                      {testimonials[0].user?.job || ""}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-neutral-300 text-base leading-relaxed mb-8 text-center">
                    {testimonials[0].text}
                  </p>

                  {/* LinkedIn Link */}
                  {testimonials[0].user?.linkedin && (
                    <div className="flex justify-center">
                      <a
                        href={testimonials[0].user.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                      >
                        <FaLinkedin className="h-5 w-5" />
                        Connect on LinkedIn
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Multiple people layout for team */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 pb-20">
                {testimonials.map((item: any, index: number) => (
                  <div key={index} className="bg-neutral-900/50 rounded-3xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors">
                    {/* Profile Image */}
                    <div className="flex justify-center mb-6">
                      <Image
                        className="rounded-full"
                        src={getImageUrl(item.user?.image?.url || "/images/square.png")}
                        width={100}
                        height={100}
                        alt={`${item.user?.firstname || ""} ${item.user?.lastname || ""}`}
                      />
                    </div>
                    
                    {/* Name and Title */}
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {item.user?.firstname || ""} {item.user?.lastname || ""}
                      </h3>
                      <p className="text-neutral-400 text-base">
                        {item.user?.job || ""}
                      </p>
                    </div>

                    {/* Bio */}
                    <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                      {item.text}
                    </p>

                    {/* LinkedIn Link */}
                    {item.user?.linkedin && (
                      <div className="flex justify-center">
                        <a
                          href={item.user.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          <FaLinkedin className="h-4 w-4" />
                          Connect on LinkedIn
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};