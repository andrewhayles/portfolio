// src/components/sections/ProjectFeedSection/index.tsx

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import classNames from 'classnames';
import { Annotated } from '@/components/Annotated';
import { Action } from '@/components/atoms';
import { ProjectFeedSection as ProjectFeedSectionProps, ProjectLayout } from '@/types';
import dayjs from 'dayjs';

// Helper component for a single project card
// CRITICAL FIX: Ensures each project's thumbnail image has width and height.
const ProjectCard: React.FC<{ project: ProjectLayout }> = ({ project }) => {
    return (
        <Annotated content={project}>
            <Link href={`/projects/${project.__metadata.id}`} className="block group">
                {project.featuredImage?.url && (
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                        <Image
                            src={project.featuredImage.url}
                            alt={project.featuredImage.altText || ''}
                            // These width and height props are essential for preventing CLS.
                            width={project.featuredImage.width || 400}
                            height={project.featuredImage.height || 300}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}
                <div className="mt-4">
                    <h3 className="text-xl font-medium">{project.title}</h3>
                    {project.date && (
                        <p className="text-sm text-gray-500 mt-1">
                            {dayjs(project.date).format('MMMM D, YYYY')}
                        </p>
                    )}
                    {project.description && (
                        <p className="text-base mt-2">{project.description}</p>
                    )}
                </div>
            </Link>
        </Annotated>
    );
};

// Main Section Component
export default function ProjectFeedSection(props: ProjectFeedSectionProps) {
    const { title, subtitle, projects = [], actions = [] } = props;

    if (projects.length === 0) {
        return null;
    }

    return (
        <div className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {title && <h2 className="text-3xl font-bold text-center">{title}</h2>}
                {subtitle && <p className="text-lg text-center mt-4">{subtitle}</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {projects.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </div>

                {actions.length > 0 && (
                    <div className="mt-12 text-center">
                        {actions.map((action, index) => (
                            <Action key={index} {...action} className="mx-2" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}