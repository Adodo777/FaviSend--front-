import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Shield, CheckCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function EmailVerificationPage() {
    const [, navigate] = useLocation();
    const { toast } = useToast();
    const isProcessingRef = useRef(false);

    // États pour gérer les étapes
    const [step, setStep] = useState("email"); // 'email', 'code'
    const [email, setEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Étape 1: Demander le code par email
    const handleEmailSubmit = useCallback(async (e) => {
        e.preventDefault();

        // Prévenir les doubles soumissions
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
                setStep("code"); // Transition immédiate
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

    // Étape 2: Vérifier le code
    const handleCodeVerification = useCallback(async (e) => {
        e.preventDefault();

        // Prévenir les doubles soumissions
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

    const handleEmailChange = useCallback((e) => {
        setEmail(e.target.value);
        setError("");
    }, []);

    const handleCodeChange = useCallback((e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 8);
        setVerificationCode(value);
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
                    {step === "email" ? (
                        <>
                            <Alert className="border-blue-200 bg-blue-50">
                                <Mail className="h-4 w-4" />
                                <AlertDescription className="text-blue-800">
                                    Saisissez votre adresse email pour recevoir un code de vérification et accéder à vos achats.
                                </AlertDescription>
                            </Alert>

                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Adresse email</label>
                                    <Input
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={handleEmailChange}
                                        className={error ? "border-red-500" : ""}
                                    />
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading || !email}>
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Envoyer le code
                                        </>
                                    )}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Alert className="border-green-200 bg-green-50">
                                <Mail className="h-4 w-4" />
                                <AlertDescription className="text-green-800">
                                    Un code de vérification à 8 chiffres a été envoyé à :<br />
                                    <strong>{email}</strong>
                                </AlertDescription>
                            </Alert>

                            <form onSubmit={handleCodeVerification} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Code de vérification (8 chiffres)</label>
                                    <Input
                                        type="text"
                                        placeholder="12345678"
                                        value={verificationCode}
                                        onChange={handleCodeChange}
                                        className={`text-center text-lg tracking-widest ${error ? "border-red-500" : ""}`}
                                        maxLength={8}
                                    />
                                    {error && <p className="text-red-500 text-sm">{error}</p>}
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading || verificationCode.length !== 8}>
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Vérification...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Vérifier l'accès
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600">Vous n'avez pas reçu le code ?</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={resendCode} className="flex-1" disabled={isLoading}>
                                        Renvoyer le code
                                    </Button>
                                    <Button variant="ghost" onClick={goBackToEmail} className="flex-1" disabled={isLoading}>
                                        Changer l'email
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
