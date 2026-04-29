export default function Footer() {
  return (
    <footer className="border-t-4 border-black bg-zinc-100 py-6 px-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-zinc-900"></div>
          <span className="font-black text-sm tracking-widest uppercase">RADIX SYSTEM v2.0</span>
        </div>
        <div className="text-xs font-mono text-zinc-500 tracking-widest">
          <span className="px-2 py-1 bg-zinc-200 text-zinc-800 font-bold">PROD_BUILD</span>
          <span className="ml-4">SECURE_MEDICAL_ENV</span>
        </div>
      </div>
    </footer>
  );
}