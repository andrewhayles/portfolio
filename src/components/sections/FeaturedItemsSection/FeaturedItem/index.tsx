import classNames from 'classnames';
import { Annotated } from '@/components/Annotated';
import Action from '@/components/atoms/Action';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';

const FeaturedItem = (props) => {
    const {
        title,
        subtitle,
        contentHtml, // Use contentHtml instead of content
        actions = [],
        media,
        styles = {},
        'data-sb-field-path': fieldPath
    } = props;

    return (
        <Annotated content={props}>
            <div
                className={classNames(
                    'flex',
                    'flex-col',
                    'gap-6',
                    'sm:gap-8',
                    mapStyles({
                        flexDirection: styles.flexDirection || 'row',
                        justifyContent: styles.justifyContent || 'flex-start',
                        alignItems: styles.alignItems || 'flex-start'
                    })
                )}
            >
                {media && (
                    <div className="w-full sm:w-2/5">
                        <div className="block" data-sb-field-path=".media">
                            {/* Assuming media rendering is handled by DynamicComponent */}
                            {/* If not, replace with appropriate media rendering logic */}
                        </div>
                    </div>
                )}
                <div className="w-full sm:w-3/5">
                    {title && (
                        <h3
                            className={classNames({
                                'text-2xl': true,
                                'sm:text-3xl': true
                            })}
                            data-sb-field-path=".title"
                        >
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p
                            className={classNames('text-lg', { 'mt-1': title })}
                            data-sb-field-path=".subtitle"
                        >
                            {subtitle}
                        </p>
                    )}
                    {contentHtml && (
                        <div
                            className="prose"
                            dangerouslySetInnerHTML={{ __html: contentHtml }}
                            data-sb-field-path=".content"
                        />
                    )}
                    {actions.length > 0 && (
                        <div
                            className={classNames('mt-6', 'flex', 'flex-wrap', 'items-center', 'gap-4')}
                            data-sb-field-path=".actions"
                        >
                            {actions.map((action, index) => (
                                <Action
                                    key={index}
                                    action={action}
                                    className="lg:whitespace-nowrap"
                                    data-sb-field-path={`.${index}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Annotated>
    );
};

export default FeaturedItem;