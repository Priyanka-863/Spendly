import { Button } from "@/components/ui/button";
import { BarChart3, Loader2, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  const features = [
    {
      icon: TrendingUp,
      title: "Track Every Dollar",
      desc: "Log expenses by category and payment method with ease.",
    },
    {
      icon: BarChart3,
      title: "Visual Analytics",
      desc: "Beautiful charts showing your spending patterns and trends.",
    },
    {
      icon: ShieldCheck,
      title: "Secure on ICP",
      desc: "Your data is stored on-chain — private and decentralized.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* Left panel - branding */}
      <div className="sidebar-gradient dot-grid-bg flex-1 flex flex-col justify-center items-center p-10 lg:p-16 min-h-[40vh] lg:min-h-screen relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-sidebar-foreground">
              Spendly
            </span>
          </div>

          <h1 className="font-display font-bold text-4xl lg:text-5xl text-sidebar-foreground leading-tight mb-4">
            Your finances,
            <br />
            <span className="text-sidebar-primary">crystal clear.</span>
          </h1>
          <p className="text-sidebar-foreground/70 text-lg mb-12 font-sans">
            Track expenses, monitor investments, and visualize your financial
            health — all on the blockchain.
          </p>

          <div className="space-y-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-sidebar-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sidebar-foreground text-sm">
                    {f.title}
                  </p>
                  <p className="text-sidebar-foreground/60 text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - login */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to access your financial dashboard
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-12 font-semibold text-base rounded-xl"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in with Internet Identity"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Your data is secured on the Internet Computer Protocol blockchain.
              No passwords, no emails — just your identity.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
