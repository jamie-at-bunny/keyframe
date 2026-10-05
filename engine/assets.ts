// Nothing gets captured while something is still loading. Anything async
// (fonts, images, decoded audio) registers here, and the renderer waits for
// the set to drain before every frame.
import { createElement, type ImgHTMLAttributes, useLayoutEffect, useRef } from "react";

const pending = new Set<Promise<unknown>>();

export const waitFor = <T>(p: Promise<T>): Promise<T> => {
  pending.add(p);
  const done = () => pending.delete(p);
  p.then(done, (err) => {
    done();
    console.error("[assets]", err);
  });

  return p;
};

export const settled = async () => {
  while (pending.size) await Promise.allSettled([...pending]);
  await document.fonts.ready;
};

// A file in the repo's public/ directory.
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

// <img> that holds the frame until it has decoded.
export const Img: React.FC<ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const ref = useRef<HTMLImageElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new src is what needs decoding again
  useLayoutEffect(() => {
    const img = ref.current;
    if (img && !img.complete) waitFor(img.decode().catch(() => undefined));
  }, [props.src]);

  return createElement("img", { ...props, ref, decoding: "sync" });
};
