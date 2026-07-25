import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { buttonVariants } from "../components/ui/Button";

const STEPS = [
  {
    title: "Create Your Profile",
    description: "Tell us about your reading preferences and interests.",
    icon: "📚",
  },
  {
    title: "Find Your Community",
    description: "Connect with readers who share your literary tastes.",
    icon: "🤝",
  },
  {
    title: "Start Sharing",
    description: "Join discussions and share your favorite books.",
    icon: "💭",
  },
];

const FEATURES = [
  {
    title: "Personalized Matching",
    description: "Find readers with similar interests and reading habits.",
    icon: "🎯",
  },
  {
    title: "Reading Groups",
    description: "Join or create reading groups for focused discussions.",
    icon: "👥",
  },
  {
    title: "Book Recommendations",
    description: "Get personalized book suggestions from your community.",
    icon: "📖",
  },
];

const LandingPage = () => {
  return (
    <div className="animate-fade-in">
      <section className="relative bg-paper py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink leading-tight">
                Find Your Perfect Reading Community
              </h1>
              <p className="text-xl text-ink-muted">
                Connect with fellow book lovers, join reading groups, and
                discover your next favorite book through personalized
                recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className={buttonVariants("primary", "text-center")}>
                  Get Started
                </Link>
                <Link to="/login" className={buttonVariants("outline", "text-center")}>
                  Already have an account?
                </Link>
              </div>
            </div>
            <div className="relative lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
              <img
                src="../../Images/readingCommunity.jpg"
                alt="Reading Community"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center text-ink mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <Card key={step.title} className="text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-ink mb-2">{step.title}</h3>
                <p className="text-ink-muted">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-paper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center text-ink mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                hover
                className="hover:scale-105 transition-transform duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-ink mb-2">{feature.title}</h3>
                <p className="text-ink-muted">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-accent py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-8">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your journey with fellow book lovers today.
          </p>
          <Link to="/signup" className={buttonVariants("secondary", "bg-white text-accent hover:bg-white/90")}>
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
