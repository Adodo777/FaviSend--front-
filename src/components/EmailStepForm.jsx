
import { useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight } from "lucide-react";

export default function EmailStepForm({
  email,
  onEmailChange,
  onSubmit,
  isLoading,
  error,
}) {
  const handleEmailChange = useCallback((e) => {
    onEmailChange(e.target.value);
  }, [onEmailChange]);

  return (
    <>
      <Alert className="border-blue-200 bg-blue-50">
        <Mail className="h-4 w-4" />
        <AlertDescription className="text-blue-800">
          Saisissez votre adresse email pour recevoir un code de vérification et accéder à vos achats.
        </AlertDescription>
      </Alert>

      <form onSubmit={onSubmit} className="space-y-4">
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
  );
}
