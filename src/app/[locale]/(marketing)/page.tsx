import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-10 py-32 px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Button Variants
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sticker-style — resize the window to see responsive sizing
          </p>
        </div>

        {/* size="xs" */}
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">xs</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="xs">Default</Button>
            <Button variant="yellow" size="xs">Yellow</Button>
            <Button variant="pink" size="xs">Pink</Button>
            <Button variant="lavender" size="xs">Lavender</Button>
            <Button variant="cyan" size="xs">Cyan</Button>
          </div>
        </div>

        {/* size="sm" */}
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">sm</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="sm">Default</Button>
            <Button variant="yellow" size="sm">Yellow</Button>
            <Button variant="pink" size="sm">Pink</Button>
            <Button variant="lavender" size="sm">Lavender</Button>
            <Button variant="cyan" size="sm">Cyan</Button>
          </div>
        </div>

        {/* size="default" */}
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">default</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button>Default</Button>
            <Button variant="yellow">Yellow</Button>
            <Button variant="pink">Pink</Button>
            <Button variant="lavender">Lavender</Button>
            <Button variant="cyan">Cyan</Button>
          </div>
        </div>

        {/* size="lg" */}
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">lg</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg">Default</Button>
            <Button variant="yellow" size="lg">Yellow</Button>
            <Button variant="pink" size="lg">Pink</Button>
            <Button variant="lavender" size="lg">Lavender</Button>
            <Button variant="cyan" size="lg">Cyan</Button>
          </div>
        </div>

        {/* asChild — renders as <a> */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">asChild (link)</p>
          <Button asChild variant="yellow" size="lg">
            <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
              Go to Next.js
            </a>
          </Button>
        </div>

        {/* auth variants — designed for dark/coloured backgrounds */}
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">auth (navbar)</p>
          <div className="flex flex-wrap justify-center gap-4 bg-[oklch(0.28_0.18_278)] p-8 rounded-2xl w-full">
            <Button variant="auth-signin">Sign In</Button>
            <Button variant="auth-signup">Sign Up</Button>
            <Button variant="auth-signout">Sign Out</Button>
            <Button variant="white">White</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
