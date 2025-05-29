import { useEffect, useState } from "react";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../lib/queryClient";

export default function CheckoutStatus() {
  const [params] = useSearchParams();
  const paymentId = params.get("paymentId");
  const fileId = params.get("fileId");

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        //const res = await fetch(`/api/payments/${paymentId}`);
        const res = await apiRequest("GET", `/api/payments/${paymentId}`, null, {
          "Content-Type": "application/json",
        });
        const data = await res.json();

        if (res.ok && data.status === "success" && data.fileId === fileId) {
          setDownloadUrl(data.downloadUrl); // ex: lien signé S3
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setStatus("error");
      }
    };

    if (paymentId && fileId) {
      verifyPayment();
    } else {
      setStatus("error");
    }
  }, [paymentId, fileId]);

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-card p-6 rounded-xl border border-border shadow-md text-center space-y-5">
        {status === "loading" && (
          <>
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <h2 className="text-lg font-semibold">Vérification du paiement en cours…</h2>
            <p className="text-muted-foreground text-sm">
              Nous finalisons la validation de votre transaction.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
            <h2 className="text-lg font-semibold">Paiement validé ✅</h2>
            <p className="text-muted-foreground text-sm">Votre fichier est prêt à être téléchargé.</p>
            <a
              href={downloadUrl}
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium shadow hover:opacity-90 transition"
            >
              Télécharger maintenant
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500" />
            <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
            <p className="text-muted-foreground text-sm">
              Impossible de confirmer le paiement. Veuillez vérifier votre lien ou contacter le support.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
