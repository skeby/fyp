import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Target,
  TrendingUp,
  Star,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Mail,
  BookOpen,
  Zap,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero Section */}
      <section className="from-background to-card h-screen w-full bg-gradient-to-br">
        <div className="max-w-res my-auto px-6 py-12 md:py-24 lg:py-32 xl:py-40">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="secondary" className="px-3 py-1">
                🎯 Adaptive MCQ Testing Platform
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Master Data Structures with{" "}
                <span className="text-primary">Adaptive Testing</span>
              </h1>
              <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl">
                Test your knowledge with multiple choice questions that adapt to
                your ability level. Our system adjusts question difficulty based
                on your performance to optimize learning.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Start Testing Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </div>
            <div className="text-muted-foreground flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 from 10k+ learners</span>
              </div>
              <div>•</div>
              <div>Completely free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="max-w-res px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="outline">Features</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                How AdaptLearn Works
              </h2>
              <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our adaptive testing system continuously evaluates your ability
                and adjusts question difficulty to provide the optimal learning
                challenge.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-8">
              <div className="grid gap-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <Target className="text-primary h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">
                      Adaptive Question Difficulty
                    </h3>
                    <p className="text-muted-foreground">
                      Questions automatically adjust in difficulty based on your
                      performance. Get harder questions when you're doing well,
                      easier ones when you need more practice.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-chart-2/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <BarChart3 className="text-chart-2 h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Ability Estimation</h3>
                    <p className="text-muted-foreground">
                      Our system continuously estimates your ability level based
                      on your responses to provide personalized question
                      selection and track your progress.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-chart-3/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <TrendingUp className="text-chart-3 h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Performance Tracking</h3>
                    <p className="text-muted-foreground">
                      Monitor your learning progress with detailed analytics
                      showing your ability growth across different data
                      structure topics.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-chart-4/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                    <BookOpen className="text-chart-4 h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Data Structures Focus</h3>
                    <p className="text-muted-foreground">
                      Comprehensive coverage of data structures concepts
                      including arrays, linked lists, trees, graphs, and more
                      with targeted MCQ assessments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="flex items-center justify-center"> */}
            <div className="relative">
              <div className="from-primary/20 to-chart-1/20 absolute inset-0 rounded-lg bg-gradient-to-r opacity-75 blur"></div>
              <div className="bg-card relative rounded-lg border p-8 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Ability Progress</h4>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Arrays & Strings</span>
                      <span className="text-chart-2">Level 7.2</span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className="bg-chart-2 h-2 rounded-full"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Linked Lists</span>
                      <span className="text-primary">Level 6.8</span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: "68%" }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Trees & Graphs</span>
                      <span className="text-chart-3">Level 5.4</span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className="bg-chart-3 h-2 rounded-full"
                        style={{ width: "54%" }}
                      ></div>
                    </div>
                    <div className="border-border border-t pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Overall Ability</span>
                        <span className="text-primary font-semibold">
                          Level 6.5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* </div> */}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-muted/30 w-full py-12 md:py-24 lg:py-32">
        <div className="max-w-res px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="outline">Testimonials</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                What Our Learners Say
              </h2>
              <p className="text-muted-foreground max-w-[900px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of students and professionals who have improved
                their data structures knowledge with AdaptLearn.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                    <span className="text-primary font-semibold">SJ</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">Sarah Johnson</CardTitle>
                    <CardDescription>CS Student at Stanford</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  "The adaptive testing helped me identify exactly where I was
                  struggling with data structures. The questions got harder as I
                  improved, keeping me challenged."
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="bg-chart-2/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                    <span className="text-chart-2 font-semibold">MC</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">Michael Chen</CardTitle>
                    <CardDescription>Software Engineer</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  "Perfect for interview prep! The ability tracking showed me my
                  progress in real-time. I could see myself getting better at
                  tree algorithms."
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="bg-chart-3/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                    <span className="text-chart-3 font-semibold">ER</span>
                  </div>
                  <div>
                    <CardTitle className="text-base">Emily Rodriguez</CardTitle>
                    <CardDescription>Bootcamp Graduate</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  "Coming from a bootcamp, I needed to strengthen my CS
                  fundamentals. The MCQ format made it easy to practice during
                  short breaks."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary text-primary-foreground w-full py-12 md:py-24 lg:py-32">
        <div className="max-w-res px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Ready to Test Your Knowledge?
              </h2>
              <p className="text-primary-foreground/80 mx-auto max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join over 50,000 learners who have improved their data
                structures understanding with adaptive MCQ testing.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  Start Testing Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="!border-secondary bg-transparent"
              >
                View Sample Questions
              </Button>
            </div>
            <div className="text-primary-foreground/80 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <CheckCircle className="mr-1 h-4 w-4" />
                <span>100% Free</span>
              </div>
              <div>•</div>
              <div className="flex items-center">
                <Zap className="mr-1 h-4 w-4" />
                <span>No registration required</span>
              </div>
              <div>•</div>
              <div className="flex items-center">
                <Brain className="mr-1 h-4 w-4" />
                <span>Adaptive difficulty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card w-full py-6">
        <div className="max-w-res px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">AdaptLearn</h3>
              <p className="text-muted-foreground text-sm">
                Adaptive MCQ testing platform for data structures education.
              </p>
              <div className="flex space-x-3">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Github className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Platform</h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Data Structures Tests
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Ability Tracking
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Progress Analytics
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Sample Questions
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Resources</h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Study Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">About</h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Research
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-border mt-8 flex flex-col items-center justify-between border-t pt-4 sm:flex-row">
            <p className="text-muted-foreground text-xs">
              © 2024 AdaptLearn. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs">
              Made with ❤️ for data structures learners
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
