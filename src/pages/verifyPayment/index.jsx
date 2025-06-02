import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useQueries } from "@tanstack/react-query";

export default function VerifyPaiementPage() {
  const [params] = useSearchParams();
  const paymentId = params.get("paymentId");
  const fileId = params.get("fileId");

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [downloadUrl, setDownloadUrl] = useState(null);

  const { data, isLoading, error,} = useQueries({
    queryKey: [`/api/purchase/verify/${paymentId}`],
    enabled: !!paymentId,
  });

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-card p-6 rounded-xl shadow-lg border border-border text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Vérification du paiement...</h2>
            <p className="text-muted-foreground text-sm">
              Un instant, nous validons votre transaction.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
            <h2 className="text-xl font-bold">Paiement validé ✅</h2>
            <p className="text-muted-foreground text-sm">
              Merci pour votre paiement. Vous pouvez maintenant télécharger votre fichier.
            </p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-primary text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition"
            >
              📥 Télécharger maintenant
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500" />
            <h2 className="text-xl font-bold">Erreur lors de la vérification</h2>
            <p className="text-muted-foreground text-sm">
              Paiement introuvable ou non encore validé. Si le problème persiste, contactez le support.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
