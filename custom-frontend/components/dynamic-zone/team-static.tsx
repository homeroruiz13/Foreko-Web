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
            {/* Check if this is the founders section */}
            {heading.toLowerCase().includes("founder") ? (
              /* Founders Layout */
              <div className="mt-16 pb-20">
                <div className="flex justify-center">
                  <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
                    {testimonials.map((item: any, index: number) => (
                      <div key={`founder-${index}`} className="bg-neutral-900/50 rounded-3xl p-12 border border-neutral-800 hover:border-neutral-700 transition-colors flex-1">
                        <div className="flex justify-center mb-8">
                          <Image
                            className="rounded-full"
                            src={getImageUrl(item.user?.image?.url || "/images/square.png")}
                            width={120}
                            height={120}
                            alt={`${item.user?.firstname || ""} ${item.user?.lastname || ""}`}
                          />
                        </div>
                        
                        <div className="text-center mb-6">
                          <h3 className="text-3xl font-bold text-white mb-2">
                            {item.user?.firstname || ""} {item.user?.lastname || ""}
                          </h3>
                          <p className="text-neutral-400 text-lg">
                            {item.user?.job || ""}
                          </p>
                        </div>

                        <p className="text-neutral-300 text-base leading-relaxed mb-8 text-center">
                          {item.text}
                        </p>

                        {item.user?.linkedin && (
                          <div className="flex justify-center">
                            <a
                              href={item.user.linkedin}
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
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Team Layout */
              <div className="mt-16 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {testimonials.map((item: any, index: number) => (
                    <div key={`team-${index}`} className="bg-neutral-900/50 rounded-3xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
                      <div className="flex justify-center mb-6">
                        <Image
                          className="rounded-full"
                          src={getImageUrl(item.user?.image?.url || "/images/square.png")}
                          width={100}
                          height={100}
                          alt={`${item.user?.firstname || ""} ${item.user?.lastname || ""}`}
                        />
                      </div>
                      
                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {item.user?.firstname || ""} {item.user?.lastname || ""}
                        </h3>
                        <p className="text-neutral-400 text-base">
                          {item.user?.job || ""}
                        </p>
                      </div>

                      <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                        {item.text}
                      </p>

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
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};