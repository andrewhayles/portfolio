// src/components/layouts/ProjectLayout/index.tsx

import { useState } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import Markdown from 'markdown-to-jsx';
import * as React from 'react';

import { Annotated } from '@/components/Annotated';
import Link from '@/components/atoms/Link';
import { DynamicComponent } from '@/components/components-registry';
import ImageBlock from '@/components/molecules/ImageBlock';
import { PageComponentProps, ProjectLayout } from '@/types';
import HighlightedPreBlock from '@/utils/highlighted-markdown';
import BaseLayout from '../BaseLayout';

type ComponentProps = PageComponentProps &
    ProjectLayout & {
        prevProject?: ProjectLayout;
        nextProject?: ProjectLayout;
    };

const Component: React.FC<ComponentProps> = (props) => {
    const {
        title,
        date,
        client,
        description,
        markdownContent,
        __metadata, // We'll get the slug from here to identify the project
        prevProject,
        nextProject,
        bottomSections = []
    } = props;

    // State for managing the fetched code
    const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchCode = async () => {
        setIsLoading(true);
        setError(null);
        // Assumes your slug is the 'id' in metadata. Adjust if needed.
        const slug = __metadata.id; 

        try {
            const response = await fetch(`/api/getCode?slug=${slug}`);
            if (!response.ok) {
                throw new Error('Failed to fetch code from server.');
            }
            const codeHtml = await response.text();
            setHighlightedCode(codeHtml);
        } catch (err) {
            setError('Could not load the code. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const dateTimeAttr = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    const formattedDate = dayjs(date).format('MMMM D, YYYY');

    return (
        <BaseLayout {...props}>
            <article className="px-4 py-14 lg:py-20">
                <header className="max-w-5xl mx-auto mb-10 sm:mb-14">
                    {/* Header content like title, date, etc. */}
                </header>

                <div className="max-w-3xl mx-auto prose sm:prose-lg">
                    <Markdown options={{ forceBlock: true, overrides: { pre: HighlightedPreBlock } }}>
                        {markdownContent.split('[CODE_HERE]')[0]}
                    </Markdown>

                    {/* Renders the button or the fetched code */}
                    {highlightedCode ? (
                        <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
                    ) : (
                        <p className="text-lg">
                            {"If you'd like to view the code for this project,"}{" "}
                            <button
                                onClick={handleFetchCode}
                                disabled={isLoading}
                                className="text-blue-500 hover:underline focus:outline-none disabled:text-gray-400 disabled:cursor-wait"
                            >
                                {isLoading ? 'Loading...' : 'please click here'}
                            </button>
                            {"."}
                        </p>
                    )}
                    {error && <p className="text-red-500">{error}</p>}

                    <Markdown options={{ forceBlock: true, overrides: { pre: HighlightedPreBlock } }}>
                        {markdownContent.split('[CODE_HERE]')[1]}
                    </Markdown>
                </div>
            </article>

            {(prevProject || nextProject) && (
                <nav className="px-4 mt-12 mb-20">
                    <div className="grid max-w-5xl mx-auto gap-x-6 gap-y-12 sm:grid-cols-2 lg:gap-x-8">
                        {prevProject && <ProjectNavItem project={prevProject} className={undefined} />}
                        {nextProject && (
                            <ProjectNavItem project={nextProject} className="sm:items-end sm:col-start-2" />
                        )}
                    </div>
                </nav>
            )}
            {bottomSections?.map((section, index) => {
                return <DynamicComponent key={index} {...section} />;
            })}
        </BaseLayout>
    );
};

export default Component;
// ... (Your ProjectNavItem and other helper functions remain the same)

function ProjectNavItem({ project, className }) {
    return (
        <Annotated content={project}>
            <Link className={classNames('group flex flex-col gap-6 items-start', className)} href={project}>
                {project.featuredImage && (
                    <div className="w-full overflow-hidden aspect-3/2">
                        <ImageBlock
                            {...project.featuredImage}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                    </div>
                )}
                <span className="text-lg leading-tight uppercase transition bottom-shadow-1 group-hover:bottom-shadow-5">
                    {project.title}
                </span>
            </Link>
        </Annotated>
    );
}