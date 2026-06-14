import { AnimatedGallery, type GallerySlide } from 'animated-gallery';

import s from './showcase.module.css';

const slides: GallerySlide[] = [
  {
    src: 'https://picsum.photos/id/64/340/340',
    srcSet: 'https://picsum.photos/id/64/680/680 2x',
    alt: 'Slide one',
  },
  {
    src: 'https://picsum.photos/id/65/340/340',
    srcSet: 'https://picsum.photos/id/65/680/680 2x',
    alt: 'Slide two',
  },
  {
    src: 'https://picsum.photos/id/76/340/340',
    srcSet: 'https://picsum.photos/id/76/680/680 2x',
    alt: 'Slide three',
  },
  {
    src: 'https://picsum.photos/id/77/340/340',
    srcSet: 'https://picsum.photos/id/77/680/680 2x',
    alt: 'Slide four',
  },
  {
    src: 'https://picsum.photos/id/78/340/340',
    srcSet: 'https://picsum.photos/id/78/680/680 2x',
    alt: 'Slide five',
  },
  {
    src: 'https://picsum.photos/id/79/340/340',
    srcSet: 'https://picsum.photos/id/79/680/680 2x',
    alt: 'Slide six',
  },
  {
    src: 'https://picsum.photos/id/80/340/340',
    srcSet: 'https://picsum.photos/id/80/680/680 2x',
    alt: 'Slide seven',
  },
  {
    src: 'https://picsum.photos/id/81/340/340',
    srcSet: 'https://picsum.photos/id/81/680/680 2x',
    alt: 'Slide eight',
  },
  {
    src: 'https://picsum.photos/id/82/340/340',
    srcSet: 'https://picsum.photos/id/82/680/680 2x',
    alt: 'Slide nine',
  },
  {
    src: 'https://picsum.photos/id/83/340/340',
    srcSet: 'https://picsum.photos/id/83/680/680 2x',
    alt: 'Slide ten',
  },
];

export default function App() {
  return (
    <section className={s.section} id="demo-showcase">
      <h1 className={s.title}>
        Make your gallery
      </h1>
      <div className={s.badge}>
        <div className={s.square} aria-hidden />
        <span>REALLY SPECIAL</span>
        <div className={s.square} aria-hidden />
      </div>
      <div className={s.container}>
        <div className={s.wrapper}>
          <div className={s.upperRow}>
            <div className={s.info}>
              <h2>
                Spotlight three items, then gently <span className={s.accent}>rotate the focus</span>
              </h2>
              <p className={s.infoDescription}>
                The <strong>AnimatedGallery</strong> component keeps three circular images on screen
                (left, center, right) and shifts which one updates over time. Add as many slides as
                you like, tweak the theme tokens, and drop it into your own layout — this page is
                just a demo wrapper. To try it locally, run <code>npm run demo</code> from the repo
                root.
              </p>
            </div>
            <div className={s.inlineDemo}>
              <AnimatedGallery slides={slides} ariaLabel="Featured photos" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
