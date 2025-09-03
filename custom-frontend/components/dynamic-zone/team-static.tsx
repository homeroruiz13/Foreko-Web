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
                  <div className="flex flex-col lg:flex-row gap-10 w-full max-w-7xl">
                    {testimonials.map((item: any, index: number) => (
                      <div key={`founder-${index}`} className="bg-neutral-900/50 rounded-3xl p-8 border border-neutral-800 hover:border-neutral-700 transition-colors flex-1 flex flex-col gap-4">
                        {/* Image section */}
                        <div className="flex justify-center items-center pt-2">
                          <Image
                            className="rounded-full"
                            src={getImageUrl(item.user?.image?.url || "/images/square.png")}
                            width={100}
                            height={100}
                            alt={`${item.user?.firstname || ""} ${item.user?.lastname || ""}`}
                          />
                        </div>
                        
                        {/* Name/title section */}
                        <div className="text-center">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {item.user?.firstname || ""} {item.user?.lastname || ""}
                          </h3>
                          <p className="text-neutral-400 text-base">
                            {item.user?.job || ""}
                          </p>
                        </div>

                        {/* Text section */}
                        <p className="text-neutral-300 text-sm leading-relaxed text-center flex-grow px-3">
                          {item.text}
                        </p>

                        {/* LinkedIn button section */}
                        <div className="flex justify-center pb-2">
                          {item.user?.linkedin ? (
                            <a
                              href={item.user.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors text-sm font-medium"
                            >
                              <FaLinkedin className="h-4 w-4" />
                              Connect on LinkedIn
                            </a>
                          ) : (
                            <div className="h-[44px] w-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Team Layout */
              <div className="mt-16 pb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((item: any, index: number) => (
                    <div key={`team-${index}`} className="bg-neutral-900/50 rounded-3xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors grid grid-rows-[100px_80px_1fr_auto] gap-4">
                      {/* Image section - fixed grid row height */}
                      <div className="flex justify-center items-center">
                        <Image
                          className="rounded-full"
                          src={getImageUrl(item.user?.image?.url || "/images/square.png")}
                          width={100}
                          height={100}
                          alt={`${item.user?.firstname || ""} ${item.user?.lastname || ""}`}
                        />
                      </div>
                      
                      {/* Name/title section - fixed grid row height */}
                      <div className="text-center flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {item.user?.firstname || ""} {item.user?.lastname || ""}
                        </h3>
                        <p className="text-neutral-400 text-base">
                          {item.user?.job || ""}
                        </p>
                      </div>

                      {/* Text section - flexible grid row (1fr) */}
                      <p className="text-neutral-300 text-sm leading-relaxed text-center">
                        {item.text}
                      </p>

                      {/* LinkedIn button section - auto height, always at bottom */}
                      <div className="flex justify-center items-end">
                        {item.user?.linkedin ? (
                          <a
                            href={item.user.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                          >
                            <FaLinkedin className="h-4 w-4" />
                            Connect on LinkedIn
                          </a>
                        ) : (
                          <div className="h-[40px] w-full"></div>
                        )}
                      </div>
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