import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import ProductPreview from "@/components/landing/ProductPreview";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <Hero />

      <ProductPreview />

      <section
        id="features"
        className="mx-auto max-w-6xl px-6 py-28"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
          Features
        </p>

        <h2 className="mt-3 text-4xl font-semibold tracking-tight">
          Everything you need to improve your resume.
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["ATS Score", "Understand how your resume performs against ATS systems."],
            ["Keyword Analysis", "Discover missing keywords recruiters are looking for."],
            ["Job Matching", "Compare your resume against any job description."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6 transition hover:border-white/[0.16]"
            >
              <h3 className="text-lg font-medium">{title}</h3>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-t border-white/[0.06] py-28"
      >
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
            How it works
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Upload Resume", "Upload your PDF or DOCX resume."],
              ["02", "Add Job Description", "Paste the job you're applying for."],
              ["03", "Get AI Insights", "Receive your score and actionable recommendations."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="border-t border-white/[0.1] pt-6"
              >
                <span className="text-sm text-zinc-600">{number}</span>

                <h3 className="mt-8 text-xl font-medium">{title}</h3>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 text-sm text-zinc-500 sm:flex-row">
          <span>© 2026 ResumeAI</span>
          <span>AI-powered career intelligence.</span>
        </div>
      </footer>
    </main>
  );
}