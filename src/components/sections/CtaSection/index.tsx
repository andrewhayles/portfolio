import classNames from 'classnames';
import { Action } from '@/components/atoms';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';
import { Annotated } from '@/components/Annotated';

export const CtaSection = (props) => {
    const {
        title,
        subtitle,
        actions = [],
        'data-sb-field-path': fieldPath,
        ...rest
    } = props;

    // This component no longer processes markdown, so we don't need contentHtml.
    // It will just render the title, subtitle, and actions.

    return (
        <Annotated content={props}>
            <div
                className={classNames(
                    'py-12',
                    'px-4',
                    'text-center',
                    'bg-neutral',
                    'text-neutral-content'
                )}
                {...rest}
            >
                {title && (
                    <h2 className="text-3xl font-bold" data-sb-field-path=".title">
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p className="text-lg mt-4" data-sb-field-path=".subtitle">
                        {subtitle}
                    </p>
                )}
                {actions.length > 0 && (
                    <div className="mt-8">
                        <div className="flex flex-wrap justify-center items-center gap-4" data-sb-field-path=".actions">
                            {actions.map((action, index) => (
                                <Action key={index} action={action} className="lg:whitespace-nowrap" data-sb-field-path={`.${index}`} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Annotated>
    );
};