// src/components/molecules/ImageBlock/index.tsx

import { Annotated } from '@/components/Annotated';
import { ImageBlock as ImageBlockProps } from '@/types'; // Import the specific type
import Image from 'next/image';

type ComponentProps = ImageBlockProps & {
    className?: string;
};

export default function ImageBlock(props: ComponentProps) {
    const { elementId, className, url, altText = '' } = props;
    if (!url) {
        return null;
    }

    // Set default dimensions. These are critical for aspect ratio and preventing CLS.
    const width = props.width || 1200;
    const height = props.height || 800;

    return (
        <Annotated content={props}>
            <figure className={className}>
                <Image
                    id={elementId}
                    src={url}
                    alt={altText}
                    width={width}
                    height={height}
                    className="w-full h-auto object-cover"
                />
            </figure>
        </Annotated>
    );
}