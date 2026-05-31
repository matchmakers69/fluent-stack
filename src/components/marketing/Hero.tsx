export function Hero() {
  return (
    <section className="md:min-h-screen grid grid-cols-1 md:grid-cols-[3fr_2fr]">
      <div className="bg-accent/20" />
      <div className="hidden md:block bg-secondary/20" />
    </section>
  );
}
