import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Foreko",
  version: packageJson.version,
  copyright: `© ${currentYear}, Foreko.`,
  meta: {
    title: "Foreko - Launch Pad Dashboard",
    description:
      "Foreko Launch Pad - Your comprehensive business intelligence and operations dashboard for managing and monitoring your enterprise systems.",
  },
};
