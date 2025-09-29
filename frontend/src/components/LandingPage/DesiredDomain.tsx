import React from "react";
import {
	ComponentInstanceIcon,
	Pencil2Icon,
	PieChartIcon,
	MagicWandIcon,
	CodeIcon,
	GearIcon,
	GlobeIcon,
	LaptopIcon
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

const DesiredDomain = () => {
	return (
		<div className="container mx-auto px-4 sm:px-6 lg:px-8">
			<div className="text-center mb-12">
				<h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark">Choose Your Desired</h2>
				<h2 className="text-3xl md:text-4xl font-bold text-text-light dark:text-text-dark mt-2">Domain</h2>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{categories.map((cat) => (
					<a
						key={cat.title}
						className="bg-card-light dark:bg-card-dark p-6 rounded-lg border border-border-light dark:border-border-dark flex items-center space-x-4 shadow-sm hover:shadow-lg transition-shadow duration-300"
						href="#"
					>
						<div className="bg-indigo-100 dark:bg-primary/20 p-3 rounded-md">
							{cat.icon}
						</div>
						<div>
							<h3 className="font-semibold text-text-light dark:text-text-dark">{cat.title}</h3>
							<p className="text-sm text-subtext-light dark:text-subtext-dark">{cat.jobs} Jobs Available</p>
						</div>
					</a>
				))}
			</div>
		</div>
	);
};

export default DesiredDomain;
