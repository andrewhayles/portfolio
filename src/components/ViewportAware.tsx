import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';

const options = {
  triggerOnce: true,
  rootMargin: '200px 0px',
};

interface Props {
  children: ReactNode;
}

export const ViewportAware = ({ children }: Props) => {
  const { ref, inView } = useInView(options);

  return (
    <div ref={ref}>
      {inView ? children : null}
    </div>
  );
};