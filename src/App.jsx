import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth.jsx";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import MobileNavBar from "./components/layout/MobileNavBar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Explore from "@/pages/explore";
import CheckoutPage from "./pages/checkout";
import PaymentVerificationPage from "./components/PaymentVerification.jsx";
import File from "@/pages/file";
import Auth from "@/pages/auth";
import Profile from "@/pages/profil";
import EmailVerificationPage from "./pages/purchasePage/EmailVerificationPage.jsx";
import MyPurchasesPage from "./pages/purchasePage/MyPurchasesPage.jsx";
import { useIsMobile } from "./hooks/use-mobile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/dashboard" component={Dashboard}/>
      <Route path="/explore" component={Explore}/>
      <Route path="/file/:id" component={File}/>
      <Route path="/auth" component={Auth}/>
      <Route path="/checkout/:fileId" component={CheckoutPage}/>
      <Route path="/payment-verification" component={PaymentVerificationPage}/>
      <Route path="/email-verification" component={EmailVerificationPage}/>
      <Route path="/my-purchases" component={MyPurchasesPage}/>
      <Route path="/profil" component={Profile}/>
      <Route path="*" component={NotFound} />
    </Switch>
  );
}

function App() {
  const isMobile = useIsMobile();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Router />
            </main>
            <Footer />
            {isMobile && <MobileNavBar />}
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
