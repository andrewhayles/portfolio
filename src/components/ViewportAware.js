// components/ViewportAware.js
import { useInView } from 'react-intersection-observer';

// You can adjust the rootMargin to control how early or late the component loads.
// '200px' means it will start loading when it's 200px away from the viewport.
const options = {
  triggerOnce: true,
  rootMargin: '200px 0px',
};

export const ViewportAware = ({ children }) => {
  const { ref, inView } = useInView(options);

  return (
    <div ref={ref}>
      {/* This is the key part: The children (your DynamicComponent) are only
        rendered when 'inView' becomes true. Until then, it renders nothing.
      */}
      {inView ? children : null}
    </div>
  );
};