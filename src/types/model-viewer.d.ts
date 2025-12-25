declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      src?: string
      autoRotate?: boolean
      cameraControls?: boolean
      disableZoom?: boolean
      disablePan?: boolean
      shadowIntensity?: string
      shadowSoftness?: string
      exposure?: string
    }
  }
}
