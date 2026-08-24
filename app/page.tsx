'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'Shampoo', label: 'Hair rituals', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85' },
  { name: 'Soap', label: 'Cold-process care', image: 'https://images.unsplash.com/photo-1607006483225-4e7c0f8c6a1e?auto=format&fit=crop&w=900&q=85' },
  { name: 'Oil', label: 'Botanical infusions', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85' },
  { name: 'Honey', label: 'From the hive', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=85' },
];

const bestSellers = [
  { name: "Guna's Hair Growth Oil", category: 'OIL / 200ML', price: '₹220', mrp: '₹300', image: 'https://images.unsplash.com/photo-1611073769451-3f5d9b2a3a7d?auto=format&fit=crop&w=800&q=85' },
  { name: "Guna's Onion Hibiscus Shampoo", category: 'SHAMPOO / 200ML', price: '₹180', mrp: '₹230', image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=85' },
  { name: "Guna's Nalangu Maavu Soap", category: 'SOAP / 80G', price: '₹100', mrp: '₹160', image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=800&q=85' },
  { name: "Guna's Natural Honey", category: 'HONEY / 100G', price: '₹240', mrp: '₹300', image: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=800&q=85' },
];

function Arrow() {
  return <span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">↗</span>;
}

export default function Home() {
  const router = useRouter();

  return (
    <main className="bg-[#f6f3ed] text-[#19372f]">
      <section className="relative min-h-[78vh] overflow-hidden bg-[#19372f] text-[#f8f5ed]">
        <img src="https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=2200&q=90" alt="Fresh botanical leaves" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#122d27]/95 via-[#173b31]/70 to-[#173b31]/25" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-16 pt-32 md:px-12 md:pb-24">
          <div className="max-w-3xl">
            <p className="mb-6 text-xs font-sans font-semibold uppercase tracking-[0.35em] text-[#d6b875]">Guna Herbals · Tenkasi, Tamil Nadu</p>
            <h1 className="max-w-3xl text-5xl leading-[0.95] md:text-8xl">Ancient wisdom,<br /><em className="font-normal text-[#d6b875]">made beautifully simple.</em></h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-[#e5e4d8] md:text-lg">Pure, handcrafted herbal care inspired by the foothills of Pothigai. Thoughtfully made for everyday rituals that bring you back to nature.</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button onClick={() => router.push('/shop')} className="rounded-full bg-[#d6b875] px-7 py-4 text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#19372f] transition hover:bg-white">Explore the collection</button>
              <button onClick={() => router.push('/enquiry')} className="rounded-full border border-white/40 px-7 py-4 text-xs font-sans font-bold uppercase tracking-[0.2em] transition hover:bg-white/10">Wholesale enquiries</button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-7 right-6 hidden items-center gap-3 text-xs font-sans uppercase tracking-[0.25em] text-white/60 md:flex"><span className="h-px w-10 bg-white/40" /> Scroll to discover</div>
      </section>

      <section className="border-b border-[#d8d1c3] bg-[#19372f] px-6 py-8 text-[#f8f5ed] md:px-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-7 md:grid-cols-4 md:gap-6">
          {[['01', 'Small-batch made', 'Freshly prepared with care'], ['02', 'Plant-powered', 'Ingredients you can recognise'], ['03', 'Made in Tenkasi', 'Rooted in Tamil tradition'], ['04', 'Sent with warmth', 'Pan-India delivery available']].map(([number, title, detail]) => <div key={number} className="flex gap-3"><span className="font-sans text-xs text-[#d6b875]">{number}</span><div><p className="font-serif text-base">{title}</p><p className="mt-1 text-xs font-sans text-white/55">{detail}</p></div></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-6"><div><p className="mb-3 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#a4864d]">Shop by ritual</p><h2 className="text-4xl md:text-6xl">Find your kind<br /><em className="font-normal text-[#a4864d]">of natural.</em></h2></div><Link href="/shop" className="group hidden items-center gap-2 border-b border-[#19372f] pb-2 text-xs font-sans font-bold uppercase tracking-[0.18em] md:flex">View all products <Arrow /></Link></div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{categories.map((category) => <Link href={`/shop?category=${category.name}`} key={category.name} className="group relative aspect-[0.8] overflow-hidden bg-[#d8d1c3]"><img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#102e27]/80 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 text-[#f8f5ed]"><p className="text-2xl italic md:text-3xl">{category.name}</p><p className="mt-1 text-[10px] font-sans uppercase tracking-[0.2em] text-white/70">{category.label}</p></div></Link>)}</div>
        <Link href="/shop" className="group mt-8 flex items-center justify-center gap-2 border-b border-[#19372f] pb-2 text-center text-xs font-sans font-bold uppercase tracking-[0.18em] md:hidden">View all products <Arrow /></Link>
      </section>

      <section className="bg-[#e8e2d5] px-6 py-20 md:px-12 md:py-28"><div className="mx-auto max-w-7xl"><div className="mb-10 flex items-end justify-between"><div><p className="mb-3 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#a4864d]">Loved by many</p><h2 className="text-4xl md:text-6xl">The everyday<br /><em className="font-normal text-[#a4864d]">essentials.</em></h2></div><Link href="/shop" className="group hidden items-center gap-2 text-xs font-sans font-bold uppercase tracking-[0.18em] md:flex">Shop all <Arrow /></Link></div><div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-6">{bestSellers.map((product) => <Link href="/shop" key={product.name} className="group"><div className="relative aspect-square overflow-hidden bg-[#f6f3ed]"><img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply transition duration-700 group-hover:scale-105" /><span className="absolute left-3 top-3 bg-[#19372f] px-2 py-1 text-[9px] font-sans font-bold uppercase tracking-[0.15em] text-white">Bestseller</span></div><div className="mt-4 flex items-start justify-between gap-2"><div><p className="text-lg leading-tight md:text-xl">{product.name}</p><p className="mt-2 text-[10px] font-sans font-semibold tracking-[0.18em] text-[#a4864d]">{product.category}</p></div><span className="text-sm font-sans">{product.price}</span></div><p className="mt-1 text-xs font-sans text-[#8a877d] line-through">{product.mrp}</p></Link>)}</div></div></section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-2 md:px-12 md:py-28"><div className="relative min-h-[420px] overflow-hidden bg-[#19372f]"><img src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=85" alt="Raw herbal ingredients" className="absolute inset-0 h-full w-full object-cover opacity-65" /><div className="absolute inset-0 bg-gradient-to-t from-[#19372f] to-transparent" /><div className="relative flex h-full min-h-[420px] flex-col justify-end p-8 text-[#f8f5ed] md:p-12"><p className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#d6b875]">The Guna standard</p><h2 className="mt-4 max-w-md text-4xl md:text-5xl">What goes on you should be good enough to go back to nature.</h2><Link href="/policies" className="mt-8 flex w-fit items-center gap-2 border-b border-white/50 pb-2 text-xs font-sans font-bold uppercase tracking-[0.18em]">Our promise <Arrow /></Link></div></div><div className="flex flex-col justify-center"><p className="mb-4 text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#a4864d]">From our home to yours</p><h2 className="text-4xl leading-tight md:text-6xl">Beauty that<br /><em className="font-normal text-[#a4864d]">remembers.</em></h2><p className="mt-7 max-w-md text-base leading-7 text-[#54635c]">Our formulas are inspired by recipes shared across generations in Tamil homes. We keep the ingredients close to their natural form, the batches considered, and the experience distinctly human.</p><div className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-[#d8d1c3] pt-6">{[['55+', 'Guna products'], ['2018', 'Since our first batch'], ['100%', 'Handcrafted care'], ['627811', 'Our Tenkasi pin']].map(([value, label]) => <div key={label}><p className="text-2xl text-[#19372f]">{value}</p><p className="mt-1 text-[10px] font-sans uppercase tracking-[0.16em] text-[#8a877d]">{label}</p></div>)}</div></div></section>

      <section className="bg-[#19372f] px-6 py-20 text-center text-[#f8f5ed] md:px-12 md:py-24"><p className="text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#d6b875]">Stay close to nature</p><h2 className="mx-auto mt-5 max-w-2xl text-4xl md:text-6xl">A little goodness,<br /><em className="font-normal text-[#d6b875]">in your inbox.</em></h2><p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/65">New launches, rituals, and notes from Tenkasi. No noise, just the good stuff.</p><form className="mx-auto mt-8 flex max-w-md border-b border-white/40 pb-3" onSubmit={(event) => event.preventDefault()}><input type="email" required placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-white/40" /><button className="text-xs font-sans font-bold uppercase tracking-[0.16em] text-[#d6b875]">Subscribe</button></form></section>
    </main>
  );
}
