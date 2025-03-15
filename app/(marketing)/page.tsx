import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HomeRobotLogo } from "@/components/home-robot-logo"
import {
  CheckCircle,
  FileText,
  Image,
  Upload,
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Brain,
} from "lucide-react"
import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const session = await getAuthSession()

  // If user is already authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <HomeRobotLogo size={36} />
            <span className="text-xl font-bold">NoteBuddy</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#study-tools"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Study Tools
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Reduced top padding */}
      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-b from-background to-muted/50">
        <div className="container px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                <span className="text-muted-foreground">Introducing NoteBuddy 1.0</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Your AI-Powered <span className="text-primary">Note-Taking</span> Assistant
              </h1>
              <p className="text-xl text-muted-foreground">
                Organize your thoughts, capture ideas, and boost your productivity with NoteBuddy's intelligent
                note-taking platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <Button size="lg" asChild>
                  <Link href="/login" className="px-8">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">See Features</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                <GraduationCap className="h-5 w-5 text-primary" />
                <p>Perfect for students, researchers, and lifelong learners</p>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-lg border bg-background p-2 shadow-xl">
                <div className="rounded-md bg-muted p-1">
                  <div className="flex items-center gap-2 border-b bg-muted p-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-xs font-medium">NoteBuddy - My Notes</div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="h-8 w-3/4 rounded-md bg-muted-foreground/20"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-full rounded-md bg-muted-foreground/20"></div>
                        <div className="h-4 w-full rounded-md bg-muted-foreground/20"></div>
                        <div className="h-4 w-2/3 rounded-md bg-muted-foreground/20"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 rounded-md bg-primary/80"></div>
                        <div className="h-6 w-16 rounded-md bg-muted-foreground/20"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 h-12 w-12 animate-bounce">
                  <HomeRobotLogo size={48} />
                </div>
              </div>
              <div className="absolute -z-10 h-32 w-32 rounded-full bg-primary/30 blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        </div>
        {/* Background elements */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/5 to-secondary/5 -z-10"></div>
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 h-60 w-60 rounded-full bg-secondary/10 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to capture, organize, and access your notes from anywhere.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <FileText className="h-10 w-10 text-primary" />,
                title: "Rich Text Editing",
                description: "Create beautifully formatted notes with our intuitive rich text editor.",
              },
              {
                icon: <Image className="h-10 w-10 text-primary" />,
                title: "File Attachments",
                description: "Attach images, PDFs, and other files directly to your notes.",
              },
              {
                icon: <Search className="h-10 w-10 text-primary" />,
                title: "Powerful Search",
                description: "Find anything instantly with our lightning-fast search capabilities.",
              },
              {
                icon: <Upload className="h-10 w-10 text-primary" />,
                title: "Cloud Sync",
                description: "Access your notes from any device with automatic cloud synchronization.",
              },
              {
                icon: <Sparkles className="h-10 w-10 text-primary" />,
                title: "AI Assistance",
                description: "Get smart suggestions and help organizing your content.",
              },
              {
                icon: <CheckCircle className="h-10 w-10 text-primary" />,
                title: "Offline Access",
                description: "Keep working even when you're offline with automatic syncing when reconnected.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How NoteBuddy Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and transform your note-taking experience.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Sign Up",
                description: "Create your free account in seconds and get started right away.",
              },
              {
                step: "02",
                title: "Create Notes",
                description: "Use our powerful editor to create rich, formatted notes and attach files.",
              },
              {
                step: "03",
                title: "Access Anywhere",
                description: "Your notes sync automatically across all your devices.",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-bold text-primary/10 absolute -top-6 left-0">{step.step}</div>
                <div className="relative pt-8 pl-4">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Button size="lg" asChild>
              <Link href="/login">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Study Tools Section (Replacing Testimonials) - Removed medical student testimonial */}
      <section id="study-tools" className="py-20 bg-background">
        <div className="container px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supercharge Your Studies</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              NoteBuddy is designed to help students excel in their academic journey.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <BookOpen className="h-10 w-10 text-primary" />,
                title: "Lecture Notes",
                description:
                  "Capture key points during lectures with our distraction-free editor. Add highlights and organize information as you go.",
              },
              {
                icon: <GraduationCap className="h-10 w-10 text-primary" />,
                title: "Exam Preparation",
                description:
                  "Create concise summaries of your material. Use our AI to help identify key concepts for better retention.",
              },
              {
                icon: <Brain className="h-10 w-10 text-primary" />,
                title: "Research Projects",
                description:
                  "Collect sources, organize research findings, and collaborate with classmates on group projects.",
              },
            ].map((tool, index) => (
              <div key={index} className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="mb-4">{tool.icon}</div>
                <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                <p className="text-muted-foreground">{tool.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 rounded-lg border bg-muted/30">
            <h3 className="text-2xl font-bold mb-4">Academic Success with NoteBuddy</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="mb-4">
                  Students who use NoteBuddy report improved academic performance and more efficient study sessions.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Less time spent searching for information</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Improved retention through organized note-taking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Better collaboration on group projects</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Enhanced focus with distraction-free writing environment</span>
                  </li>
                </ul>
              </div>
              <div className="bg-background rounded-lg p-6 border flex flex-col justify-center">
                <h4 className="font-bold text-lg mb-2">Study Smarter, Not Harder</h4>
                <p className="text-muted-foreground">
                  NoteBuddy helps you organize your study materials, create effective summaries, and prepare for exams
                  more efficiently. Our AI-powered tools can help identify knowledge gaps and suggest areas for review.
                </p>
                <div className="mt-4">
                  <Button asChild>
                    <Link href="/login">
                      Try NoteBuddy for Your Studies
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container px-4 md:px-8">
          <div className="rounded-xl bg-gradient-to-r from-primary to-primary-foreground p-8 md:p-12 shadow-lg">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Ace Your Studies?</h2>
                <p className="text-xl text-white/80 mb-6">
                  Join students and researchers who have transformed their learning experience with NoteBuddy.
                </p>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/login">
                    Start for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <div className="absolute -top-10 -left-10 h-20 w-20">
                  <HomeRobotLogo size={80} className="animate-bounce" />
                </div>
                <div className="rounded-lg bg-white/10 backdrop-blur-sm p-6 border border-white/20">
                  <div className="space-y-4">
                    <div className="h-6 w-3/4 rounded-md bg-white/20"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded-md bg-white/20"></div>
                      <div className="h-4 w-full rounded-md bg-white/20"></div>
                      <div className="h-4 w-2/3 rounded-md bg-white/20"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-20 rounded-md bg-white/30"></div>
                      <div className="h-8 w-20 rounded-md bg-white/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HomeRobotLogo size={32} />
                <span className="text-lg font-bold">NoteBuddy</span>
              </div>
              <p className="text-muted-foreground">
                Your AI-powered note-taking assistant for capturing and organizing your thoughts.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} NoteBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

