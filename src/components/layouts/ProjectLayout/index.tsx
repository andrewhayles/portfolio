import classNames from 'classnames';
import dayjs from 'dayjs';
import Markdown from 'markdown-to-jsx';
import * as React from 'react';
import { useState } from 'react';

import { Annotated } from '@/components/Annotated';
import Link from '@/components/atoms/Link';
import { DynamicComponent } from '@/components/components-registry';
import ImageBlock from '@/components/molecules/ImageBlock';
import { PageComponentProps, ProjectLayout } from '@/types';
import { HighlightedPreBlock } from '@/components/CodeHighlighter';
import HighlightedMarkdown from '@/utils/highlighted-markdown';
import BaseLayout from '../BaseLayout';

type ComponentProps = PageComponentProps &
    ProjectLayout & {
        // CHANGED: The 'code' prop is removed, as we will fetch it on demand
        prevProject?: ProjectLayout;
        nextProject?: ProjectLayout;
    };

const Component: React.FC<ComponentProps> = (props) => {
    const {
        __metadata, // ADDED: We need this to get the slug for the API call
        title,
        date,
        client,
        description,
        markdownContent,
        // REMOVED: 'code' is no longer passed in props
        media,
        prevProject,
        nextProject,
        bottomSections = []
    } = props;

    // ADDED: New state to hold the fetched code and track loading
    const [isCodeVisible, setIsCodeVisible] = useState(false);
    const [codeContent, setCodeContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Date logic kept as requested
    const dateTimeAttr = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const formattedDate = dayjs().format('YYYY-MM-DD');

    // ADDED: This function now fetches the code from your API
    const handleShowCodeClick = async () => {
        setIsLoading(true);
        // Assumes your slug is stored in __metadata.slug
        const response = await fetch(`/api/code/${__metadata.slug}`); 
        const data = await response.json();
        setCodeContent(data.code);
        setIsCodeVisible(true);
        setIsLoading(false);
    };

    return (
        <BaseLayout {...props}>
            <article className="px-4 py-14 lg:py-20">
                <header className="max-w-5xl mx-auto mb-10 sm:mb-14">
                    {client && <div className="text-lg uppercase md:mb-6">{client}</div>}
                    <div className="flex flex-col gap-6 md:flex-row md:justify-between">
                        <time className="text-lg md:order-last" dateTime={dateTimeAttr}>
                            {formattedDate}
                        </time>
                        <h1 className="text-5xl sm:text-6xl md:max-w-2xl md:grow">{title}</h1>
                    </div>
                </header>
                <div className="max-w-3xl mx-auto prose sm:prose-lg">
                    <Markdown options={{ forceBlock: true, overrides: { pre: HighlightedPreBlock } }}>
                        {markdownContent.split('[CODE_HERE]')[0]}
                    </Markdown>

                    {/* CHANGED: This logic is now updated to fetch data */}
                    {isCodeVisible ? (
                        <HighlightedMarkdown language="javascript">
                            {codeContent}
                        </HighlightedMarkdown>
                    ) : (
                        <p className="text-lg">
                            {"If you'd like to view the code for this project,"}{" "}
                            <button
                                onClick={handleShowCodeClick}
                                disabled={isLoading}
                                className="text-blue-500 hover:underline focus:outline-none"
                            >
                                {isLoading ? 'loading...' : 'please click here'}
                            </button>
                            {"."}
                        </p>
                    )}

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

function ProjectMedia({ media }) {
    return <DynamicComponent {...media} className={classNames({ 'w-full': media.type === 'ImageBlock' })} />;
}

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
