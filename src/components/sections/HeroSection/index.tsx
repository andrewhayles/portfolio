import classNames from 'classnames';
import { Action } from '@/components/atoms';
import { DynamicComponent } from '@/components/components-registry';
import { Annotated } from '@/components/Annotated';

export const HeroSection = (props) => {
    const {
        title,
        subtitle,
        subtitleHtml, // Use the pre-rendered HTML for the subtitle
        actions = [],
        media,
        'data-sb-field-path': fieldPath
    } = props;

    return (
        <Annotated content={props}>
            <div className="w-full">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
                    <div
                        className={classNames(
                            'p-8',
                            'sm:p-14',
                            'text-center',
                            'bg-base-100',
                            'rounded-2xl',
                            'border-2',
                            'border-base-300'
                        )}
                    >
                        <div className="w-full max-w-3xl mx-auto">
                            {title && (
                                <h1 className="text-5xl font-bold" data-sb-field-path=".title">
                                    {title}
                                </h1>
                            )}
                            {subtitleHtml && (
                                <div
                                    className="text-xl sm:text-2xl mt-4"
                                    dangerouslySetInnerHTML={{ __html: subtitleHtml }}
                                    data-sb-field-path=".subtitle"
                                />
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

                        {media && (
                            <div className="mt-12" data-sb-field-path=".media">
                                <DynamicComponent {...media} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Annotated>
    );
};