import { Config, ThemeStyle } from './generated';
import { PageModelType } from './generated';

export * from './base';
export * from './generated';

/**
 * Defines the shape of the global props object,
 * which includes site configuration and theme styles.
 */
export type GlobalProps = {
    site: Config;
    theme: ThemeStyle;
};

/**
 * Defines the shape of the props passed to the main Page component.
 * It now correctly uses the GlobalProps type.
 */
export type PageComponentProps = {
    page: PageModelType;
    global: GlobalProps;
};