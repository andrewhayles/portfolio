import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import { funky } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// Register the languages you need
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('css', css);

// THIS IS THE COMPONENT DEFINITION THAT WAS MISSING
const CodeHighlighter = ({ language, children }) => {
    return (
        <SyntaxHighlighter language={language} style={funky}>
            {children}
        </SyntaxHighlighter>
    );
};

// This is the helper component for your markdown renderer
export function HighlightedPreBlock({ children }) {
    if (children && children.type === 'code') {
        const language = children.props.className?.replace('language-', '');
        return <CodeHighlighter language={language}>{children.props.children}</CodeHighlighter>;
    }
    return <pre>{children}</pre>;
}

// This is the default export
export default CodeHighlighter;