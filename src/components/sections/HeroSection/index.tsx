// src/components/sections/HeroSection/index.tsx

import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import Image from 'next/image';
import React from 'react';

import { AnnotatedField } from '@/components/Annotated';
import { Action } from '@/components/atoms';
import { HeroSection, ImageBlock } from '@/types';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import Section from '../Section';

function Component(props: HeroSection) {
    const { elementId, colors, backgroundSize, title, subtitle, text, media, actions = [], styles = {} } = props;
    const sectionFlexDirection = styles.self?.flexDirection ?? 'row';
    const sectionAlign = styles.self?.textAlign ?? 'left';

    return (
        <Section elementId={elementId} colors={colors} backgroundSize={backgroundSize} styles={styles.self}>
            <div className={classNames('flex gap-8', mapFlexDirectionStyles(sectionFlexDirection))}>
                <div className={classNames('flex-1 w-full', mapStyles({ textAlign: sectionAlign }))}>
                    {title && (
                        <AnnotatedField path=".title">
                            <h1 className="text-5xl sm:text-6xl">{title}</h1>
                        </AnnotatedField>
                    )}
                    {subtitle && (
                        <AnnotatedField path=".subtitle">
                            <p className={classNames('text-xl sm:text-2xl', { 'mt-4': title })}>{subtitle}</p>
                        </AnnotatedField>
                    )}
                    {text && (
                        <AnnotatedField path=".text">
                            <Markdown
                                options={{ forceBlock: true, forceWrapper: true }}
                                className={classNames('max-w-none prose sm:prose-lg', {
                                    'mt-6': title || subtitle
                                })}
                            >
                                {text}
                            </Markdown>
                        </AnnotatedField>
                    )}
                    {actions?.length > 0 && (
                        <div
                            className={classNames('flex flex-wrap items-center gap-4', {
                                'mt-8': title || subtitle || text,
                                'justify-center': sectionAlign === 'center',
                                'justify-end': sectionAlign === 'right'
                            })}
                        >
                            {actions.map((action, index) => (
                                <Action key={index} {...action} />
                            ))}
                        </div>
                    )}
                </div>
                {media && (
                    <div
                        className={classNames('flex flex-1 w-full', {
                            'justify-center': sectionAlign === 'center',
                            'justify-end': sectionAlign === 'right'
                        })}
                    >
                        <HeroMedia media={media} />
                    </div>
                )}
            </div>
        </Section>
    );
}

// Ensure this is the ONLY HeroMedia function in the file
function HeroMedia({ media }: { media: ImageBlock }) {
    return (
        <Image
            src={media.url}
            alt={media.altText || ''}
            width={1000}
            height={750}
            priority={true}
            className="w-full h-auto object-contain aspect-[4/3]"
        />
    );
}

function mapFlexDirectionStyles(flexDirection?: 'row' | 'row-reverse' | 'col' | 'col-reverse') {
    switch (flexDirection) {
        case 'row-reverse':
            return 'flex-col-reverse lg:flex-row-reverse lg:items-center';
        case 'col':
            return 'flex-col';
        case 'col-reverse':
            return 'flex-col-reverse';
        default:
            return 'flex-col lg:flex-row lg:items-center';
    }
}

export default React.memo(Component)