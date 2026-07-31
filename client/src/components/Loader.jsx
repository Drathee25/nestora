export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-24 text-[#1f4d36]/40 text-sm">
      {label}
    </div>
  );
}
