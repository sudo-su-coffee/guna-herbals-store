'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const image = {
  hero: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=2200&q=90',
  oil: 'https://images.unsplash.com/photo-1611073769451-3f5d9b2a3a7d?auto=format&fit=crop&w=900&q=85',
  shampoo: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85',
  soap: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=900&q=85',
  honey: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=900&q=85',
  skincare: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85',
  ingredients: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=85',
};

const productGroups = [
  {
    eyebrow: 'Hair ritual', title: 'Stronger roots, softer days.', category: 'Shampoo',
    products: [
      ['Guna’s Onion Hibiscus Shampoo', '200ml', '₹180', '₹230', image.shampoo],
      ['Guna’s Rosemary Shampoo', '200ml', '₹250', '₹350', image.shampoo],
      ['Guna’s Hair Growth Oil', '200ml', '₹220', '₹300', image.oil],
      ['Guna’s Coconut Milk Shampoo', '200ml', '₹180', '₹230', image.shampoo],
    ],
  },
  {
    eyebrow: 'Body & bath', title: 'Everyday cleansing, elevated.', category: 'Soap',
    products: [
      ['Guna’s Nalangu Maavu Soap', '80g', '₹100', '₹160', image.soap],
      ['Guna’s Goat Milk Soap', '80g', '₹135', '₹200', image.soap],
      ['Guna’s Kasturi Manjal Soap', '80g', '₹100', '₹140', image.soap],
      ['Guna’s Oat Milk & Honey Soap', '80g', '₹100', '₹140', image.honey],
    ],
  },
  {
    eyebrow: 'Skin & glow', title: 'A little ritual for radiant skin.', category: 'Cream',
    products: [
      ['Guna’s Kumkumadi Skin Glow Oil', '10ml', '₹350', '₹500', image.oil],
      ['Guna’s Natural Sun Screen Cream SPF 50', '50g', '₹350', '₹450', image.skincare],
      ['Guna’s Neem Face Wash', '100ml', '₹220', '₹280', image.skincare],
      ['Guna’s Beet Root Lip Balm', '10g', '₹100', '₹140', image.skincare],
    ],
  },
];

const concerns = [
  ['Hair fall & growth', 'Oil + shampoo rituals', 'Shampoo', image.oil],
  ['Dull, tired skin', 'Glow from the roots', 'Cream', image.skincare],
  ['Sensitive cleansing', 'Gentle botanical bars', 'Soap', image.soap],
  ['Daily nourishment', 'Honey, powders & more', 'Honey', image.honey],
];

function Arrow() { return <span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">↗</span>; }

function ProductRail({ group }: { group: typeof productGroups[number] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
      <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
        <div><p className="mb-3 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#a4864d]">{group.eyebrow}</p><h2 className="max-w-xl text-3xl md:text-5xl">{group.title}</h2></div>
        <Link href={`/shop?category=${group.category}`} className="group hidden items-center gap-2 border-b border-[#19372f] pb-2 text-xs font-sans font-bold uppercase tracking-[0.18em] md:flex">Shop collection <Arrow /></Link>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-4 md:gap-6">
        {group.products.map(([name, size, price, mrp, productImage]) => <Link href="/shop" key={name} className="group">
          <div className="relative aspect-[0.92] overflow-hidden bg-[#f0ede6]"><img src={productImage} alt={name} className="h-full w-full object-cover mix-blend-multiply transition duration-700 group-hover:scale-105" /><span className="absolute left-3 top-3 bg-[#19372f] px-2 py-1 text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white">Popular</span><button onClick={(event) => { event.preventDefault(); event.stopPropagation(); }} className="absolute bottom-3 left-3 right-3 hidden bg-[#f8f5ed] py-3 text-[10px] font-sans font-bold uppercase tracking-[0.16em] text-[#19372f] transition group-hover:block">Quick add</button></div>
          <div className="mt-4 flex items-start justify-between gap-2"><div><p className="text-base leading-tight md:text-lg">{name}</p><p className="mt-2 text-[10px] font-sans uppercase tracking-[0.16em] text-[#a4864d]">{size}</p></div><div className="text-right"><p className="text-sm font-sans">{price}</p><p className="mt-1 text-[10px] font-sans text-[#8a877d] line-through">{mrp}</p></div></div>
        </Link>)}
      </div>
      <Link href={`/shop?category=${group.category}`} className="group mt-8 flex items-center justify-center gap-2 border-b border-[#19372f] pb-2 text-center text-xs font-sans font-bold uppercase tracking-[0.18em] md:hidden">Shop {group.eyebrow} <Arrow /></Link>
    </section>
  );
}

export default function Home() {
  const router = useRouter();
  return <main className="bg-[#f6f3ed] text-[#19372f]">
    <section className="relative min-h-[76vh] overflow-hidden bg-[#19372f] text-[#f8f5ed]"><img src={image.hero} alt="Fresh botanical leaves" className="absolute inset-0 h-full w-full object-cover opacity-35" /><div className="absolute inset-0 bg-gradient-to-r from-[#122d27]/95 via-[#173b31]/70 to-[#173b31]/25" /><div className="relative mx-auto flex min-h-[76vh] max-w-7xl items-end px-6 pb-16 pt-32 md:px-12 md:pb-24"><div className="max-w-3xl"><p className="mb-6 text-xs font-sans font-semibold uppercase tracking-[0.35em] text-[#d6b875]">Guna Herbals · Tenkasi, Tamil Nadu</p><h1 className="max-w-3xl text-5xl leading-[0.95] md:text-8xl">Ancient wisdom,<br /><em className="font-normal text-[#d6b875]">made beautifully simple.</em></h1><p className="mt-8 max-w-xl text-base leading-7 text-[#e5e4d8] md:text-lg">Handcrafted herbal care for the rituals you already love. Shop oils, shampoos, soaps, skincare, honey and more—made close to nature.</p><div className="mt-10 flex flex-wrap gap-4"><button onClick={() => router.push('/shop')} className="rounded-full bg-[#d6b875] px-7 py-4 text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#19372f] transition hover:bg-white">Shop the collection</button><button onClick={() => router.push('/enquiry')} className="rounded-full border border-white/40 px-7 py-4 text-xs font-sans font-bold uppercase tracking-[0.2em] transition hover:bg-white/10">Bulk & wholesale</button></div></div></div><div className="absolute bottom-7 right-6 hidden items-center gap-3 text-xs font-sans uppercase tracking-[0.25em] text-white/60 md:flex"><span className="h-px w-10 bg-white/40" /> Scroll to shop</div></section>

    <section className="border-b border-[#d8d1c3] bg-[#19372f] px-6 py-8 text-[#f8f5ed] md:px-12"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-7 md:grid-cols-4 md:gap-6">{[['01', 'Free delivery', 'On orders over ₹500'], ['02', 'Easy to explore', '55+ herbal essentials'], ['03', 'Made in Tenkasi', 'Rooted in tradition'], ['04', 'Carefully packed', 'Sent across India']].map(([n, t, d]) => <div key={n} className="flex gap-3"><span className="font-sans text-xs text-[#d6b875]">{n}</span><div><p className="font-serif text-base">{t}</p><p className="mt-1 text-xs font-sans text-white/55">{d}</p></div></div>)}</div></section>

    <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24"><div className="mb-8 flex items-end justify-between"><div><p className="mb-3 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#a4864d]">Shop by concern</p><h2 className="text-3xl md:text-5xl">Start with what<br /><em className="font-normal text-[#a4864d]">you need.</em></h2></div><Link href="/shop" className="group hidden items-center gap-2 border-b border-[#19372f] pb-2 text-xs font-sans font-bold uppercase tracking-[0.18em] md:flex">Browse everything <Arrow /></Link></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{concerns.map(([title, desc, category, src]) => <Link href={`/shop?category=${category}`} key={title} className="group relative aspect-[0.9] overflow-hidden bg-[#ded8ca]"><img src={src} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#102e27]/85 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 text-[#f8f5ed]"><p className="max-w-[150px] text-xl leading-tight md:text-2xl">{title}</p><p className="mt-2 text-[10px] font-sans uppercase tracking-[0.15em] text-white/70">{desc}</p></div></Link>)}</div></section>

    <section className="bg-[#d6b875] px-6 py-8 text-[#19372f] md:px-12 md:py-10"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 md:flex-row md:items-center"><div><p className="text-xs font-sans font-bold uppercase tracking-[0.25em]">The Guna edit · this month</p><p className="mt-2 text-2xl md:text-3xl">Build your daily ritual and save on delivery.</p></div><Link href="/shop" className="rounded-full border border-[#19372f] px-6 py-3 text-xs font-sans font-bold uppercase tracking-[0.18em] transition hover:bg-[#19372f] hover:text-[#f8f5ed]">Shop bestsellers</Link></div></section>

    {productGroups.map((group) => <ProductRail key={group.title} group={group} />)}

    <section className="bg-[#e8e2d5] px-6 py-16 md:px-12 md:py-24"><div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-20"><div className="relative min-h-[390px] overflow-hidden bg-[#19372f]"><img src={image.ingredients} alt="Raw herbal ingredients" className="absolute inset-0 h-full w-full object-cover opacity-65" /><div className="absolute inset-0 bg-gradient-to-t from-[#19372f] to-transparent" /><div className="relative flex min-h-[390px] flex-col justify-end p-8 text-[#f8f5ed] md:p-12"><p className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#d6b875]">The Guna standard</p><h2 className="mt-4 max-w-md text-4xl md:text-5xl">Good enough to go back to nature.</h2><Link href="/about" className="group mt-8 flex w-fit items-center gap-2 border-b border-white/50 pb-2 text-xs font-sans font-bold uppercase tracking-[0.18em]">Our story <Arrow /></Link></div></div><div><p className="mb-4 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#a4864d]">From our home to yours</p><h2 className="text-4xl leading-tight md:text-6xl">Beauty that<br /><em className="font-normal text-[#a4864d]">remembers.</em></h2><p className="mt-7 max-w-md text-base leading-7 text-[#54635c]">Our formulas are inspired by recipes shared across generations in Tamil homes. We keep the ingredients close to their natural form, the batches considered, and the experience distinctly human.</p><div className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-[#cfc6b4] pt-6">{[['55+', 'Herbal essentials'], ['2018', 'Since our first batch'], ['100%', 'Made with care'], ['Tenkasi', 'Our home']].map(([v, l]) => <div key={l}><p className="text-2xl text-[#19372f]">{v}</p><p className="mt-1 text-[10px] font-sans uppercase tracking-[0.16em] text-[#8a877d]">{l}</p></div>)}</div></div></div></section>

    <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24"><div className="mb-10 text-center"><p className="mb-3 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#a4864d]">Why Guna</p><h2 className="text-3xl md:text-5xl">A better kind of<br /><em className="font-normal text-[#a4864d]">everyday care.</em></h2></div><div className="grid gap-5 md:grid-cols-3">{[['Made in small batches', 'Fresh formulas, thoughtful preparation, and no unnecessary fuss.'], ['Ingredients with a story', 'Traditional botanicals selected for familiar, useful rituals.'], ['Care that feels personal', 'From our Tenkasi shelves to your home, packed with warmth.']].map(([title, text], i) => <div key={title} className="border-t border-[#cfc6b4] pt-5"><span className="font-sans text-xs text-[#a4864d]">0{i + 1}</span><h3 className="mt-8 text-2xl">{title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-[#68756d]">{text}</p></div>)}</div></section>

    <section className="bg-[#19372f] px-6 py-20 text-center text-[#f8f5ed] md:px-12 md:py-24"><p className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#d6b875]">Stay close to nature</p><h2 className="mx-auto mt-5 max-w-2xl text-4xl md:text-6xl">A little goodness,<br /><em className="font-normal text-[#d6b875]">in your inbox.</em></h2><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/65">New launches, rituals, and notes from Tenkasi. No noise, just the good stuff.</p><form className="mx-auto mt-8 flex max-w-md border-b border-white/40 pb-3" onSubmit={(event) => event.preventDefault()}><input type="email" required placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-white/40" /><button className="text-xs font-sans font-bold uppercase tracking-[0.16em] text-[#d6b875]">Subscribe</button></form></section>
  </main>;
}
