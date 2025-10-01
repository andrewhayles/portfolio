import { Config, ContentObject, ThemeStyle } from './generated';
import { DataModelType, PageModelType } from './generated';

export * from './base';
export * from './generated';

export type GlobalProps = {
    site: Config;
    theme: ThemeStyle;
};

export type PageComponentProps = {
    page: PageModelType;
    global: {
        site: Config;
    };
};