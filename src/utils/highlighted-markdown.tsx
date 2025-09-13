import dynamic from 'next/dynamic';

// This dynamically imports your CodeHighlighter.
// The heavy library will now be in its own separate JavaScript file.
const LazyCodeHighlighter = dynamic(() => import('../components/CodeHighlighter'), {
    // You can add a loading state for a better user experience
    loading: () => <pre><code>Loading code...</code></pre>,
});

// Export a component that you can use in your pages
const HighlightedMarkdown = ({ language, children }) => {
    return <LazyCodeHighlighter language={language}>{children}</LazyCodeHighlighter>;
};

export default HighlightedMarkdown;
