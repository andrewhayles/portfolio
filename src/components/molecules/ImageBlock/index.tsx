import { Annotated } from '@/components/Annotated';
import Image from 'next/image';

export default function ImageBlock(props) {
    const { elementId, className, url, altText = '' } = props;
    if (!url) {
        return null;
    }

    return (
        <Annotated content={props}>
            {/* The parent div is now used to control the image size */}
            <div className="relative w-full h-64"> {/* You can adjust h-64 as needed */}
                <Image
                    id={elementId || null}
                    className={className}
                    src={url}
                    alt={altText}
                    layout="fill"
                    objectFit="cover"
					strategy="lazyOnLoad"
                />
            </div>
        </Annotated>
    );
}