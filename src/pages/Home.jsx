import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import EmailAnalyzer from "../components/EmailAnalyzer";
import { ResultCard, TrainingData } from "../components/ResultCard";
import Dashboard from "../components/Dashboard";
import Features from "../components/Features";
import Stats from "../components/Stats";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-indigo-300 via-purple-300 to-indigo-100 min-h-screen text-gray-800">
      <Navbar />
      <Hero />
      <main className="space-y-16 mt-10">
        <EmailAnalyzer />
        <section className="max-w-4xl mx-auto space-y-4">
          <ResultCard />
          <TrainingData />
        </section>
        <Dashboard />
        <Features />
        <Stats />
      </main>
      <Footer />
    </div>
  );
}
