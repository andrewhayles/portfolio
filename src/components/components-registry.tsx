// src/components/components-registry.tsx

import React from 'react';
import { PageComponentProps } from '@/types';

// This is a special version of DynamicComponent for debugging.
// It will print its props as text instead of rendering a component.
export const DynamicComponent: React.FC<PageComponentProps> = (props) => {
    const componentType = props.type;

    return (
        <div style={{ border: '2px solid red', margin: '10px', padding: '10px', backgroundColor: 'white' }}>
            <h2 style={{ fontWeight: 'bold', color: 'red' }}>Component Type: {componentType}</h2>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px' }}>
                {JSON.stringify(props, null, 2)}
            </pre>
        </div>
    );
};