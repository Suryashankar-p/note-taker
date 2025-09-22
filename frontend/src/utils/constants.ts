import { GlobalWorkerOptions, version } from "pdfjs-dist";
import { FaFile, FaGlobe, FaRobot } from "react-icons/fa6";
import { IconType } from "react-icons/lib";

export const months: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const years: string[] = [
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
];

export type Member = {
  name: string;
  email: string;
  role: string;
  initials: string;
  memberId?: string;
};

export const url = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

export const Languages = [
  {
    name: "Bahasa",
    value: "id",
    subname: "Indonesia",
  },
  {
    name: "Thai",
    value: "th",
    subname: "Thailand",
  },
  {
    name: "Vietnamese",
    value: "vi",
    subname: "Vietnam",
  },
  {
    name: "Spanish",
    value: "es",
    subname: "Spain",
  },
  {
    name: "Portuguese",
    value: "pt-pt",
    subname: "Portugal",
  },
  {
    name: "Italian",
    value: "it",
    subname: "Italy",
  },
  {
    name: "French",
    value: "fr",
    subname: "France",
  },
  {
    name: "German",
    value: "de",
    subname: "Germany",
  },
];

export const listValuesWithReviewer = [
  { name: "Owner" },
  { name: "Reviewer" },
  { name: "Member" },
];

export const listValuesWithoutReviewer = [
  { name: "Owner" },
  { name: "Member" },
];

export const roleMappingWithReviewer = {
  Owner: "OWNER",
  Reviewer: "REVIEWER",
  Member: "MEMBER",
} as const;

export const roleMappingWithoutReviewer = {
  Owner: "OWNER",
  Member: "MEMBER",
} as const;



export const roleMapping_sales = {
  Owner: "OWNER",
  Reviewer: "REVIEWER",
  Member: "MEMBER",
} as const;

export const roleMapping_normal = {
  Owner: "OWNER",
  Member: "MEMBER",
} as const;

export const listValues_sales = [
  { name: "Owner" },
  { name: "Reviewer" },
  { name: "Member" },
];
export const listValues_normal = [{ name: "Owner" }, { name: "Member" }];


export const iconMapping: Record<string, IconType> = {
  "Thermax GPT": FaRobot,
  "Document Analyzer": FaFile,
  "Deep Search": FaGlobe,
};