// import { Easing } from "remotion";

// type ChainItem = {
//   easing: Easing;
//   range: [number, number];
//   duration: number;
//   delay?: number;
// };

// const getItemValue = ({
//   item,
//   frame,
// }: {
//   item: ChainItem;
//   frame: number;
// }) => {};

// export const animate = ({
//   items: _items,
//   frame,
// }: {
//   items: ChainItem[];
//   frame: number;
// }) => {
//   const items = _items.reduce<{ start: number; end: number }[]>(
//     (acc, _item, index) => {
//       const item = {
//         start: _items[index - 1] ? acc[index - 1].end + 1 : _item.delay  0,
//         end: _items[index + 1]?.delay ? _item.duration + _items[index + 1].delay! : _item.duration,
//       };

//       return [...acc, item];
//     }, []
//   );

//   return items;
// };

// // export const chainAnimation = ({
// //   items,
// //   frame,
// // }: {
// //   items: ChainItem[];
// //   frame: number;
// // }) => {
// //   const itemsByFrames = items.reduce<[number, number][]>((acc, item) => {
// //     const lastFrame = acc[acc.length - 1]?.[1] ?? 0;
// //     return [...acc, [lastFrame, lastFrame + item.duration]];
// //   }, []);

// //   const currentItemIndex = itemsByFrames.findIndex(
// //     ([start, end]) => frame >= start && frame < end,
// //   );

// //   const currentItem = items[currentItemIndex];

// //   if ("idle" in currentItem) {
// //     const prevItem = items[currentItemIndex - 1];
// //     if ("idle" in prevItem) {
// //       throw new Error("Two idle items in a row");
// //     }

// //     return prevItem.func(frame);
// //   }

// //   return currentItem.func(frame);
// // };
