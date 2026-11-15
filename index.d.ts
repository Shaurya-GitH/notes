declare module "*.scss" {
  const content: string
  export = content
}

// dom custom event
interface CustomEventMap {
  prenav: CustomEvent<{}>
  nav: CustomEvent<{ url: FullSlug }>
  themechange: CustomEvent<{ theme: "light" | "dark" }>
  readermodechange: CustomEvent<{ mode: "on" | "off" }>
  // the footer's motion switch changed html[data-motion]
  motionchange: CustomEvent<{ reduce: boolean }>
}

type ContentIndex = Record<FullSlug, ContentDetails>
declare const fetchData: Promise<ContentIndex>
