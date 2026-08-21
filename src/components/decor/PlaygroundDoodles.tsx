export function PlaygroundDoodles({
  tone = "public",
}: {
  tone?: "public" | "app";
}) {
  const overlay = tone === "app" ? "bg-white/70" : "bg-white/55";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="playground-doodles" />
      <span className="absolute start-3 top-[22%] hidden sm:block">
        <Balloon />
      </span>
      <span className="absolute end-4 top-[26%] hidden md:block">
        <StarBurst />
      </span>
      <span className="absolute start-5 bottom-[14%] hidden lg:block">
        <Kite />
      </span>
      <span className="absolute end-6 bottom-[16%] hidden sm:block">
        <PaperPlane />
      </span>
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
}

function Balloon() {
  return (
    <svg width="58" height="92" viewBox="0 0 54 86" fill="none" aria-hidden>
      <ellipse cx="27" cy="28" rx="20" ry="26" fill="#424CF3" fillOpacity="0.55" stroke="#424CF3" strokeWidth="2.6" />
      <path d="M27 54c0 10-7 16-6 28" stroke="#1A1A1A" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 52h12l-6 6z" fill="#F9B428" />
    </svg>
  );
}

function StarBurst() {
  return (
    <svg width="62" height="62" viewBox="0 0 58 58" fill="none" aria-hidden>
      <path
        d="M29 4l7 16 18 2-13 12 4 17-16-9-16 9 4-17-13-12 18-2z"
        fill="#F9B428"
        fillOpacity="0.8"
        stroke="#EA6622"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Kite() {
  return (
    <svg width="70" height="84" viewBox="0 0 64 78" fill="none" aria-hidden>
      <path d="M32 4l24 28-24 18L8 32z" fill="#4BC2FC" fillOpacity="0.55" stroke="#424CF3" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M32 32c6 12 2 20 10 34" stroke="#EA6622" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PaperPlane() {
  return (
    <svg width="78" height="52" viewBox="0 0 72 48" fill="none" aria-hidden>
      <path d="M4 26L68 6 38 44 30 30z" fill="#EA6622" fillOpacity="0.5" stroke="#EA6622" strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M30 30L68 6" stroke="#424CF3" strokeWidth="1.8" />
    </svg>
  );
}
