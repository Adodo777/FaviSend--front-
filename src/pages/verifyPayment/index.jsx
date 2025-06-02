import React, { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function VerifyPayment() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get("paymentId");

    const { user } = useAuth();
    const { toast } = useToast();

    const { data, isLoading, error } = useQuery({
        queryKey: [`/api/payments/verify/${paymentId}`],
        enabled: !!paymentId,
    });
    const navigate = useNavigate();
    const { mutate: verifyPayment } = useMutation({
        mutationFn: async () => {
            if (!paymentId) throw new Error("Payment ID is required");
            return apiRequest("POST", `/api/payments/verify/${paymentId}`);
        },
        onSuccess: (data) => {
            toast({
                title: "Paiement vérifié",
                description: "Votre paiement a été vérifié avec succès.",
            });
            navigate(`/file/${data.fileId}`);
        },
        onError: (error) => {
            console.error("Erreur lors de la vérification du paiement:", error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: `Impossible de vérifier le paiement: ${error.message || error}`,
            });
        },
    });
    useEffect(() => {
        if (data) {
            verifyPayment();
        }
    }, [data, verifyPayment]);
    useEffect(() => {
        if (error) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: `Impossible de vérifier le paiement: ${error.message || error}`,
            });
            navigate("/");
        }
    }, [error, toast, navigate]);
    return (
        <div className="flex items-center justify-center h-screen">
            {isLoading ? (
                <div className="text-center">
                    <p>Vérification du paiement en cours...</p>
                </div>
            ) : (
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Vérification du paiement</h1>
                    <p>Veuillez patienter pendant que nous vérifions votre paiement.</p>
                </div>
            )}
        </div>
    );
}