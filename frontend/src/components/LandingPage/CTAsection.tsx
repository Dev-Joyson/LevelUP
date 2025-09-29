import React from "react";


import {
  ComponentInstanceIcon,
  Pencil2Icon,
  PieChartIcon,
  MagicWandIcon,
  CodeIcon,
  GearIcon,
  GlobeIcon,
  LaptopIcon,
  CheckCircledIcon
} from "@radix-ui/react-icons";


const categories = [
  {
    icon: <ComponentInstanceIcon className="text-primary" width={28} height={28} />,
    title: "AI & ML",
    jobs: 48,
  },
  {
    icon: <Pencil2Icon className="text-primary" width={28} height={28} />,
    title: "Design",
    jobs: 58,
  },
  {
    icon: <PieChartIcon className="text-primary" width={28} height={28} />,
    title: "Finance",
    jobs: 49,
  },
  {
    icon: <LaptopIcon className="text-primary" width={28} height={28} />,
    title: "IT",
    jobs: 15,
  },
  {
    icon: <MagicWandIcon className="text-primary" width={28} height={28} />,
    title: "Marketing",
    jobs: 33,
  },
  {
    icon: <CodeIcon className="text-primary" width={28} height={28} />,
    title: "Software",
    jobs: 39,
  },
  {
    icon: <GearIcon className="text-primary" width={28} height={28} />,
    title: "Technology",
    jobs: 38,
  },
  {
    icon: <GlobeIcon className="text-primary" width={28} height={28} />,
    title: "Web Development",
    jobs: 85,
  },
];

const CTAsection = () => {
  return (
    <section className=" md:py-24 bg-background-light dark:bg-background-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      
        <div className=" grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <div className="relative w-full h-full">
              <img
                alt="Career & Intern"
                src="/Career.png"
                className="object-cover w-full h-full"
              />
              {/* <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background-light/80 dark:from-background-dark/80 to-transparent pointer-events-none"></div> */}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-darkdark:text-text-dark">Your Dream Career & Intern</h2>
            <p className="mt-4 text-subtext-light dark:text-subtext-dark">Explore thousands of job and internship vacancies and find the perfect opportunity for you. We connect talented individuals with top companies, helping you build a successful career.</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <a className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-center" href="#">Apply an Internship</a>
              <a className="bg-background-light dark:bg-card-dark text-text-light dark:text-text-dark px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-opacity-80 transition-colors border border-primary text-center" href="#">Post an Internship</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAsection;
