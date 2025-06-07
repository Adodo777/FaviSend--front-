
import { useState, useRef, useCallback, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const EmailStepForm = lazy(() => import("@/components/EmailStepForm"));
const CodeVerificationForm = lazy(() => import("@/components/CodeVerificationForm"));

const LoadingFallback = () => (
  <div className="space-y-4">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

export default function EmailVerificationPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const isProcessingRef = useRef(false);

    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleEmailSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (isProcessingRef.current || isLoading) return;

        if (!email || !email.includes("@")) {
            setError("Veuillez saisir une adresse email valide");
            return;
        }

        isProcessingRef.current = true;
        setIsLoading(true);
        setError("");

        try {
            const response = await apiRequest("POST", "/api/auth/request-verification", {
                email,
            });

            if (response.success) {
                toast({
                    title: "Code envoyé",
                    description: "Un code de vérification à 8 chiffres a été envoyé à votre email",
                });
                setStep("code");
                isProcessingRef.current = false;
            } else {
                setError("Erreur lors de l'envoi du code");
                isProcessingRef.current = false;
            }
        } catch (err) {
            setError("Erreur lors de l'envoi du code. Veuillez réessayer.");
            console.error("Request error:", err);
            isProcessingRef.current = false;
        } finally {
            setIsLoading(false);
        }
    }, [email, isLoading, toast]);

    const handleCodeVerification = useCallback(async (e) => {
        e.preventDefault();

        if (isProcessingRef.current || isLoading) return;

        if (!verificationCode || verificationCode.length !== 8) {
            setError("Le code de vérification doit contenir 8 chiffres");
            return;
        }

        isProcessingRef.current = true;
        setIsLoading(true);
        setError("");

        try {
            const response = await apiRequest("POST", "/api/auth/verify-code", {
                email,
                verificationCode,
            });

            if (response.success && response.accessToken) {
                localStorage.setItem("accessToken", response.accessToken);
                localStorage.setItem("userEmail", email);

                toast({
                    title: "Vérification réussie",
                    description: "Accès autorisé à vos achats",
                });

                navigate("/my-purchases");
                isProcessingRef.current = false;
            } else {
                setError("Code de vérification incorrect");
                isProcessingRef.current = false;
            }
        } catch (err) {
            setError("Erreur lors de la vérification. Veuillez réessayer.");
            console.error("Verification error:", err);
            isProcessingRef.current = false;
        } finally {
            setIsLoading(false);
        }
    }, [email, verificationCode, isLoading, toast, navigate]);

    const resendCode = useCallback(async () => {
        if (isProcessingRef.current) return;

        try {
            await apiRequest("POST", "/api/auth/request-verification", { email });
            toast({
                title: "Code renvoyé",
                description: "Un nouveau code de vérification a été envoyé à votre email",
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible de renvoyer le code",
            });
        }
    }, [email, toast]);

    const goBackToEmail = useCallback(() => {
        if (isProcessingRef.current) return;

        setStep("email");
        setVerificationCode("");
        setError("");
    }, []);

    const handleEmailChange = useCallback((newEmail) => {
        setEmail(newEmail);
        setError("");
    }, []);

    const handleCodeChange = useCallback((newCode) => {
        setVerificationCode(newCode);
        setError("");
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    {step === "email" ? (
                        <>
                            <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                            <CardTitle className="text-blue-800">Accès à vos achats</CardTitle>
                        </>
                    ) : (
                        <>
                            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                            <CardTitle className="text-blue-800">Vérification d'accès</CardTitle>
                        </>
                    )}
                </CardHeader>

                <CardContent className="space-y-6">
                    <Suspense fallback={<LoadingFallback />}>
                        {step === "email" ? (
                            <EmailStepForm
                                email={email}
                                onEmailChange={handleEmailChange}
                                onSubmit={handleEmailSubmit}
                                isLoading={isLoading}
                                error={error}
                            />
                        ) : (
                            <CodeVerificationForm
                                email={email}
                                verificationCode={verificationCode}
                                onCodeChange={handleCodeChange}
                                onSubmit={handleCodeVerification}
                                onResendCode={resendCode}
                                onGoBackToEmail={goBackToEmail}
                                isLoading={isLoading}
                                error={error}
                            />
                        )}
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
