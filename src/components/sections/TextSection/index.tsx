import classNames from 'classnames';
import { Annotated } from '@/components/Annotated';
import { mapStylesToClassNames as mapStyles } from '@/utils/map-styles-to-class-names';

export const TextSection = (props) => {
    const {
        title,
        subtitle,
        contentHtml, // Use the pre-rendered HTML for the content
        styles = {},
        'data-sb-field-path': fieldPath
    } = props;

    return (
        <Annotated content={props}>
            <div
                className={classNames(
                    'py-12',
                    'px-4',
                    mapStyles({
                        textAlign: styles.textAlign || 'left'
                    })
                )}
            >
                {title && (
                    <h2 className="text-3xl font-bold" data-sb-field-path=".title">
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p className={classNames('text-lg', { 'mt-1': title })} data-sb-field-path=".subtitle">
                        {subtitle}
                    </p>
                )}
                {contentHtml && (
                    <div
                        className={classNames('prose', { 'mt-6': title || subtitle })}
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                        data-sb-field-path=".content"
                    />
                )}
            </div>
        </Annotated>
    );
};