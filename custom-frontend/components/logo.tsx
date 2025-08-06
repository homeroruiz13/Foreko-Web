import React from "react";

import { Link } from "next-view-transitions";
import { BlurImage } from "./blur-image";

import { getImageUrl } from "@/lib/api/imageUtils";
import { Image } from "@/types/types";

export const Logo = ({ image, locale }: { image?: Image, locale?: string }) => {
  return (
    <Link
      href={`/${locale || 'en'}`}
      className="font-normal flex space-x-2 items-center text-sm mr-4  text-black   relative z-20"
    >
      {image && (
        <BlurImage
          src={getImageUrl(image?.url)}
          alt={image.alternativeText || "Foreko Logo"}
          width={200}
          height={200}
          className="h-14 w-14 rounded-xl"
        />
      )}
    </Link>
  );
};
