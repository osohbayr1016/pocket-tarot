const paths = {
  cards: "M6 7 4 7.5 6.8 20l7.8-1.8 M9 6l1-3 10 3-3.8 13-2-.6 M8 5h8v13H8z M12 9l1.5 2.3L12 14l-1.5-2.7z",
  orbit: "M19.5 7C22 9.8 18 15 12 17S1.5 18.2 2.8 15.3C3.2 14.3 4 13.4 5 12.5 M17.5 10.5a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z M20 2v4m-2-2h4",
  sun: "M12 1.8v2.5m0 15.4v2.5M1.8 12h2.5m15.4 0h2.5M4.8 4.8l1.8 1.8m10.8 10.8 1.8 1.8m0-14.4-1.8 1.8M6.6 17.4l-1.8 1.8 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
  journal: "M6 3h13v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8 3v18m4-14h4m-4 4h4",
  offline: "M4 14v5h16v-5M12 3v12m-5-5 5 5 5-5",
  book: "M12 6c-3-2-6-2.5-10-1v14c4-1.5 7-1 10 1 3-2 6-2.5 10-1V5c-4-1.5-7-1-10 1Zm0 0v14",
  globe: "M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0ZM3 12h18m-9-9c-5 5-5 13 0 18 5-5 5-13 0-18Z",
  arrow: "M4 12h15m-6-6 6 6-6 6", chevron: "m8 5 7 7-7 7", close: "m5 5 14 14M19 5 5 19",
  shuffle: "M3 6h3c5 0 6 12 11 12h4m-3-3 3 3-3 3M3 18h3c1.6 0 3-1.5 4.2-3.6M14 8.5C15 7 16 6 18 6h3m-3-3 3 3-3 3",
  pen: "m14 5 5 5M4 20l5-1L21 7l-4-4L5 15z", check: "m4 12 5 5L20 6",
  layers: "m2 9 10-6 10 6-10 6zm1 5 9 5 9-5", star: "m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z",
} as const;
export type IconName = keyof typeof paths;
export function Icon({name,size=20}:{name:IconName;size?:number}){
  return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]}/></svg>;
}
