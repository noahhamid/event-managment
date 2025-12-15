"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Sparkles, Users, TrendingUp, ArrowRight, Zap, Heart } from "lucide-react"

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = containerRef.current?.querySelectorAll(".fade-in-element")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden">
      {/* Floating animated shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-[15%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 left-[20%] w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent hover:scale-105 transition-transform"
          >
            CampusHub
          </Link>
          <div className="flex gap-4">
            <Button asChild variant="ghost" className="hover:scale-105 transition-transform">
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 hover:scale-105 transition-transform shadow-lg shadow-purple-500/25"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-6">
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="fade-in-element opacity-0 translate-y-4 transition-all duration-700">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-500/20 animate-pulse-soft">
              <Sparkles className="h-4 w-4 animate-spin-slow" />
              Welcome to Campus Events
            </div>
          </div>

          {/* Main Heading with staggered animation */}
          <div className="fade-in-element opacity-0 translate-y-4 transition-all duration-700 delay-100">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground text-balance leading-tight">
              <span className="inline-block animate-slide-up">Discover</span>{" "}
              <span className="inline-block animate-slide-up animation-delay-100">Amazing</span>{" "}
              <span className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">
                Events
              </span>{" "}
              <span className="inline-block animate-slide-up animation-delay-200">on</span>{" "}
              <span className="inline-block animate-slide-up animation-delay-300">Campus</span>
            </h1>
          </div>

          {/* Subheading */}
          <div className="fade-in-element opacity-0 translate-y-4 transition-all duration-700 delay-200">
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Stay connected with your campus community. Discover events, connect with peers, and never miss out on
              what's happening around you.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="fade-in-element opacity-0 translate-y-4 transition-all duration-700 delay-300 flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              asChild
              size="lg"
              className="text-base group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105"
            >
              <Link href="/signup" className="flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-base bg-transparent border-2 border-purple-500/50 hover:bg-purple-500/10 hover:scale-105 transition-all"
            >
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>

          {/* Animated stats */}
          <div className="fade-in-element opacity-0 translate-y-4 transition-all duration-700 delay-400 pt-12">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { value: "500+", label: "Events", icon: Calendar },
                { value: "2K+", label: "Students", icon: Users },
                { value: "50K+", label: "Interactions", icon: Heart },
              ].map((stat, i) => (
                <div key={i} className="text-center group hover:scale-110 transition-transform cursor-default">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="h-5 w-5 text-purple-500 group-hover:animate-bounce" />
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                      {stat.value}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="fade-in-element opacity-0 translate-y-4 transition-all duration-700 text-4xl md:text-5xl font-bold mb-4">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                CampusHub
              </span>
              ?
            </h2>
            <p className="fade-in-element opacity-0 translate-y-4 transition-all duration-700 delay-100 text-lg text-muted-foreground">
              Experience the best way to discover and engage with campus events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Discover Events",
                description: "Browse through exciting campus events tailored to your interests with advanced filtering",
                color: "blue",
              },
              {
                icon: Users,
                title: "Connect & Engage",
                description: "Like, comment, and react with emojis. Join the conversation and build connections",
                color: "purple",
              },
              {
                icon: TrendingUp,
                title: "Stay Updated",
                description: "Never miss trending events and campus announcements with real-time updates",
                color: "pink",
              },
              {
                icon: Sparkles,
                title: "Beautiful Feed",
                description: "Enjoy a clean, intuitive interface inspired by the best social platforms",
                color: "blue",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Experience blazing fast performance with instant page loads and smooth animations",
                color: "purple",
              },
              {
                icon: Heart,
                title: "Community Driven",
                description: "Build your profile, showcase your interests, and grow your campus network",
                color: "pink",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="fade-in-element opacity-0 translate-y-4 transition-all duration-700 group"
                style={{ transitionDelay: `${(index + 4) * 100}ms` }}
              >
                <div className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full hover:-translate-y-2 hover:border-purple-500/30">
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-${feature.color}-500/20 to-purple-500/20 group-hover:from-${feature.color}-500/40 group-hover:to-purple-500/40 transition-all group-hover:scale-110`}
                  >
                    <feature.icon className={`h-6 w-6 text-${feature.color}-500 group-hover:animate-pulse`} />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold group-hover:text-purple-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border p-12 lg:p-20 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
          <h2 className="fade-in-element opacity-0 translate-y-4 transition-all duration-700 text-4xl font-bold mb-6">
            Ready to Join the{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Campus Community
            </span>
            ?
          </h2>
          <p className="fade-in-element opacity-0 translate-y-4 transition-all duration-700 delay-100 text-lg text-muted-foreground mb-8">
            Sign up now and start discovering amazing events happening on campus today.
          </p>
          <Button
            asChild
            size="lg"
            className="fade-in-element opacity-0 translate-y-4 transition-all duration-700 delay-200 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all"
          >
            <Link href="/signup" className="flex items-center gap-2">
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2025 CampusHub. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in { animation: fadeInUp 0.7s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float 8s ease-in-out infinite; animation-delay: 2s; }
        .animate-float-slow { animation: float 10s ease-in-out infinite; animation-delay: 4s; }
        .animate-gradient-x { background-size: 200% 200%; animation: gradient-x 3s ease infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; opacity: 0; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        .animate-pulse-soft { animation: pulse 2s ease-in-out infinite; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  )
}
