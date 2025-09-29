import React from "react";
import {
	PersonIcon,
	FilePlusIcon,
	PaperPlaneIcon
} from "@radix-ui/react-icons";

import Link from "next/link";

const actions = [
	{
		icon: <PersonIcon className="text-primary" width={32} height={32} />,
		label: "Register Your Account",
		bg: "bg-indigo-100 dark:bg-indigo-900/50",
		href: "/register"
	},
	{
		icon: <FilePlusIcon className="text-primary" width={32} height={32} />,
		label: "Upload Your Resume",
		bg: "bg-indigo-100 dark:bg-indigo-900/50",
		href: "/upload-resume"
	},
	{
		icon: <PaperPlaneIcon className="text-text-light dark:text-text-dark" width={32} height={32} />,
		label: "Apply for Dream Job",
		bg: "bg-slate-200 dark:bg-slate-700",
		href: "/apply-job"
	}
];

const QuickActionSection = () => {
	return (
		<section className="py-24 bg-background-light dark:bg-background-dark font-display">
	<div className="container mx-auto px-4">
		<h2 className="text-3xl font-bold text-center text-text-light dark:text-text-dark mb-4">Quick Actions to Get Started</h2>
		<p className="text-center text-text-light dark:text-text-dark/80 mb-12 max-w-2xl mx-auto">
			Follow these simple steps to start your journey towards finding your dream job. It's fast, easy, and will set you up for success.
		</p>
		<div className="relative max-w-4xl mx-auto">
			<div className="absolute left-12 right-12 top-8 flex items-center justify-center pointer-events-none">
				<div className="w-full border-t border-dashed border-border-light dark:border-border-dark"></div>
			</div>
			<div className="relative flex justify-between">
				{actions.map((action, idx) => (
					<div key={action.label} className="text-center flex flex-col items-center">
						<div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${action.bg}`}>
							{action.icon}
						</div>
						<h3 className="font-semibold text-text-light dark:text-text-dark">{action.label}</h3>
					</div>
				))}
			</div>
		</div>
	</div>
</section>
	);
};

export default QuickActionSection;
