declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            src?: string;
            poster?: string;
            alt?: string;
            'auto-rotate'?: boolean;
            'camera-controls'?: boolean;
            'shadow-intensity'?: string;
            'animation-name'?: string;
            'animation-crossfade-duration'?: string;
            ar?: boolean;
            'ar-modes'?: string;
            class?: string;
            [key: string]: any; // Allow other props
        };
    }
}
