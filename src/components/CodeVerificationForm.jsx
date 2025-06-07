
import { useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle } from "lucide-react";

export default function CodeVerificationForm({
  email,
  verificationCode,
  onCodeChange,
  onSubmit,
  onResendCode,
  onGoBackToEmail,
  isLoading,
  error,
}) {
  const handleCodeChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    onCodeChange(value);
  }, [onCodeChange]);

  return (
    <>
      <Alert className="border-green-200 bg-green-50">
        <Mail className="h-4 w-4" />
        <AlertDescription className="text-green-800">
          Un code de vérification à 8 chiffres a été envoyé à :<br />
          <strong>{email}</strong>
        </AlertDescription>
      </Alert>

      <form onSubmit={onSubmit} className="space-y-4">
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
          <Button variant="outline" onClick={onResendCode} className="flex-1" disabled={isLoading}>
            Renvoyer le code
          </Button>
          <Button variant="ghost" onClick={onGoBackToEmail} className="flex-1" disabled={isLoading}>
            Changer l'email
          </Button>
        </div>
      </div>
    </>
  );
}
