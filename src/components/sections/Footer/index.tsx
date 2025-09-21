import * as React from 'react';
import NextLink from 'next/link';
import { Annotated } from '@/components/Annotated';
import { Social } from '@/components/atoms';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';

export const Footer = (props) => {
    const {
        title,
        contacts,
        copyrightText,
        links = [],
        styles = {},
        'data-sb-field-path': fieldPath
    } = props;

    return (
        <Annotated content={props}>
            <footer
                className="relative pt-16 pb-16 pr-4 pl-4 min-h-[222px]"
                style={{
                    backgroundColor: styles.backgroundColor || '#ffffff',
                    color: styles.textColor || '#1E293B'
                }}
            >
                <div className="w-full max-w-6xl ml-auto mr-auto">
                    <div className="sm:flex sm:justify-between">
                        <div className="sm:w-1/2">
                            {title && (
                                <h2 className="text-2xl font-bold" data-sb-field-path=".title">
                                    {title}
                                </h2>
                            )}

                            {contacts?.phoneNumber && (
                                <p className="mt-6" data-sb-field-path=".contacts.phoneNumber">
                                    <a href={`tel:${contacts.phoneNumber}`}>{contacts.phoneNumber}</a>
                                </p>
                            )}
                            {contacts?.email && (
                                <p className="mt-1" data-sb-field-path=".contacts.email">
                                    <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
                                </p>
                            )}
                            {contacts?.address && (
                                <p className="mt-1" data-sb-field-path=".contacts.address">
                                    {contacts.address}
                                </p>
                            )}

                            {contacts?.socialLinks && (
                                <div className="mt-6">
                                    <Social links={contacts.socialLinks} styles={contacts.styles} data-sb-field-path=".contacts.socialLinks" />
                                </div>
                            )}
                        </div>

                        {links.length > 0 && (
                            <div className="mt-10 sm:mt-0 sm:w-1/2 sm:text-right">
                                <ul className="flex flex-wrap" data-sb-field-path=".links">
                                    {links.map((link, index) => (
                                        <li key={index} className="w-1/2 mt-3 sm:w-auto sm:mt-0 sm:ml-8">
                                            <NextLink href={link.url} data-sb-field-path={`.${index}`}>
                                                {link.label}
                                            </NextLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    {copyrightText && (
                        <p className="text-sm mt-12 pt-6 border-t" data-sb-field-path=".copyrightText">
                            {copyrightText}
                        </p>
                    )}
                </div>
            </footer>
        </Annotated>
    );
};